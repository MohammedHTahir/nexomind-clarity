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
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const now = new Date();
    const dow = now.getUTCDay();
    const hour = now.getUTCHours();
    const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString();

    // Pull matching patterns (current hour ± 0; runs hourly so window is exact)
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
