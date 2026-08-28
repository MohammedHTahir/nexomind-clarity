// Creates a Stripe Billing Portal session so users can manage / cancel their plan.
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
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { returnUrl, environment, flow } = await req.json();
    if (flow !== undefined && flow !== "update" && flow !== "cancel") {
      return new Response(JSON.stringify({ error: "Invalid flow" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (environment !== "sandbox" && environment !== "live") {
      return new Response(JSON.stringify({ error: "Invalid environment" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate returnUrl against an allowlist to prevent open-redirect abuse.
    let safeReturnUrl: string | undefined;
    if (returnUrl !== undefined && returnUrl !== null && returnUrl !== "") {
      if (typeof returnUrl !== "string") {
        return new Response(JSON.stringify({ error: "Invalid returnUrl" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const ALLOWED_ORIGINS = [
        "https://nexomind.ai",
        "https://www.nexomind.ai",
        "https://clarity-echo-calm.lovable.app",
        "https://id-preview--ee448f32-3498-4b9f-81d4-2a971af9887d.lovable.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
      ];
      try {
        const parsed = new URL(returnUrl);
        const isAllowed =
          ALLOWED_ORIGINS.includes(parsed.origin) ||
          /\.lovable\.app$/.test(parsed.hostname) ||
          /\.lovableproject\.com$/.test(parsed.hostname);
        if (!isAllowed) {
          return new Response(JSON.stringify({ error: "Invalid returnUrl origin" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        safeReturnUrl = returnUrl;
      } catch {
        return new Response(JSON.stringify({ error: "Invalid returnUrl" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    const env: StripeEnv = environment;

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", userData.user.id)
      .eq("environment", env)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const stripe = createStripeClient(env);
    const userEmail = userData.user.email ?? undefined;

    // Resolve a customer that actually exists in the CURRENT Stripe account.
    // Records created under a previous Stripe account contain stale customer IDs.
    let customerId: string | null = (sub?.stripe_customer_id as string) ?? null;

    if (customerId) {
      try {
        const existing = await stripe.customers.retrieve(customerId);
        if ((existing as { deleted?: boolean }).deleted) customerId = null;
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (code === "resource_missing") {
          console.warn("Stale stripe customer id, re-resolving by email", { customerId });
          customerId = null;
        } else {
          throw err;
        }
      }
    }

    if (!customerId && userEmail) {
      const found = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (found.data.length > 0) customerId = found.data[0].id;
    }

    if (!customerId) {
      return new Response(
        JSON.stringify({
          error:
            "We couldn't find your billing record in our current payment provider. Your plan is still active — please contact support@nexomind.ai to manage billing.",
          code: "CUSTOMER_NOT_IN_ACCOUNT",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (customerId !== sub?.stripe_customer_id) {
      await supabaseAdmin
        .from("subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", userData.user.id)
        .eq("environment", env);
    }

    // Deep-link flows (change plan / cancel) need a live subscription in this account.
    let flowData: Record<string, unknown> | undefined;
    if (flow) {
      let subscriptionId: string | null =
        (sub?.stripe_subscription_id as string | null) ?? null;
      if (subscriptionId?.startsWith("promo_")) subscriptionId = null;
      if (subscriptionId) {
        try {
          await stripe.subscriptions.retrieve(subscriptionId);
        } catch {
          subscriptionId = null;
        }
      }
      if (!subscriptionId) {
        const list = await stripe.subscriptions.list({
          customer: customerId,
          status: "all",
          limit: 20,
        });
        const rank: Record<string, number> = {
          active: 0,
          trialing: 1,
          past_due: 2,
          unpaid: 3,
          paused: 4,
        };
        const usable = list.data
          .filter((s) => s.status in rank)
          .sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9));
        subscriptionId = usable[0]?.id ?? null;
      }
      if (!subscriptionId) {
        const storedSubId = (sub?.stripe_subscription_id as string | null) ?? null;
        const isLegacy = !!storedSubId && !storedSubId.startsWith("promo_");
        return new Response(
          JSON.stringify({
            error: isLegacy
              ? "Your plan was started on our previous payment provider, so it can't be changed here yet. Your access stays active — email support@nexomind.ai and we'll move or adjust your plan for you."
              : "We couldn't find an active paid subscription to change. If you redeemed a promo code, your access simply ends on its expiry date.",
            code: isLegacy ? "LEGACY_BILLING" : "NO_ACTIVE_SUBSCRIPTION",
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      flowData =
        flow === "cancel"
          ? { type: "subscription_cancel", subscription_cancel: { subscription: subscriptionId } }
          : { type: "subscription_update", subscription_update: { subscription: subscriptionId } };
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      ...(safeReturnUrl && { return_url: safeReturnUrl }),
      ...(flowData && { flow_data: flowData as never }),
    });

    return new Response(JSON.stringify({ url: portal.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("create-portal-session error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
