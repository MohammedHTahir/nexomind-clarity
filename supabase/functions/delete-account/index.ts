// Permanently delete the user's account: cancel subscription, wipe data, delete auth user.
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const uid = userData.user.id;
    const email = userData.user.email;

    let body: { confirm?: string; environment?: StripeEnv } = {};
    try { body = await req.json(); } catch { /* allow empty */ }
    if (body.confirm !== "DELETE") {
      return new Response(JSON.stringify({ error: "Confirmation required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cancel any active Stripe subscriptions across both environments immediately.
    const { data: subs } = await admin
      .from("subscriptions")
      .select("stripe_subscription_id, status, environment")
      .eq("user_id", uid);

    for (const sub of subs ?? []) {
      const subId = sub.stripe_subscription_id as string | null;
      if (!subId || sub.status === "canceled") continue;
      const env = (sub.environment === "live" ? "live" : "sandbox") as StripeEnv;
      try {
        const stripe = createStripeClient(env);
        await stripe.subscriptions.cancel(subId);
      } catch (e) {
        console.error("delete-account: stripe cancel failed", e);
      }
    }

    // Wipe user-owned rows. (subscriptions has no auth FK cascade, so do it explicitly.)
    await Promise.all([
      admin.from("journal_analysis").delete().eq("user_id", uid),
      admin.from("journals").delete().eq("user_id", uid),
      admin.from("subscriptions").delete().eq("user_id", uid),
      admin.from("profiles").delete().eq("id", uid),
    ]);

    // Suppress further marketing/transactional emails to this address.
    if (email) {
      await admin.from("suppressed_emails").insert({
        email,
        reason: "account_deleted",
        metadata: { user_id: uid },
      }).then(() => {}, () => {});
    }

    // Finally, delete the auth user.
    const { error: delErr } = await admin.auth.admin.deleteUser(uid);
    if (delErr) {
      return new Response(JSON.stringify({ error: delErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ deleted: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("delete-account error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
