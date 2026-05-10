// Export all user data as JSON (GDPR data portability)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const uid = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE);

    const [profileRes, journalsRes, analysisRes, subsRes] = await Promise.all([
      admin.from("profiles").select("*").eq("id", uid).maybeSingle(),
      admin.from("journals").select("*").eq("user_id", uid).order("created_at", { ascending: true }),
      admin.from("journal_analysis").select("*").eq("user_id", uid).order("created_at", { ascending: true }),
      admin.from("subscriptions").select("status,price_id,product_id,environment,current_period_start,current_period_end,cancel_at_period_end,created_at,updated_at").eq("user_id", uid),
    ]);

    const payload = {
      exported_at: new Date().toISOString(),
      account: {
        id: uid,
        email: userData.user.email,
        created_at: userData.user.created_at,
      },
      profile: profileRes.data ?? null,
      journals: journalsRes.data ?? [],
      journal_analyses: analysisRes.data ?? [],
      subscriptions: subsRes.data ?? [],
    };

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="nexomind-data-${uid}.json"`,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
