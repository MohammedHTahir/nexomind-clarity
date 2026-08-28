// Reports whether the caller's subscription exists in the CURRENT Stripe
// account. Subscriptions created under a previous Stripe account are
// "legacy": their IDs don't resolve here, so portal flows (change/cancel)
// can't work and the user must resubscribe.
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseAdmin = createClient(
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
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { environment } = await req.json().catch(() => ({}));
    const env: StripeEnv = environment === "live" ? "live" : "sandbox";

    // Look at ALL rows for this user/env: a fresh resubscribe creates a new
    // row in the current account while the legacy row may still exist.
    const { data: subs } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_subscription_id, stripe_customer_id, price_id, status, created_at")
      .eq("user_id", userData.user.id)
      .eq("environment", env)
      .order("created_at", { ascending: false });

    const rows = subs ?? [];
    const priceId = (rows[0]?.price_id as string | null) ?? null;

    const paid = rows.filter((r) => {
      const id = r.stripe_subscription_id as string | null;
      return !!id && !id.startsWith("promo_");
    });

    // No paid row, or only promo/granted rows: nothing to resubscribe.
    if (paid.length === 0) {
      return new Response(JSON.stringify({ legacy: false, priceId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = createStripeClient(env);
    const activeStatuses = new Set(["active", "trialing", "past_due", "unpaid", "paused"]);

    // If ANY row resolves in the current account, the user has already
    // restarted — not legacy.
    for (const row of paid) {
      try {
        const s = await stripe.subscriptions.retrieve(row.stripe_subscription_id as string);
        if (activeStatuses.has(s.status)) {
          return new Response(
            JSON.stringify({ legacy: false, priceId: (row.price_id as string | null) ?? priceId }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      } catch (err) {
        if ((err as { code?: string }).code !== "resource_missing") throw err;
      }
    }

    // Fallback: check the current account by email for a live subscription
    // (covers a checkout whose webhook row hasn't landed yet).
    const email = userData.user.email;
    if (email) {
      try {
        const customers = await stripe.customers.list({ email, limit: 5 });
        for (const c of customers.data) {
          const list = await stripe.subscriptions.list({ customer: c.id, status: "all", limit: 10 });
          if (list.data.some((s) => activeStatuses.has(s.status))) {
            return new Response(JSON.stringify({ legacy: false, priceId }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } catch {
        /* non-fatal */
      }
    }

    return new Response(JSON.stringify({ legacy: true, priceId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("billing-status error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
