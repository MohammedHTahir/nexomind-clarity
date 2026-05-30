// Extracts entities from a journal analysis, merges them into the user's
// mind map (mind_nodes), and links co-occurrences (mind_edges).
// Called fire-and-forget from analyze-journal AND directly for backfill.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

type NodeType = "theme" | "emotion" | "person" | "distortion" | "trigger";
type ExtractedEntity = { type: NodeType; label: string };

const EXTRACT_SYSTEM = `You extract structured psychological entities from a journal analysis.
Return entities only — no commentary.
Rules:
- type "theme": recurring life themes (e.g. "work validation", "fear of abandonment", "sunday dread"). 1-3 word noun phrases.
- type "emotion": single-word feelings (e.g. "anxious", "lonely", "hopeful").
- type "person": named or role-based people the user mentions (e.g. "mom", "alex", "boss"). lowercase.
- type "distortion": cognitive distortions (e.g. "catastrophizing", "mind reading", "all-or-nothing").
- type "trigger": specific triggering events (e.g. "missed deadline", "unread text", "criticism").
Be thorough. Extract all relevant entities. Max 50 total entities. All labels lowercase, 1-4 words.`;

const extractTool = {
  type: "function",
  function: {
    name: "extract_entities",
    description: "Return structured entities from the analysis.",
    parameters: {
      type: "object",
      properties: {
        entities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["theme", "emotion", "person", "distortion", "trigger"] },
              label: { type: "string" },
            },
            required: ["type", "label"],
            additionalProperties: false,
          },
        },
      },
      required: ["entities"],
      additionalProperties: false,
    },
  },
};

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, " ").slice(0, 80);
}

