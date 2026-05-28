import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// --- Prompt Pipeline ---

const BASE_PROMPT = `You are NexoMind, an AI mental clarity and journaling reflection engine.

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

const COMPANION_BLOCK = `

REFLECTION STYLE: Companion
- Be empathetic and supportive in your observations
- Acknowledge emotional difficulty before offering clarity
- Frame distortions gently as "patterns worth noticing"
- Use language like "you might consider" rather than directives`;

const CHALLENGER_BLOCK = `

REFLECTION STYLE: Challenger
- Name cognitive distortions directly and specifically
- Avoid validating language that is unsupported by evidence
- Include a concrete reframe for each identified distortion
- Be direct and growth-focused while remaining respectful
- Use language like "this is catastrophizing" rather than softening`;

const VOICE_BLOCK = `

VOICE CONTEXT:
The user recorded this entry via voice. Acoustic analysis detected the following:
- Speaking pace: {{pace_wpm}} words per minute
- Hesitation ratio: {{hesitation_ratio}} (proportion of filler words/pauses)
- Tonal variability: {{tonal_variability_hz}} Hz standard deviation

Consider these signals in your analysis:
- A slow pace with high hesitation may indicate uncertainty or processing difficulty
- Rapid pace with low variability may suggest rehearsed avoidance
- High tonal variability can indicate emotional activation
Reference these observations naturally in your insight when relevant.`;

const CONTEXT_BLOCK = `

BIOMETRIC & CALENDAR CONTEXT (last 24 hours):
{{context_lines}}

