import { describe, it, expect } from "vitest";
import { resolveTier, subIsActive } from "@/lib/tier";

describe("resolveTier", () => {
  it("returns 'premium' for premium monthly price_id", () => {
    const sub = {
      status: "active",
      current_period_end: new Date(Date.now() + 86400000).toISOString(),
      cancel_at_period_end: false,
      price_id: "premium_monthly",
    };
    expect(resolveTier(sub)).toBe("premium");
  });

  it("returns 'premium' for premium yearly price_id", () => {
    const sub = {
      status: "active",
      current_period_end: new Date(Date.now() + 86400000).toISOString(),
      cancel_at_period_end: false,
      price_id: "premium_yearly",
    };
    expect(resolveTier(sub)).toBe("premium");
  });

  it("returns 'premium_plus' for premium_plus monthly price_id", () => {
    const sub = {
      status: "active",
      current_period_end: new Date(Date.now() + 86400000).toISOString(),
      cancel_at_period_end: false,
      price_id: "premium_plus_monthly_49",
    };
    expect(resolveTier(sub)).toBe("premium_plus");
  });

  it("returns 'premium_plus' for premium_plus yearly price_id", () => {
    const sub = {
      status: "active",
      current_period_end: new Date(Date.now() + 86400000).toISOString(),
      cancel_at_period_end: false,
      price_id: "premium_plus_yearly",
    };
    expect(resolveTier(sub)).toBe("premium_plus");
  });

  it("returns 'free' for null subscription", () => {
    expect(resolveTier(null)).toBe("free");
  });

  it("returns 'free' for expired canceled subscription", () => {
    const sub = {
      status: "canceled",
      current_period_end: new Date(Date.now() - 86400000).toISOString(),
      cancel_at_period_end: true,
      price_id: "premium_monthly",
    };
    expect(resolveTier(sub)).toBe("free");
  });

  it("returns active tier for canceled subscription still within billing period", () => {
    const sub = {
      status: "canceled",
      current_period_end: new Date(Date.now() + 86400000).toISOString(),
      cancel_at_period_end: true,
      price_id: "premium_plus_monthly_49",
    };
    expect(resolveTier(sub)).toBe("premium_plus");
  });

  it("returns 'premium' for unknown price_id with active status (backward compat fallback)", () => {
    const sub = {
      status: "active",
      current_period_end: new Date(Date.now() + 86400000).toISOString(),
      cancel_at_period_end: false,
      price_id: "unknown_price_xyz",
    };
    expect(resolveTier(sub)).toBe("premium");
  });

  it("isPremium backward compat: premium_plus users are not 'free'", () => {
    const sub = {
      status: "active",
      current_period_end: new Date(Date.now() + 86400000).toISOString(),
      cancel_at_period_end: false,
      price_id: "premium_plus_monthly_49",
    };
    const tier = resolveTier(sub);
    // isPremium logic: tier !== 'free'
    const isPremium = tier !== "free";
    expect(isPremium).toBe(true);
  });
});

describe("subIsActive", () => {
  it("returns false for null subscription", () => {
    expect(subIsActive(null)).toBe(false);
  });

  it("returns true for active subscription within period", () => {
    const sub = {
      status: "active",
      current_period_end: new Date(Date.now() + 86400000).toISOString(),
      cancel_at_period_end: false,
      price_id: "premium_monthly",
    };
    expect(subIsActive(sub)).toBe(true);
  });

  it("returns true for trialing subscription", () => {
    const sub = {
      status: "trialing",
      current_period_end: new Date(Date.now() + 86400000).toISOString(),
      cancel_at_period_end: false,
      price_id: "premium_monthly",
    };
    expect(subIsActive(sub)).toBe(true);
  });

  it("returns false for active subscription past period end", () => {
    const sub = {
      status: "active",
      current_period_end: new Date(Date.now() - 86400000).toISOString(),
      cancel_at_period_end: false,
      price_id: "premium_monthly",
    };
    expect(subIsActive(sub)).toBe(false);
  });
});
