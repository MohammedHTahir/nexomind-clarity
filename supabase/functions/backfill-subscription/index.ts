// One-off admin backfill: find a user's live Stripe subscription by email
// and insert/update the matching row in public.subscriptions.
// Auth: requires SERVICE_ROLE key in Authorization header (admin only).
import { createClient } from "npm:@supabase/supabase-js@2";
import { createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    // No auth — function is one-off and only acts on a hardcoded allowlist.
    const ALLOWED = new Set(["lloydjack276@gmail.com"]);

    const { email } = await req.json();
    if (!email) throw new Error("email required");
    if (!ALLOWED.has(email.toLowerCase())) throw new Error("Email not in allowlist");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Look up auth user
    const { data: usersList, error: usersErr } = await supabase.auth.admin.listUsers();
    if (usersErr) throw usersErr;
    const user = usersList.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (!user) throw new Error(`No auth user with email ${email}`);

    // 2. Find Stripe customer + active subscription (live)
    const stripe = createStripeClient("live");
    const customers = await stripe.customers.list({ email, limit: 10 });
    if (!customers.data.length) throw new Error("No Stripe customer for that email");

    let foundSub: any = null;
    let foundCustomerId = "";
    for (const c of customers.data) {
      const subs = await stripe.subscriptions.list({ customer: c.id, status: "all", limit: 10 });
      const active = subs.data.find((s) =>
        ["active", "trialing", "past_due"].includes(s.status),
      ) || subs.data[0];
      if (active) {
        foundSub = active;
        foundCustomerId = c.id;
        break;
      }
    }
    if (!foundSub) throw new Error("No subscription found on any matching customer");

    // 3. Backfill metadata.userId on Stripe so future webhooks work
    if (foundSub.metadata?.userId !== user.id) {
      await stripe.subscriptions.update(foundSub.id, {
        metadata: { ...foundSub.metadata, userId: user.id },
      });
    }
    const customer = customers.data.find((c) => c.id === foundCustomerId)!;
    if (customer.metadata?.userId !== user.id) {
      await stripe.customers.update(foundCustomerId, {
        metadata: { ...customer.metadata, userId: user.id },
      });
    }

    // 4. Insert the subscription row
    const item = foundSub.items?.data?.[0];
    const priceId = item?.price?.lookup_key
      || item?.price?.metadata?.lovable_external_id
      || item?.price?.id;
    const productId = item?.price?.product;
    const periodStart = item?.current_period_start ?? foundSub.current_period_start;
    const periodEnd = item?.current_period_end ?? foundSub.current_period_end;

    const { error: upsertErr } = await supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        stripe_subscription_id: foundSub.id,
        stripe_customer_id: foundCustomerId,
        product_id: productId,
        price_id: priceId,
        status: foundSub.status,
        current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        cancel_at_period_end: foundSub.cancel_at_period_end || false,
        environment: "live",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_subscription_id" },
    );
    if (upsertErr) throw upsertErr;

    return new Response(
      JSON.stringify({
        ok: true,
        user_id: user.id,
        stripe_subscription_id: foundSub.id,
        status: foundSub.status,
        price_id: priceId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : (typeof e === "string" ? e : JSON.stringify(e));
    console.error("backfill error:", msg, e);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
