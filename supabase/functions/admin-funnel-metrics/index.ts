import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Admin check via has_role
    const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (roleErr || !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional ?days=30 window
    const url = new URL(req.url);
    const days = Math.max(1, Math.min(365, Number(url.searchParams.get("days") ?? 30)));
    const since = new Date(Date.now() - days * 86400_000).toISOString();

    // Signups: count distinct profiles since `since`
    const { count: signups } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since);

    // Subscriptions started: distinct user_id with a subscription created since
    const { data: subRows } = await admin
      .from("subscriptions")
      .select("user_id, created_at")
      .gte("created_at", since);
    const subscribers = new Set((subRows ?? []).map((r) => r.user_id)).size;

    // Journal entries: distinct authors + total entries
    const { data: jRows } = await admin
      .from("journals")
      .select("user_id, created_at")
      .gte("created_at", since);
    const entryAuthors = new Set((jRows ?? []).map((r) => r.user_id)).size;
    const entriesTotal = (jRows ?? []).length;

    // Cohort funnel: users who signed up in window AND completed each step
    const { data: cohortProfiles } = await admin
      .from("profiles")
      .select("id, created_at")
      .gte("created_at", since);
    const cohortIds = new Set((cohortProfiles ?? []).map((p) => p.id));

    const { data: cohortSubs } = await admin
      .from("subscriptions")
      .select("user_id");
    const cohortSubscribers = new Set(
      (cohortSubs ?? [])
        .map((s) => s.user_id)
        .filter((id) => cohortIds.has(id)),
    );

    const { data: cohortJournals } = await admin
      .from("journals")
      .select("user_id");
    const cohortJournalAuthors = new Set(
      (cohortJournals ?? [])
        .map((j) => j.user_id)
        .filter((id) => cohortIds.has(id)),
    );

    const cohort = {
      signups: cohortIds.size,
      subscribed: cohortSubscribers.size,
      journaled: cohortJournalAuthors.size,
    };

    return new Response(
      JSON.stringify({
        windowDays: days,
        totals: {
          signups: signups ?? 0,
          subscribers,
          entryAuthors,
          entriesTotal,
        },
        cohort,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
