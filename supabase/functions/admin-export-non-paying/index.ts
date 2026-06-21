// Admin-only: returns CSV of non-paying users (no active subscription).
// GET → text/csv: email,full_name,user_id,created_at,last_seen_at
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id, _role: "admin",
    });
    if (!isAdmin) return new Response("Forbidden", { status: 403, headers: corsHeaders });

    // Find user_ids with active-ish subscriptions
    const { data: paying } = await admin
      .from("subscriptions")
      .select("user_id, status, current_period_end")
      .in("status", ["active", "trialing", "past_due"]);
    const payingIds = new Set((paying ?? []).map((s) => s.user_id));

    const { data: profiles, error } = await admin
      .from("profiles")
      .select("id, email, full_name, created_at, last_seen_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) throw error;

    const rows = (profiles ?? []).filter((p) => p.email && !payingIds.has(p.id));
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = "email,full_name,user_id,created_at,last_seen_at";
    const csv = [header, ...rows.map((r) =>
      [r.email, r.full_name, r.id, r.created_at, r.last_seen_at].map(esc).join(",")
    )].join("\n");

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="non-paying-users-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  } catch (e) {
    console.error("admin-export-non-paying error", e);
    return new Response("Server error", { status: 500, headers: corsHeaders });
  }
});
