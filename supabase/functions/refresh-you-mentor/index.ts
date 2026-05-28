import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MIN_ENTRIES = 30;
const MAX_ENTRIES = 200;

const extractTool = {
  type: "function",
  function: {
    name: "extract_you_mentor",
    description:
      "Extract the user's dominant themes, vocabulary markers, and reframing style from their journal history.",
    parameters: {
      type: "object",
      properties: {
        themes: {
          type: "array",
          items: { type: "string" },
          description: "Up to 5 recurring themes in the user's reflections",
        },
        vocab: {
          type: "array",
          items: { type: "string" },
          description: "Up to 10 dominant vocabulary markers the user frequently uses",
        },
        reframe_style: {
          type: "string",
          description:
            "A 1-2 sentence description of how this user naturally reframes challenges",
        },
      },
      required: ["themes", "vocab", "reframe_style"],
      additionalProperties: false,
    },
  },
};

async function callGemini(body: unknown, apiKey: string) {
  const r = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  return r;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

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
      { global: { headers: { Authorization: authHeader } } }
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // E2EE check
    const { data: profileData } = await admin
      .from("profiles")
      .select("e2ee_enabled")
      .eq("id", userId)
      .maybeSingle();

    if (profileData?.e2ee_enabled) {
      return new Response(
        JSON.stringify({
          error: "E2EE entries must be analyzed on-device",
          code: "E2EE_REQUIRES_CLIENT",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check eligibility: at least MIN_ENTRIES entries with non-empty content
    const { count, error: countErr } = await admin
      .from("journals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .neq("content", "");
    if (countErr) throw countErr;
    const entryCount = count ?? 0;

    if (entryCount < MIN_ENTRIES) {
      return new Response(
        JSON.stringify({
          error: "Insufficient entries",
          code: "INSUFFICIENT_ENTRIES",
          required: MIN_ENTRIES,
          current: entryCount,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Pull last 30-200 analyses
    const { data: analyses, error: aErr } = await admin
      .from("journal_analysis")
      .select("summary, emotional_state, cognitive_patterns, key_thoughts, clarity_insight, suggested_reflection")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(MAX_ENTRIES);
    if (aErr) throw aErr;

    if (!analyses || analyses.length < MIN_ENTRIES) {
      return new Response(
        JSON.stringify({
          error: "Insufficient analyzed entries",
          code: "INSUFFICIENT_ENTRIES",
          required: MIN_ENTRIES,
          current: analyses?.length ?? 0,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    // Build context from analyses
    const analysisSummaries = analyses
      .map(
        (a, i) =>
          `[${i + 1}] State: ${a.emotional_state} | Patterns: ${(a.cognitive_patterns ?? []).join(", ")} | Insight: ${a.clarity_insight} | Thoughts: ${(a.key_thoughts ?? []).join("; ")}`
      )
      .join("\n");

    const systemPrompt = `You are analyzing a user's journal history to build a personalized mentor voice profile.
Extract:
1. themes: the top 5 recurring themes/topics in their reflections
2. vocab: up to 10 vocabulary markers or phrases they frequently use or respond to
3. reframe_style: a 1-2 sentence description of how this user naturally reframes challenges

Be specific and grounded in the data provided.`;

    const aiResp = await callGemini(
      {
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Here are ${analyses.length} recent journal analyses from this user:\n\n${analysisSummaries}`,
          },
        ],
        tools: [extractTool],
        tool_choice: { type: "function", function: { name: "extract_you_mentor" } },
      },
      apiKey
    );

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("Gemini error", aiResp.status, errText);
      throw new Error("AI extraction failed");
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");
    const extracted = JSON.parse(toolCall.function.arguments);

    // Enforce limits
    const themes = (extracted.themes ?? []).slice(0, 5);
    const vocab = (extracted.vocab ?? []).slice(0, 10);
    const reframe_style = extracted.reframe_style ?? "";

    const youMentorProfile = {
      themes,
      vocab,
      reframe_style,
      refreshed_at: new Date().toISOString(),
      source_entry_count: analyses.length,
    };

    // Write to profiles
    const { error: updateErr } = await admin
      .from("profiles")
      .update({ you_mentor_profile: youMentorProfile })
      .eq("id", userId);
    if (updateErr) throw updateErr;

    return new Response(JSON.stringify({ profile: youMentorProfile }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("refresh-you-mentor error", e);
    return new Response(
      JSON.stringify({ error: "An internal error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
