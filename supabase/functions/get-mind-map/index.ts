// Returns the authenticated user's mind map (nodes + edges), pruned to top N.
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

    const { data: u, error: uErr } = await supabase.auth.getUser();
    if (uErr || !u?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = u.user.id;

    // Top 60 nodes by frequency
    const { data: nodes, error: nErr } = await supabase
      .from("mind_nodes")
      .select("id, type, label, frequency, first_seen_at, last_seen_at")
      .eq("user_id", userId)
      .order("frequency", { ascending: false })
      .limit(60);
    if (nErr) throw nErr;

    const nodeIds = (nodes ?? []).map((n) => n.id);
    let edges: Array<{ source: string; target: string; weight: number }> = [];
    if (nodeIds.length > 1) {
      const { data: rawEdges, error: eErr } = await supabase
        .from("mind_edges")
        .select("source_id, target_id, weight")
        .eq("user_id", userId)
        .in("source_id", nodeIds)
        .in("target_id", nodeIds);
      if (eErr) throw eErr;
      edges = (rawEdges ?? []).map((e: any) => ({
        source: e.source_id,
        target: e.target_id,
        weight: e.weight,
      }));
    }

    return new Response(JSON.stringify({ nodes: nodes ?? [], edges }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("get-mind-map err", e);
    return new Response(JSON.stringify({ error: "internal" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
