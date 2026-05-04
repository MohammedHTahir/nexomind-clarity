import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type SubRow = {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  price_id: string | null;
};

const ACTIVE_STATUSES = ["active", "trialing"];

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
      .maybeSingle();
    if (error) console.error("useSubscription:", error);
    setSubscription((data as SubRow | null) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: auto-unlock when webhook updates the row
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`subscriptions:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = (payload.new ?? payload.old) as SubRow | null;
          setSubscription(row ?? null);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Refresh on tab focus (user returning from Stripe Checkout)
  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const isActive = !!(
    subscription &&
    ACTIVE_STATUSES.includes(subscription.status) &&
    (!subscription.current_period_end ||
      new Date(subscription.current_period_end) > new Date())
  );

  return {
    subscription,
    isPremium: isActive,
    loading,
    refresh: load,
  };
};

export default useSubscription;
