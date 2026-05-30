import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Crisis detection patterns (weighted)
// These patterns indicate hopelessness, self-harm ideation, or severe distress
//
// TODO: These patterns match against LLM-generated key_thoughts and summary, not raw
// journal text. If the LLM softens or rephrases language (e.g., "I want to end it" becomes
// "The user expresses desire for finality"), patterns will not trigger. Consider:
//   1. Running pattern matching on raw journal content before LLM processing
//   2. Adding a dedicated crisis-screening step in the LLM prompt that returns a
//      boolean signal before the main analysis rewrites user language
//   3. Using both raw text and summary for pattern matching
const CRISIS_PATTERNS: { pattern: RegExp; weight: number }[] = [
  { pattern: /\b(end(ing)?\s+(it|my\s+life|everything))\b/i, weight: 0.35 },
  { pattern: /\b(no\s+(point|reason)\s+(in|to)\s+(living|going\s+on))\b/i, weight: 0.30 },
  { pattern: /\b(want(s?|ing)?\s+to\s+(die|disappear))\b/i, weight: 0.35 },
  { pattern: /\b(kill(ing)?\s+(myself|me))\b/i, weight: 0.40 },
  { pattern: /\b(suicid(e|al))\b/i, weight: 0.40 },
  { pattern: /\b(self[- ]?harm(ing)?)\b/i, weight: 0.30 },
  { pattern: /\b(cut(ting)?\s+(myself|my\s+(wrist|arm)))\b/i, weight: 0.30 },
  { pattern: /\b(hopeless(ness)?)\b/i, weight: 0.15 },
  { pattern: /\b(worthless(ness)?)\b/i, weight: 0.15 },
  { pattern: /\b(can'?t\s+go\s+on)\b/i, weight: 0.25 },
  { pattern: /\b(better\s+off\s+(dead|without\s+me))\b/i, weight: 0.35 },
  { pattern: /\b(no\s+one\s+(would\s+)?(care|notice|miss))\b/i, weight: 0.20 },
];

// Default crisis signal threshold
const DEFAULT_THRESHOLD = 0.6;

interface AnalysisData {
  user_id: string;
  journal_id: string;
  analysis_id: string;
  key_thoughts: string[];
  summary: string;
  voice_pace_wpm?: number;
  voice_hesitation_ratio?: number;
  voice_tonal_variability_hz?: number;
  baseline_pace_wpm?: number;
}

function computeCrisisSignal(data: AnalysisData): number {
  let textScore = 0;

  // Combine key_thoughts and summary for pattern matching
  const textContent = [
    ...(data.key_thoughts || []),
    data.summary || "",
  ].join(" ");

  for (const { pattern, weight } of CRISIS_PATTERNS) {
    if (pattern.test(textContent)) {
      textScore += weight;
    }
  }
  // Cap text score at 0.8
  textScore = Math.min(textScore, 0.8);

  // Voice biomarker delta contribution
  let voiceScore = 0;
  if (
    data.voice_pace_wpm !== undefined &&
    data.baseline_pace_wpm !== undefined &&
    data.voice_hesitation_ratio !== undefined
  ) {
    // Large negative pace deviation (speaking much slower than baseline)
    const paceDeviation = (data.baseline_pace_wpm - data.voice_pace_wpm) / data.baseline_pace_wpm;
    if (paceDeviation > 0.3) {
      voiceScore += 0.1;
    }
    // High hesitation ratio
    if (data.voice_hesitation_ratio > 0.15) {
      voiceScore += 0.1;
    }
  }

  return Math.min(textScore + voiceScore, 1.0);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // 9-second timeout
  const timeoutId = setTimeout(() => {
    // In Deno, we can't easily abort the current handler, but the
    // function platform enforces timeouts. This is a best-effort signal.
  }, 9000);

  try {
    // Internal-only: caller must present the service-role key as Bearer token.
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const presented = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!presented || presented !== serviceKey) {
      clearTimeout(timeoutId);
      return new Response(JSON.stringify({ error: "Forbidden: internal use only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body: AnalysisData = await req.json();
    const { user_id, journal_id, analysis_id } = body;

    if (!user_id || !journal_id || !analysis_id) {
      clearTimeout(timeoutId);
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify crisis detection is enabled for this user
    const { data: profile } = await admin
      .from("profiles")
      .select("crisis_detection_enabled")
      .eq("id", user_id)
      .maybeSingle();

    if (!profile?.crisis_detection_enabled) {
      clearTimeout(timeoutId);
      return new Response(JSON.stringify({ skipped: true, reason: "crisis_detection_disabled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify disclaimer accepted
    const { data: disclaimer } = await admin
      .from("disclaimer_acceptances")
      .select("id")
      .eq("user_id", user_id)
      .eq("feature_key", "crisis_detection")
      .maybeSingle();

    if (!disclaimer) {
      clearTimeout(timeoutId);
      return new Response(JSON.stringify({ skipped: true, reason: "disclaimer_not_accepted" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load threshold from feature_flags config (or use default)
    let threshold = DEFAULT_THRESHOLD;
    try {
      const { data: flagConfig } = await admin
        .from("feature_flags")
        .select("config")
        .eq("key", "crisis_detection")
        .maybeSingle();
      if (flagConfig?.config?.threshold) {
        threshold = Number(flagConfig.config.threshold);
      }
    } catch {
      // Use default threshold
    }

    // Compute crisis signal
    const signalScore = computeCrisisSignal(body);

    // Update journal_analysis with crisis signal
    await admin
      .from("journal_analysis")
      .update({
        crisis_signal: signalScore,
        crisis_signal_threshold_breached: signalScore >= threshold,
      })
      .eq("id", analysis_id);

    // On breach: insert crisis_events row
    if (signalScore >= threshold) {
      await admin.from("crisis_events").insert({
        user_id,
        journal_id,
        signal_score: signalScore,
        threshold,
        trusted_notified: false,
      });
    }

    // NEVER auto-contacts emergency services
    clearTimeout(timeoutId);
    return new Response(
      JSON.stringify({
        signal_score: signalScore,
        threshold,
        breached: signalScore >= threshold,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    clearTimeout(timeoutId);
    console.error("detect-crisis error", e);
    return new Response(
      JSON.stringify({ error: "An internal error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
