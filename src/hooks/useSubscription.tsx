import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getStripeEnvironment } from "@/lib/stripe";
import { resolveTier, type Tier } from "@/lib/tier";

type SubRow = {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  price_id: string | null;
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubRow | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("status, current_period_end, cancel_at_period_end, price_id")
      .eq("user_id", user.id)
      .eq("environment", getStripeEnvironment())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) console.error("useSubscription:", error);
    setSubscription((data as SubRow | null) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: refetch (with env filter) when the row changes.
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`subscriptions:${user.id}:${Math.random().toString(36).slice(2)}`);
    channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          load();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);

  // Refresh when the user comes back to the tab (e.g. from checkout).
  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const tier: Tier = resolveTier(subscription);
  // Backward compatible: Premium+ users also get isPremium=true
  const isPremium = tier !== "free";
  const isPremiumPlus = tier === "premium_plus";
  const isPastDue = subscription?.status === "past_due";
  const isCanceling =
    !!subscription?.cancel_at_period_end || subscription?.status === "canceled";

  return {
    subscription,
    tier,
    isPremium,
    isPremiumPlus,
    isPastDue,
    isCanceling,
    loading,
    refresh: load,
  };
};

export default useSubscription;