Factor these signals into your analysis:
- Poor sleep or low HRV may correlate with heightened emotional reactivity
- Heavy meeting load can indicate cognitive fatigue or reduced self-reflection time
- Use this context to inform, not override, your clinical observations
Mention relevant biometric context when it naturally supports your insight.`;

type ReflectionMode = "companion" | "challenger";

interface VoiceFeatures {
  pace_wpm: number;
  hesitation_ratio: number;
  tonal_variability_hz: number;
}

interface ContextSignals {
  sleep_minutes: number | null;
  hrv_avg: number | null;
  meeting_count_24h: number | null;
  meeting_minutes_24h: number | null;
  source_versions?: Record<string, string>;
}

interface ComposeOptions {
  mode: ReflectionMode;
  persona?: string | null;
  voiceFeatures?: VoiceFeatures;
  contextSignals?: ContextSignals | null;
}

function composeSystemPrompt(options: ComposeOptions): string {
  const { mode, persona, voiceFeatures, contextSignals } = options;
  let prompt = BASE_PROMPT;

  if (mode === "challenger") {
    prompt += CHALLENGER_BLOCK;
  } else {
    prompt += COMPANION_BLOCK;
  }

  // PERSONA_BLOCK: appended after mode block
  if (persona) {
    prompt += `\n\nMENTOR PERSONA VOICE:\n${persona}`;
  }

  if (voiceFeatures) {
    prompt += VOICE_BLOCK
      .replace("{{pace_wpm}}", String(voiceFeatures.pace_wpm))
      .replace("{{hesitation_ratio}}", String(voiceFeatures.hesitation_ratio))
      .replace("{{tonal_variability_hz}}", String(voiceFeatures.tonal_variability_hz));
  }

  if (contextSignals) {
    const lines: string[] = [];
    if (contextSignals.sleep_minutes !== null) {
      const hrs = Math.floor(contextSignals.sleep_minutes / 60);
      const mins = contextSignals.sleep_minutes % 60;
      lines.push(`- Sleep: ${hrs}h ${mins}m`);
    }
    if (contextSignals.hrv_avg !== null) {
      lines.push(`- HRV average: ${contextSignals.hrv_avg} ms`);
    }
    if (contextSignals.meeting_count_24h !== null) {
      lines.push(`- Meetings (24h): ${contextSignals.meeting_count_24h} meetings, ${contextSignals.meeting_minutes_24h ?? 0} minutes total`);
    }
    if (lines.length > 0) {
      prompt += CONTEXT_BLOCK.replace("{{context_lines}}", lines.join("\n"));
    }
  }

  return prompt;
}

// --- End Prompt Pipeline ---

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

    const body = await req.json();
    const { content, voice_features } = body as {
      content: string;
      voice_features?: VoiceFeatures;
    };
    if (typeof content !== "string" || content.trim().length < 2 || content.length > 10000) {
      return new Response(JSON.stringify({ error: "Invalid content" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Free-tier enforcement: 3 analyses / rolling 7 days for non-premium users.
    // Uses the service role client for an authoritative count that bypasses RLS.
    const FREE_WEEKLY_LIMIT = 3;
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // E2EE gate: if user has e2ee_enabled, analysis must happen on-device
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
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: isPremiumData, error: premErr } = await admin.rpc("is_premium", {
      _user_id: userId,
    });
    if (premErr) console.error("is_premium check failed", premErr);
    const isPremium = !!isPremiumData;

    if (!isPremium) {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count, error: countErr } = await admin
        .from("journal_analysis")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", since);
      if (countErr) throw countErr;
      const used = count ?? 0;

      if (used >= FREE_WEEKLY_LIMIT) {
        return new Response(
          JSON.stringify({
            error: "Free limit reached. Upgrade to Premium for unlimited analyses.",
            code: "FREE_LIMIT_REACHED",
            limit: FREE_WEEKLY_LIMIT,
            used,
            remaining: 0,
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    // Resolve reflection mode and active persona from user profile
    let reflectionMode: ReflectionMode = "companion";
    let personaVoiceBlock: string | null = null;
    try {
      const { data: profile } = await admin
        .from("profiles")
        .select("reflection_mode, active_mentor_persona, you_mentor_profile")
        .eq("id", userId)
        .maybeSingle();
      if (profile?.reflection_mode === "challenger") {
        reflectionMode = "challenger";
      }
      // Resolve persona voice block
      if (profile?.active_mentor_persona) {
        if (profile.active_mentor_persona === "you_mentor") {
          // Construct personalized voice_block from you_mentor_profile
          const ymp = profile.you_mentor_profile as {
            themes?: string[];
            vocab?: string[];
            reframe_style?: string;
          } | null;
          if (ymp) {
            const parts: string[] = [];
            if (ymp.themes?.length) {
              parts.push(`Focus on these themes the user cares about: ${ymp.themes.join(", ")}.`);
            }
            if (ymp.vocab?.length) {
              parts.push(`Use vocabulary the user resonates with: ${ymp.vocab.join(", ")}.`);
            }
            if (ymp.reframe_style) {
              parts.push(`Reframing style: ${ymp.reframe_style}`);
            }
            if (parts.length > 0) {
              personaVoiceBlock = parts.join(" ");
            }
          }
        } else {
          // Look up curated persona voice_block
          const { data: persona } = await admin
            .from("mentor_personas")
            .select("voice_block")
            .eq("key", profile.active_mentor_persona)
            .maybeSingle();
          if (persona?.voice_block) {
            personaVoiceBlock = persona.voice_block;
          }
        }
      }
    } catch (e) {
      console.warn("Failed to read reflection_mode/persona, defaulting to companion", e);
    }

    // Fetch context signals from connected integrations (5s timeout, non-blocking)
    let contextSignals: ContextSignals | null = null;
    try {
      const { data: integrationCount } = await admin
        .from("user_integrations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      if (integrationCount && (integrationCount as any) > 0) {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const INTERNAL_SECRET = Deno.env.get("INTERNAL_FUNCTION_SECRET") ?? "";
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        try {
          const csResp = await fetch(`${SUPABASE_URL}/functions/v1/fetch-context-signals`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SERVICE_KEY}`,
              apikey: SERVICE_KEY,
              "Content-Type": "application/json",
              "x-internal-secret": INTERNAL_SECRET,
            },
            body: JSON.stringify({ user_id: userId }),
            signal: controller.signal,
          });
          clearTimeout(timeout);
          if (csResp.ok) {
            contextSignals = await csResp.json();
          }
        } catch (e) {
          clearTimeout(timeout);
          console.warn("context signals fetch failed (non-fatal)", e);
        }
      }
    } catch (e) {
      console.warn("context signals check failed (non-fatal)", e);
    }

    const systemPrompt = composeSystemPrompt({ mode: reflectionMode, persona: personaVoiceBlock, voiceFeatures: voice_features, contextSignals });

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
          { role: "system", content: systemPrompt },
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

    // 4) store analysis (with reflection_mode, voice features, and context signals)
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
        reflection_mode: reflectionMode,
        ...(contextSignals ? { context_signals: contextSignals } : {}),
        ...(voice_features
          ? {
              is_voice_entry: true,
              voice_pace_wpm: voice_features.pace_wpm,
              voice_hesitation_ratio: voice_features.hesitation_ratio,
              voice_tonal_variability_hz: voice_features.tonal_variability_hz,
            }
          : {}),
      })
      .select()
      .single();
    if (aErr) throw aErr;

    // Fire-and-forget: update the user's Mind Map graph
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
      const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      fetch(`${SUPABASE_URL}/functions/v1/update-mind-map`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SERVICE_KEY}`,
          apikey: SERVICE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          journal_id: journal.id,
          analysis: {
            summary: parsed.summary,
            emotional_state: parsed.emotional_state,
            cognitive_patterns: parsed.cognitive_patterns,
            key_thoughts: parsed.key_thoughts,
            distortions_or_biases: parsed.distortions_or_biases,
            clarity_insight: parsed.clarity_insight,
          },
        }),
      }).catch((err) => console.warn("mind map fire-and-forget failed", err));
    } catch (e) { console.warn("mind map dispatch err", e); }

    // Fire-and-forget: crisis detection (if enabled for user)
    try {
      const { data: crisisProfile } = await admin
        .from("profiles")
        .select("crisis_detection_enabled")
        .eq("id", userId)
        .maybeSingle();

      if (crisisProfile?.crisis_detection_enabled) {
        const { data: crisisDisclaimer } = await admin
          .from("disclaimer_acceptances")
          .select("id")
          .eq("user_id", userId)
          .eq("feature_key", "crisis_detection")
          .maybeSingle();

        if (crisisDisclaimer) {
          const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
          const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
          fetch(`${SUPABASE_URL}/functions/v1/detect-crisis`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SERVICE_KEY}`,
              apikey: SERVICE_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: userId,
              journal_id: journal.id,
              analysis_id: analysis.id,
              key_thoughts: parsed.key_thoughts ?? [],
              summary: parsed.summary ?? "",
              ...(voice_features ? {
                voice_pace_wpm: voice_features.pace_wpm,
                voice_hesitation_ratio: voice_features.hesitation_ratio,
                voice_tonal_variability_hz: voice_features.tonal_variability_hz,
              } : {}),
            }),
          }).catch((err) => console.warn("crisis detection fire-and-forget failed", err));
        }
      }
    } catch (e) { console.warn("crisis detection dispatch err", e); }


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
      usage = { limit: FREE_WEEKLY_LIMIT, used, remaining: Math.max(FREE_WEEKLY_LIMIT - used, 0) };
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