async function callLovableAI(body: unknown, apiKey: string) {
  return fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function embed(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const r = await fetch(`${GATEWAY}/embeddings`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/text-embedding-3-small",
        input: text,
        dimensions: 1536,
      }),
    });
    if (!r.ok) {
      console.warn("embed failed", r.status, await r.text());
      return null;
    }
    const d = await r.json();
    return d?.data?.[0]?.embedding ?? null;
  } catch (e) {
    console.warn("embed err", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Internal-only: caller must present the service-role key as Bearer token.
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const presented = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!presented || presented !== serviceKey) {
      return new Response(JSON.stringify({ error: "Forbidden: internal use only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_id, journal_id, analysis } = await req.json();
    if (!user_id || !journal_id || !analysis) {
      return new Response(JSON.stringify({ error: "missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not set");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Build a compact prompt from the analysis
    const userPayload = [
      `summary: ${analysis.summary ?? ""}`,
      `emotional_state: ${analysis.emotional_state ?? ""}`,
      `cognitive_patterns: ${(analysis.cognitive_patterns ?? []).join(", ")}`,
      `key_thoughts: ${(analysis.key_thoughts ?? []).join(" | ")}`,
      `distortions_or_biases: ${(analysis.distortions_or_biases ?? []).join(", ")}`,
      `clarity_insight: ${analysis.clarity_insight ?? ""}`,
    ].join("\n");

    // 1) Extract entities
    const aiResp = await callLovableAI(
      {
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: EXTRACT_SYSTEM },
          { role: "user", content: userPayload },
        ],
        tools: [extractTool],
        tool_choice: { type: "function", function: { name: "extract_entities" } },
      },
      apiKey,
    );

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("extract err", aiResp.status, t);
      console.error("mindmap_extraction_failed", { user_id, journal_id, status: aiResp.status });
      return new Response(JSON.stringify({ ok: true, error: "mindmap_extraction_failed" }), {
        status: 200, // non-fatal — don't block journal flow
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const args = aiData?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) {
      return new Response(JSON.stringify({ ok: true, entities: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(args) as { entities: ExtractedEntity[] };
    const entities = (parsed.entities ?? [])
      .map((e) => ({ type: e.type, label: normalize(e.label) }))
      .filter((e) => e.label.length >= 1 && e.label.length <= 80)
      .slice(0, 50);

    if (entities.length === 0) {
      return new Response(JSON.stringify({ ok: true, entities: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) For each entity: find/merge or create a node
    const nodeIds: string[] = [];
    for (const ent of entities) {
      // Try exact normalized match first (fast path)
      const { data: existing } = await admin
        .from("mind_nodes")
        .select("id")
        .eq("user_id", user_id)
        .eq("type", ent.type)
        .eq("label_normalized", ent.label)
        .maybeSingle();

      if (existing?.id) {
        await admin
          .from("mind_nodes")
          .update({
            frequency: undefined, // computed below
            last_seen_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        // increment frequency atomically via raw rpc isn't available — refetch+update
        await admin.rpc as unknown;
        const { data: cur } = await admin
          .from("mind_nodes")
          .select("frequency")
          .eq("id", existing.id)
          .single();
        if (cur) {
          await admin
            .from("mind_nodes")
            .update({ frequency: (cur.frequency ?? 1) + 1, last_seen_at: new Date().toISOString() })
            .eq("id", existing.id);
        }
        nodeIds.push(existing.id);
        await admin
          .from("mind_node_entries")
          .insert({ user_id, node_id: existing.id, journal_id })
          .select()
          .maybeSingle();
        continue;
      }

      // Try semantic merge via embedding
      const emb = await embed(`${ent.type}: ${ent.label}`, apiKey);
      let mergedId: string | null = null;
      if (emb) {
        const { data: match } = await admin.rpc("match_mind_node", {
          _user_id: user_id,
          _type: ent.type,
          _embedding: emb as unknown as string,
          _threshold: 0.85,
        });
        if (Array.isArray(match) && match.length > 0) {
          mergedId = match[0].id;
        }
      }

      if (mergedId) {
        const { data: cur } = await admin
          .from("mind_nodes")
          .select("frequency")
          .eq("id", mergedId)
          .single();
        await admin
          .from("mind_nodes")
          .update({
            frequency: ((cur?.frequency ?? 1) + 1),
            last_seen_at: new Date().toISOString(),
          })
          .eq("id", mergedId);
        nodeIds.push(mergedId);
        await admin
          .from("mind_node_entries")
          .insert({ user_id, node_id: mergedId, journal_id })
          .select()
          .maybeSingle();
      } else {
        const { data: created, error: cErr } = await admin
          .from("mind_nodes")
          .insert({
            user_id,
            type: ent.type,
            label: ent.label,
            label_normalized: ent.label,
            embedding: emb as unknown as string | null,
          })
          .select("id")
          .single();
        if (cErr) {
          console.warn("create node err", cErr);
          continue;
        }
        nodeIds.push(created.id);
        await admin
          .from("mind_node_entries")
          .insert({ user_id, node_id: created.id, journal_id });
      }
    }

    // 3) Co-occurrence edges (all pairs of nodes in this entry)
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const a = nodeIds[i] < nodeIds[j] ? nodeIds[i] : nodeIds[j];
        const b = nodeIds[i] < nodeIds[j] ? nodeIds[j] : nodeIds[i];
        const { data: existingEdge } = await admin
          .from("mind_edges")
          .select("id, weight")
          .eq("user_id", user_id)
          .eq("source_id", a)
          .eq("target_id", b)
          .maybeSingle();
        if (existingEdge?.id) {
          await admin
            .from("mind_edges")
            .update({
              weight: (existingEdge.weight ?? 1) + 1,
              last_co_occurred_at: new Date().toISOString(),
            })
            .eq("id", existingEdge.id);
        } else {
          await admin.from("mind_edges").insert({
            user_id,
            source_id: a,
            target_id: b,
            weight: 1,
          });
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, entities: entities.length, nodes: nodeIds.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("update-mind-map err", e);
    console.error("mindmap_extraction_failed", { error: String(e) });
    return new Response(JSON.stringify({ error: "internal" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
