// Admin-only: idempotently creates a 10% off Stripe coupon + promotion code.
// POST { code?: string, percentOff?: number, environment: "sandbox"|"live" }
// Returns { coupon_id, promotion_code_id, code }
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id, _role: "admin",
    });
    if (!isAdmin) return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    const body = await req.json().catch(() => ({}));
    const code: string = (body.code || "UPGRADE10").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 32);
    const percentOff: number = Math.max(1, Math.min(100, Number(body.percentOff) || 10));
    const environment = body.environment === "live" ? "live" : "sandbox";
    const env: StripeEnv = environment;
    const stripe = createStripeClient(env);

    // Check if promotion code already exists
    const existing = await stripe.promotionCodes.list({ code, limit: 1, active: true });
    if (existing.data.length) {
      const pc = existing.data[0];
      return new Response(JSON.stringify({
        ok: true, coupon_id: pc.coupon.id, promotion_code_id: pc.id, code: pc.code,
        existed: true,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const coupon = await stripe.coupons.create({
      percent_off: percentOff,
      duration: "repeating",
      duration_in_months: 3,
      name: `${percentOff}% off Premium+ (${code})`,
    });
    const pc = await stripe.promotionCodes.create({
      coupon: coupon.id, code, max_redemptions: 1000,
    });

    return new Response(JSON.stringify({
      ok: true, coupon_id: coupon.id, promotion_code_id: pc.id, code: pc.code, existed: false,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("admin-setup-promo error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "server_error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
