// Hourly cron: find users whose current DOW+hour matches a learned spiral pattern,
// and send a calm pattern-interrupt email. Skips if user journaled today,
// pattern fired in last 5 days, or user disabled the feature.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Internal-only: caller must present the service-role key as Bearer token (pg_cron uses vault).
  const authHeader = req.headers.get("Authorization") ?? "";
  const presented = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!presented || presented !== SERVICE_KEY) {
    return new Response(JSON.stringify({ error: "Forbidden: internal use only" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const now = new Date();
    const dow = now.getUTCDay();
    const hour = now.getUTCHours();
    const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString();
    const oneDayAgo = new Date(Date.now() - 1 * 86400000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    // Pull matching patterns (current hour +/- 0; runs hourly so window is exact)
    const { data: patterns, error } = await admin
      .from("user_patterns")
      .select("id, user_id, day_of_week, hour_of_day, theme_label, sample_size, confidence, last_fired_at")
      .eq("pattern_type", "time_of_week")
      .eq("day_of_week", dow)
      .eq("hour_of_day", hour)
      .gte("confidence", 0.4);
    if (error) throw error;

    let sent = 0;
    for (const p of patterns ?? []) {
      if (p.last_fired_at && p.last_fired_at > fiveDaysAgo) continue;

      // Check preferences
      const { data: prefs } = await admin
        .from("notification_preferences")
        .select("pattern_interrupts_enabled, email_for_interrupts")
        .eq("user_id", p.user_id)
        .maybeSingle();
      if (prefs && prefs.pattern_interrupts_enabled === false) continue;

      // Skip if user already journaled today
      const startToday = new Date();
      startToday.setUTCHours(0, 0, 0, 0);
      const { count: todayCount } = await admin
        .from("journals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", p.user_id)
        .gte("created_at", startToday.toISOString());
      if ((todayCount ?? 0) > 0) continue;

      // Resolve email
      let email = prefs?.email_for_interrupts ?? null;
      if (!email) {
        const { data: profile } = await admin
          .from("profiles")
          .select("email, display_name")
          .eq("id", p.user_id)
          .maybeSingle();
        email = profile?.email ?? null;
      }
      if (!email) continue;

      const { data: profile } = await admin
        .from("profiles")
        .select("display_name")
        .eq("id", p.user_id)
        .maybeSingle();

      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      const { error: sendErr } = await admin.functions.invoke("send-transactional-email", {
        body: {
          templateName: "pattern-interrupt",
          recipientEmail: email,
          idempotencyKey: `pattern-${p.id}-${now.toISOString().slice(0, 10)}`,
          templateData: {
            name: profile?.display_name ?? null,
            dayName: dayNames[dow],
            hour,
            themeLabel: p.theme_label ?? null,
            sampleSize: p.sample_size,
          },
        },
      });
      if (sendErr) {
        console.error("send failed", sendErr);
        continue;
      }

      await admin
        .from("user_patterns")
        .update({ last_fired_at: now.toISOString() })
        .eq("id", p.id);
      sent++;
    }

    // --- Distortion Recurrence Pattern Interrupts ---
    // Find distortion_recurrence patterns not fired within rate-limit windows:
    // 1 per 24h, max 3 per 7d per user.
    const { data: distortionPatterns, error: dpError } = await admin
      .from("user_patterns")
      .select("id, user_id, distortion_label, sample_size, confidence, last_fired_at")
      .eq("pattern_type", "distortion_recurrence")
      .gte("confidence", 0.4);
    if (dpError) throw dpError;

    // Group by user for rate limiting
    const distortionByUser = new Map<string, typeof distortionPatterns>();
    for (const dp of distortionPatterns ?? []) {
      const arr = distortionByUser.get(dp.user_id) ?? [];
      arr.push(dp);
      distortionByUser.set(dp.user_id, arr);
    }

    for (const [userId, userPatterns] of distortionByUser) {
      // Check per-user 24h rate limit (any distortion_recurrence fired in last 24h)
      const firedRecently = userPatterns.some(
        (p) => p.last_fired_at && p.last_fired_at > oneDayAgo
      );
      if (firedRecently) continue;

      // Check 7-day rate limit: max 3 fires in 7 days
      const firedInWeek = userPatterns.filter(
        (p) => p.last_fired_at && p.last_fired_at > sevenDaysAgo
      ).length;
      if (firedInWeek >= 3) continue;

      // Check notification preferences
      const { data: prefs } = await admin
        .from("notification_preferences")
        .select("pattern_interrupts_enabled, pattern_interrupt_channel")
        .eq("user_id", userId)
        .maybeSingle();
      if (prefs && prefs.pattern_interrupts_enabled === false) continue;

      const channel: string = prefs?.pattern_interrupt_channel ?? "push";
      if (channel === "off") continue;

      // Pick the highest-confidence unfired pattern for this user
      const candidates = userPatterns
        .filter((p) => !p.last_fired_at || p.last_fired_at <= oneDayAgo)
        .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
      const target = candidates[0];
      if (!target || !target.distortion_label) continue;

      // Build a body (max 180 chars, no plaintext from entries)
      const body = `You've shown a recurring "${target.distortion_label}" pattern. A moment of awareness can interrupt the loop.`.slice(0, 180);

      if (channel === "push") {
        // Check for validated push subscriptions
        const { data: pushSubs } = await admin
          .from("push_subscriptions")
          .select("id")
          .eq("user_id", userId)
          .limit(1);

        if (pushSubs && pushSubs.length > 0) {
          // Send push notification
          const { error: pushErr } = await admin.functions.invoke("send-push-notification", {
            body: {
              userId,
              title: "Pattern Interrupt",
              body,
            },
          });
          if (pushErr) {
            console.error("push send failed for distortion_recurrence", pushErr);
            // Fall back to banner
            await admin.from("pattern_interrupt_inbox").insert({
              user_id: userId,
              distortion_label: target.distortion_label,
              body,
            });
          }
        } else {
          // No push subscription - fall back to banner
          await admin.from("pattern_interrupt_inbox").insert({
            user_id: userId,
            distortion_label: target.distortion_label,
            body,
          });
        }
      } else {
        // banner-only or free-tier: write to pattern_interrupt_inbox
        await admin.from("pattern_interrupt_inbox").insert({
          user_id: userId,
          distortion_label: target.distortion_label,
          body,
        });
      }

      // Mark as fired
      await admin
        .from("user_patterns")
        .update({ last_fired_at: now.toISOString() })
        .eq("id", target.id);
      sent++;
    }

    return new Response(JSON.stringify({ matched: patterns?.length ?? 0, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fire-pattern-interrupts error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
