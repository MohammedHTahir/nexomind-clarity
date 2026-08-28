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
  const [nonce, setNonce] = useState(0);

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
    // Re-check when the subscription row changes (e.g. after a restart) and on focus.
  }, [user, isPremium, subscription?.status, subscription?.price_id, subscription?.current_period_end, nonce]);

  useEffect(() => {
    const onFocus = () => setNonce((n) => n + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return { legacy, priceId, checked, refresh: () => setNonce((n) => n + 1) };
}

export default useLegacyBilling;
