import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { getStripeEnvironment } from "@/lib/stripe";

/**
 * Detects subscriptions created under the previous Stripe account.
 * Those can't be managed in the new account — the user must resubscribe.
 */
export function useLegacyBilling() {
  const { user } = useAuth();
  const { isPremium, subscription } = useSubscription();
  const [legacy, setLegacy] = useState(false);
  const [priceId, setPriceId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user || !isPremium || !subscription) {
      setLegacy(false);
      setChecked(!!user);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("billing-status", {
          body: { environment: getStripeEnvironment() },
        });
        if (cancelled) return;
        if (!error && data) {
          setLegacy(!!data.legacy);
          setPriceId((data.priceId as string | null) ?? null);
        }
      } catch {
        /* non-fatal */
      } finally {
        if (!cancelled) setChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isPremium, subscription?.status]);

  return { legacy, priceId, checked };
}

export default useLegacyBilling;
