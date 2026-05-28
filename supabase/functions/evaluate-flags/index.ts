import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TIER_ORDER: Record<string, number> = {
  free: 0,
  premium: 1,
  premium_plus: 2,
};

/**
 * Deterministic hash-based rollout evaluation.
 * Uses a simple djb2-like hash of (user_id + flag_key) modded to 0-99.
 */
function deterministicPercent(userId: string, key: string): number {
  const input = userId + key;
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 100;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // User-scoped client for auth
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    // Admin client for cross-user data access
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve user tier
    const { data: isPremiumData } = await admin.rpc("is_premium", {
      _user_id: userId,
    });
    // Default to free; if is_premium returns true, check for premium_plus via subscriptions
    let userTier = "free";
    if (isPremiumData) {
      // Check if premium_plus by looking at subscriptions price_id
      const { data: subData } = await admin
        .from("subscriptions")
        .select("price_id")
        .eq("user_id", userId)
        .in("status", ["active", "trialing", "past_due"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const priceId = subData?.price_id ?? "";
      const plusIds = new Set(["premium_plus_monthly", "premium_plus_yearly"]);
      userTier = plusIds.has(priceId) ? "premium_plus" : "premium";
    }
    const userTierLevel = TIER_ORDER[userTier] ?? 0;

    // Fetch all feature flags
    const { data: flags, error: flagsErr } = await admin
      .from("feature_flags")
      .select("key, enabled, rollout_percent, min_tier");
    if (flagsErr) throw flagsErr;

    // Evaluate each flag
    const result: Record<string, boolean> = {};
    for (const flag of flags ?? []) {
      const flagTierLevel = TIER_ORDER[flag.min_tier] ?? 0;
      // Skip flags the user's tier doesn't qualify for
      if (userTierLevel < flagTierLevel) continue;

      const enabled =
        flag.enabled &&
        deterministicPercent(userId, flag.key) < flag.rollout_percent;
      result[flag.key] = enabled;
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate-flags error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
