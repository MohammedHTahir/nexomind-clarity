import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const THERAPIST_BRIEF_PROMPT = `You are a clinical summarization engine for NexoMind, a journaling platform.
Given a series of journal analyses over the past 30 days, produce a structured therapist brief.

Output MUST be valid JSON with these fields:
- themes: array of up to 5 recurring emotional/cognitive themes (strings)
- distortions: array of up to 3 most frequent cognitive distortions (strings)
- mood_arc: array of objects { date: string (ISO), intensity_score: number, clarity_score: number }
- representative_entries: array of up to 5 objects { journal_id: string, date: string, summary: string, reason: string } -- entries with highest deviation from running averages
- summary: string -- a 500-word clinical summary suitable for a therapist, written in third person

Do NOT include therapeutic recommendations or diagnoses.
Do NOT reference the platform or AI analysis process.
Write as if summarizing for a licensed mental health professional.`;

const tool = {
  type: "function",
  function: {
    name: "submit_therapist_brief",
    description: "Return a structured therapist brief.",
    parameters: {
      type: "object",
      properties: {
        themes: { type: "array", items: { type: "string" }, maxItems: 5 },
        distortions: { type: "array", items: { type: "string" }, maxItems: 3 },
        mood_arc: {
          type: "array",
          items: {
            type: "object",
            properties: {
              date: { type: "string" },
              intensity_score: { type: "number" },
              clarity_score: { type: "number" },
            },
            required: ["date", "intensity_score", "clarity_score"],
          },
        },
        representative_entries: {
          type: "array",
          items: {
            type: "object",
            properties: {
              journal_id: { type: "string" },
              date: { type: "string" },
              summary: { type: "string" },
              reason: { type: "string" },
            },
            required: ["journal_id", "date", "summary", "reason"],
          },
          maxItems: 5,
        },
        summary: { type: "string" },
      },
      required: ["themes", "distortions", "mood_arc", "representative_entries", "summary"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Check E2EE
    const { data: profileData } = await admin
      .from("profiles")
      .select("e2ee_enabled")
      .eq("id", userId)
      .maybeSingle();

    if (profileData?.e2ee_enabled) {
      return new Response(
        JSON.stringify({ error: "E2EE entries must be analyzed on-device", code: "E2EE_REQUIRES_CLIENT" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch last 30 days of journal_analysis
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: analyses, error: aErr } = await admin
      .from("journal_analysis")
      .select("journal_id, created_at, summary, emotional_state, intensity_score, clarity_score, cognitive_patterns, key_thoughts, distortions_or_biases, clarity_insight")
      .eq("user_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: true });

    if (aErr) throw aErr;

    if (!analyses || analyses.length < 3) {
      return new Response(
        JSON.stringify({ error: "Insufficient data for brief generation", code: "INSUFFICIENT_DATA", entries: analyses?.length ?? 0 }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    // 30-second timeout for AI call
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const userContent = `Here are ${analyses.length} journal analyses from the past 30 days:\n\n${JSON.stringify(analyses, null, 2)}`;

    const aiResp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [
            { role: "system", content: THERAPIST_BRIEF_PROMPT },
            { role: "user", content: userContent },
          ],
          tools: [tool],
          tool_choice: { type: "function", function: { name: "submit_therapist_brief" } },
        }),
        signal: controller.signal,
      },
    );
    clearTimeout(timeout);

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error", aiResp.status, errText);
      throw new Error("AI brief generation failed");
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    const brief = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(brief), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-therapist-brief error", e);
    return new Response(
      JSON.stringify({ error: "An internal error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
