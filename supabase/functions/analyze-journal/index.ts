import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are NexoMind, an AI mental clarity and journaling reflection engine.

Your role is NOT therapy and NOT emotional support.

Your role is to:
- Analyze journal entries
- Identify emotional states and cognitive patterns
- Extract underlying thoughts
- Provide structured clarity insights
- Help users understand their thinking

You must be: calm, minimal, structured, insight-driven.

You must NOT: diagnose mental health conditions, give therapy advice, be overly emotional, use motivational clichés.

Always return STRICT structured output via the provided tool.`;

const REFINE_SYSTEM = `You refine psychological insights into clear, plain human-readable reflections.
Avoid jargon. Keep the user's tone calm and grounded. Return strict JSON via the provided tool.`;

const tool = {
  type: "function",
  function: {
    name: "submit_analysis",
    description: "Return a structured analysis of the journal entry.",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string" },
        emotional_state: { type: "string" },
        intensity_score: { type: "integer", minimum: 0, maximum: 100 },
        cognitive_patterns: { type: "array", items: { type: "string" } },
        key_thoughts: { type: "array", items: { type: "string" } },
        distortions_or_biases: { type: "array", items: { type: "string" } },
        clarity_insight: { type: "string" },
        suggested_reflection: { type: "string" },
        clarity_score: { type: "integer", minimum: 0, maximum: 100 },
      },
      required: [
        "summary",
        "emotional_state",
        "intensity_score",
        "cognitive_patterns",
        "key_thoughts",
        "distortions_or_biases",
        "clarity_insight",
        "suggested_reflection",
        "clarity_score",
      ],
      additionalProperties: false,
    },
  },
};

const refineTool = {
  type: "function",
  function: {
    name: "refine",
    description: "Return refined plain-language clarity_insight and suggested_reflection.",
    parameters: {
      type: "object",
      properties: {
        clarity_insight: { type: "string" },
        suggested_reflection: { type: "string" },
      },
      required: ["clarity_insight", "suggested_reflection"],
      additionalProperties: false,
    },
  },
};

// Direct Google Gemini API (no Lovable Gateway).
// We use OpenAI-compatible endpoint Google exposes so the existing
// tools / tool_choice payload works unchanged.
async function callGateway(body: unknown, apiKey: string) {
  const r = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  return r;
}

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

    const { content } = await req.json();
    if (typeof content !== "string" || content.trim().length < 2 || content.length > 10000) {
      return new Response(JSON.stringify({ error: "Invalid content" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Free-tier enforcement: 3 analyses / rolling 30 days for non-premium users.
    // Uses the service role client for an authoritative count that bypasses RLS.
    const FREE_MONTHLY_LIMIT = 3;
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: isPremiumData, error: premErr } = await admin.rpc("is_premium", {
      _user_id: userId,
    });
    if (premErr) console.error("is_premium check failed", premErr);
    const isPremium = !!isPremiumData;

    if (!isPremium) {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count, error: countErr } = await admin
        .from("journal_analysis")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", since);
      if (countErr) throw countErr;
      const used = count ?? 0;

      if (used >= FREE_MONTHLY_LIMIT) {
        return new Response(
          JSON.stringify({
            error: "Free limit reached. Upgrade to Premium for unlimited analyses.",
            code: "FREE_LIMIT_REACHED",
            limit: FREE_MONTHLY_LIMIT,
            used,
            remaining: 0,
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    // 1) insert journal
    const { data: journal, error: jErr } = await supabase
      .from("journals")
      .insert({ user_id: userId, content: content.trim() })
      .select()
      .single();
    if (jErr) throw jErr;

    // 2) primary analysis
    const aiResp = await callGateway(
      {
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze this journal entry:\n\nENTRY:\n${content.trim()}`,
          },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "submit_analysis" } },
      },
      apiKey,
    );

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error", aiResp.status, errText);
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");
    const parsed = JSON.parse(toolCall.function.arguments);

    // 3) optional refine pass for readability
    try {
      const refineResp = await callGateway(
        {
          model: "gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: REFINE_SYSTEM },
            {
              role: "user",
              content: `Refine these into clear, jargon-free language. Keep them short and grounded.\n\nclarity_insight: ${parsed.clarity_insight}\n\nsuggested_reflection: ${parsed.suggested_reflection}`,
            },
          ],
          tools: [refineTool],
          tool_choice: { type: "function", function: { name: "refine" } },
        },
        apiKey,
      );
      if (refineResp.ok) {
        const rd = await refineResp.json();
        const rTool = rd.choices?.[0]?.message?.tool_calls?.[0];
        if (rTool) {
          const r = JSON.parse(rTool.function.arguments);
          parsed.clarity_insight = r.clarity_insight ?? parsed.clarity_insight;
          parsed.suggested_reflection = r.suggested_reflection ?? parsed.suggested_reflection;
        }
      }
    } catch (e) {
      console.warn("Refine pass skipped", e);
    }

    // 4) store analysis
    const { data: analysis, error: aErr } = await supabase
      .from("journal_analysis")
      .insert({
        journal_id: journal.id,
        user_id: userId,
        summary: parsed.summary,
        emotional_state: parsed.emotional_state,
        intensity_score: parsed.intensity_score,
        clarity_score: parsed.clarity_score,
        cognitive_patterns: parsed.cognitive_patterns ?? [],
        key_thoughts: parsed.key_thoughts ?? [],
        distortions_or_biases: parsed.distortions_or_biases ?? [],
        clarity_insight: parsed.clarity_insight,
        suggested_reflection: parsed.suggested_reflection,
      })
      .select()
      .single();
    if (aErr) throw aErr;

    // Recompute usage post-insert so the client can show "X of 3 left"
    let usage: { limit: number | null; used: number; remaining: number | null } = {
      limit: null,
      used: 0,
      remaining: null,
    };
    if (!isPremium) {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await admin
        .from("journal_analysis")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", since);
      const used = count ?? 0;
      usage = { limit: FREE_MONTHLY_LIMIT, used, remaining: Math.max(FREE_MONTHLY_LIMIT - used, 0) };
    }

    return new Response(JSON.stringify({ journal, analysis, usage, isPremium }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-journal error", e);
    return new Response(
      JSON.stringify({ error: "An internal error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
