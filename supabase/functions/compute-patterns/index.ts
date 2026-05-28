// Daily cron: detect spiraling time-of-week patterns per user from last 30 days.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface JournalRow {
  id: string;
  user_id: string;
  created_at: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    // Look back 30 days; entries indicate moments user opened journal (likely a spiral)
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: journals, error } = await admin
      .from("journals")
      .select("id, user_id, created_at")
      .gte("created_at", since)
      .limit(50000);
    if (error) throw error;
    const rows = (journals ?? []) as JournalRow[];

    // Group by user
    const byUser = new Map<string, JournalRow[]>();
    for (const r of rows) {
      const arr = byUser.get(r.user_id) ?? [];
      arr.push(r);
      byUser.set(r.user_id, arr);
    }

    let patternsWritten = 0;

    for (const [userId, entries] of byUser) {
      if (entries.length < 5) continue;

      // Bucket by DOW × hour
      const buckets = new Map<string, number>();
      for (const e of entries) {
        const d = new Date(e.created_at);
        const key = `${d.getUTCDay()}-${d.getUTCHours()}`;
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }

      // Get user's top theme from mind map (used as the "what" of the pattern)
      const { data: topTheme } = await admin
        .from("mind_nodes")
        .select("id, label")
        .eq("user_id", userId)
        .eq("type", "theme")
        .order("frequency", { ascending: false })
        .limit(1)
        .maybeSingle();

      for (const [key, count] of buckets) {
        if (count < 3) continue;
        const confidence = Math.min(1, count / Math.max(8, entries.length / 4));
        if (confidence < 0.4) continue;
        const [dowStr, hourStr] = key.split("-");
        const dow = Number(dowStr);
        const hour = Number(hourStr);

        await admin.from("user_patterns").upsert(
          {
            user_id: userId,
            pattern_type: "time_of_week",
            day_of_week: dow,
            hour_of_day: hour,
            theme_node_id: topTheme?.id ?? null,
            theme_label: topTheme?.label ?? null,
            sample_size: count,
            confidence,
            computed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,pattern_type,day_of_week,hour_of_day" },
        );
        patternsWritten++;
      }
    }

    // --- Distortion Recurrence Detection ---
    // For each user, scan last 7 journal_analysis rows within a rolling 14-day window.
    // If any distortion label appears in >= 3 of those 7 analyses, upsert a
    // user_patterns row with pattern_type='distortion_recurrence'.
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();

    // Get distinct user IDs from recent analyses
    const { data: recentAnalyses, error: analysesError } = await admin
      .from("journal_analysis")
      .select("user_id, distortions_or_biases, created_at")
      .gte("created_at", fourteenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(50000);
    if (analysesError) throw analysesError;

    const analysesByUser = new Map<string, { distortions_or_biases: string[]; created_at: string }[]>();
    for (const row of recentAnalyses ?? []) {
      const arr = analysesByUser.get(row.user_id) ?? [];
      arr.push(row);
      analysesByUser.set(row.user_id, arr);
    }

    for (const [userId, analyses] of analysesByUser) {
      // Take only the last 7 analyses (already sorted desc)
      const recent = analyses.slice(0, 7);
      if (recent.length < 3) continue;

      // Count distortion labels across the recent analyses
      const distortionCounts = new Map<string, number>();
      for (const a of recent) {
        const distortions = a.distortions_or_biases ?? [];
        // Count each distortion once per analysis (not per occurrence within an analysis)
        const seen = new Set<string>();
        for (const d of distortions) {
          if (!seen.has(d)) {
            seen.add(d);
            distortionCounts.set(d, (distortionCounts.get(d) ?? 0) + 1);
          }
        }
      }

      // Upsert patterns for distortions appearing in >= 3 analyses
      for (const [label, count] of distortionCounts) {
        if (count < 3) continue;
        const confidence = Math.min(1, count / recent.length);

        await admin.from("user_patterns").upsert(
          {
            user_id: userId,
            pattern_type: "distortion_recurrence",
            day_of_week: null,
            hour_of_day: null,
            theme_node_id: null,
            theme_label: null,
            distortion_label: label,
            last_distortion_seen_at: recent[0].created_at,
            sample_size: count,
            confidence,
            computed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,pattern_type,day_of_week,hour_of_day" },
        );
        patternsWritten++;
      }
    }

    return new Response(
      JSON.stringify({ users: byUser.size, patterns_written: patternsWritten }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("compute-patterns error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
