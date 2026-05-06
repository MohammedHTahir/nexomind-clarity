// Public SEO AI helper. Two modes:
//   - "stream"   → streams a brief grounded reflection (Instant AI Demo)
//   - "analyze"  → returns structured overthinking analysis JSON
// No auth required. Uses Lovable AI Gateway (LOVABLE_API_KEY).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

const STREAM_SYSTEM = `You are NexoMind — a calm AI reflection engine. The user shares a thought.
Reply in 3 short paragraphs (max 90 words total):
1) Reflect what's underneath in one sentence.
2) Name the emotional pattern in one sentence.
3) Offer one grounded takeaway (no advice clichés).
Tone: minimal, premium, non-clinical. No bullet points. No headers.`;

const ANALYZE_SYSTEM = `You are NexoMind. Given a thought, return STRICT JSON via the provided tool.
Be precise, calm, non-clinical. Each field 1 short sentence (max 22 words).`;

const analyzeTool = {
  type: "function",
  function: {
    name: "analyze_overthinking",
    description: "Return structured overthinking analysis.",
    parameters: {
      type: "object",
      properties: {
        trigger: { type: "string", description: "What likely triggered the loop." },
        thought_loop: { type: "string", description: "The shape of the recurring loop." },
        distortion: { type: "string", description: "The cognitive distortion at play." },
        clarity: { type: "string", description: "One grounded takeaway toward clarity." },
      },
      required: ["trigger", "thought_loop", "distortion", "clarity"],
      additionalProperties: false,
    },
  },
};

function rateLimitResponse(status: number) {
  const msg =
    status === 429
      ? "Too many requests right now. Please try again in a minute."
      : "AI usage limit reached. Please try again later.";
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mode, content } = await req.json();
    if (typeof content !== "string" || content.trim().length < 2 || content.length > 4000) {
      return new Response(JSON.stringify({ error: "Invalid content" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const text = content.trim();

    if (mode === "analyze") {
      const r = await fetch(GATEWAY, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: ANALYZE_SYSTEM },
            { role: "user", content: text },
          ],
          tools: [analyzeTool],
          tool_choice: { type: "function", function: { name: "analyze_overthinking" } },
        }),
      });
      if (r.status === 429 || r.status === 402) return rateLimitResponse(r.status);
      if (!r.ok) {
        const t = await r.text();
        console.error("analyze error", r.status, t);
        return new Response(JSON.stringify({ error: "AI error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const data = await r.json();
      const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      const parsed = args ? JSON.parse(args) : null;
      if (!parsed) {
        return new Response(JSON.stringify({ error: "No analysis returned" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // stream mode (default)
    const r = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        messages: [
          { role: "system", content: STREAM_SYSTEM },
          { role: "user", content: text },
        ],
      }),
    });
    if (r.status === 429 || r.status === 402) return rateLimitResponse(r.status);
    if (!r.ok || !r.body) {
      const t = await r.text().catch(() => "");
      console.error("stream error", r.status, t);
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(r.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("seo-ai", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
