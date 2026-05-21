// Returns detail for a single mind node: trend, recent entries, AI reframe.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { node_id } = await req.json();
    if (!node_id) {
      return new Response(JSON.stringify({ error: "node_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const userId = u.user.id;

    const { data: node } = await supabase
      .from("mind_nodes")
      .select("id, type, label, frequency, first_seen_at, last_seen_at")
      .eq("id", node_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!node) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Recent journal entries that fed this node
    const { data: links } = await supabase
      .from("mind_node_entries")
      .select("journal_id, created_at")
      .eq("node_id", node_id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);

    const journalIds = (links ?? []).map((l) => l.journal_id);
    let entries: Array<{ id: string; content: string; created_at: string }> = [];
    if (journalIds.length) {
      const { data: js } = await supabase
        .from("journals")
        .select("id, content, created_at")
        .in("id", journalIds);
      entries = (js ?? []).map((j) => ({
        id: j.id,
        content: j.content.slice(0, 240),
        created_at: j.created_at,
      }));
    }

    // 30-day trend (count per day)
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: allLinks } = await supabase
      .from("mind_node_entries")
      .select("created_at")
      .eq("node_id", node_id)
      .eq("user_id", userId)
      .gte("created_at", since);
    const trend: Record<string, number> = {};
    (allLinks ?? []).forEach((l) => {
      const d = new Date(l.created_at).toISOString().slice(0, 10);
      trend[d] = (trend[d] ?? 0) + 1;
    });

    // Reframe via Lovable AI
    let reframe = "";
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (apiKey && entries.length > 0) {
      try {
        const sample = entries.map((e) => `- ${e.content}`).join("\n");
        const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "You are NexoMind. Given a recurring psychological pattern from a user's journal, write ONE calm, non-clinical reframe (max 30 words). No advice clichés, no headers, no emojis." },
              { role: "user", content: `Pattern type: ${node.type}\nLabel: ${node.label}\nSeen ${node.frequency} times.\nRecent entries:\n${sample}` },
            ],
          }),
        });
        if (r.ok) {
          const d = await r.json();
          reframe = d?.choices?.[0]?.message?.content?.trim() ?? "";
        }
      } catch (e) { console.warn("reframe err", e); }
    }

    return new Response(JSON.stringify({ node, entries, trend, reframe }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mind-node-detail err", e);
    return new Response(JSON.stringify({ error: "internal" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
