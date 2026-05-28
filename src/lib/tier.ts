/**
 * Tier resolution for subscription-based access control.
 * Determines user tier from their Stripe price_id.
 */

export type Tier = "free" | "premium" | "premium_plus";

// Placeholder price IDs - replace with real Stripe price IDs per environment.
export const PREMIUM_PRICE_IDS = new Set([
  "premium_monthly",
  "premium_yearly",
]);

export const PREMIUM_PLUS_PRICE_IDS = new Set([
  "premium_plus_monthly",
  "premium_plus_yearly",
]);

type SubLike = {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  price_id: string | null;
} | null;

const ACTIVE_STATUSES = ["active", "trialing", "past_due"];

/**
 * Returns true if the subscription grants access (active, trialing, past_due,
 * or canceled but still within billing period).
 */
export function subIsActive(sub: SubLike): boolean {
  if (!sub) return false;
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end)
    : null;
  const withinPeriod = !periodEnd || periodEnd > new Date();

  return (
    (ACTIVE_STATUSES.includes(sub.status) && withinPeriod) ||
    (sub.status === "canceled" && !!periodEnd && periodEnd > new Date())
  );
}

/**
 * Resolves the user's effective tier from their subscription row.
 */
export function resolveTier(sub: SubLike): Tier {
  if (!subIsActive(sub)) return "free";
  const priceId = sub?.price_id ?? "";
  if (PREMIUM_PLUS_PRICE_IDS.has(priceId)) return "premium_plus";
  if (PREMIUM_PRICE_IDS.has(priceId)) return "premium";
  // Fallback: any active subscription without a recognized price_id
  // is treated as premium (backward compatibility).
  return "premium";
}
