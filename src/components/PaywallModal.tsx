import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { StripeEmbeddedCheckoutForm } from "@/components/StripeEmbeddedCheckout";

const ease = [0.16, 1, 0.3, 1] as const;

type Tier = "premium" | "premium_plus";

interface PaywallModalProps {
  open: boolean;
  onUnlock?: () => void;
  onContinue: () => void;
  tier?: Tier;
}

type Plan = "monthly" | "yearly";

const PLANS: Record<Tier, Record<Plan, { priceId: string; price: string; cadence: string; note: string }>> = {
  premium: {
    monthly: { priceId: "premium_monthly", price: "$9.99", cadence: "/month", note: "Cancel anytime" },
    yearly: { priceId: "premium_yearly", price: "$95", cadence: "/year", note: "Save ~20% vs monthly" },
  },
  premium_plus: {
    monthly: { priceId: "premium_plus_monthly_49", price: "$49.00", cadence: "/month", note: "Cancel anytime" },
    yearly: { priceId: "premium_plus_yearly", price: "$470", cadence: "/year", note: "Save ~20% vs monthly" },
  },
};

const LABEL: Record<Tier, string> = { premium: "Premium", premium_plus: "Premium+" };

const PaywallModal = ({ open, onUnlock, onContinue, tier: tierProp = "premium" }: PaywallModalProps) => {
  const { user } = useAuth();
  const { tier: currentTier } = useSubscription();
  // If the user already has Premium, only Premium+ is a meaningful purchase.
  const isOnPremium = currentTier === "premium";
  const [tier, setTier] = useState<Tier>(isOnPremium ? "premium_plus" : tierProp);
  const [plan, setPlan] = useState<Plan>("monthly");
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (open) setTier(isOnPremium ? "premium_plus" : tierProp);
  }, [open, isOnPremium, tierProp]);

  const handleUnlock = () => {
    setShowCheckout(true);
    onUnlock?.();
  };

  const close = () => {
    setShowCheckout(false);
    onContinue();
  };

  const selected = PLANS[tier][plan];
  const availableTiers: Tier[] = isOnPremium ? ["premium_plus"] : ["premium", "premium_plus"];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease }}
          className="fixed inset-0 z-[80] flex items-start md:items-center justify-center bg-[#111]/35 backdrop-blur-md px-3 sm:px-5 py-6 sm:py-8 overflow-y-auto overscroll-contain"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.65, ease }}
            className={`w-full ${showCheckout ? "max-w-2xl" : "max-w-md"} rounded-[24px] border border-white/50 bg-white/85 backdrop-blur-xl p-4 sm:p-6 md:p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.18)] my-auto`}
          >
            {!showCheckout ? (
              <>
                <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-3">
                  ( NexoMind {LABEL[tier]} )
                </p>
                <h2 className="font-instrument text-[36px] md:text-[44px] leading-[1.04] tracking-tight text-[#111]">
                  See what's really <span className="italic">going on</span>
                </h2>
                <p className="font-barlow text-[15px] text-[#111]/65 leading-relaxed mt-4">
                  Unlock the full insight behind your thoughts
                </p>

                {availableTiers.length > 1 && (
                  <div className="mt-6 inline-flex rounded-full bg-black/[0.04] p-1 text-[12px] font-barlow">
                    {availableTiers.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTier(t)}
                        className={`px-4 py-1.5 rounded-full transition-colors ${
                          tier === t ? "bg-[#111] text-white" : "text-[#111]/60"
                        }`}
                      >
                        {LABEL[t]}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-3 inline-flex rounded-full bg-black/[0.04] p-1 text-[12px] font-barlow">
                  {(["monthly", "yearly"] as Plan[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlan(p)}
                      className={`px-4 py-1.5 rounded-full transition-colors ${
                        plan === p ? "bg-[#111] text-white" : "text-[#111]/60"
                      }`}
                    >
                      {p === "monthly" ? "Monthly" : "Yearly"}
                    </button>
                  ))}
                </div>

                <div className="my-6 rounded-[18px] border border-black/5 bg-white/65 px-5 py-4">
                  <p className="font-instrument text-[34px] leading-none text-[#111]">
                    {selected.price}
                    <span className="font-barlow text-[13px] text-[#111]/45">
                      {selected.cadence}
                    </span>
                  </p>
                  <p className="font-barlow text-[13px] text-[#111]/55 mt-2">
                    {selected.note}
                  </p>
                </div>

                <button
                  onClick={handleUnlock}
                  className="w-full rounded-full bg-[#111] px-6 py-3.5 font-barlow text-[14px] font-medium text-white shadow-[0_0_30px_rgba(17,17,17,0.18)] transition-all duration-300 hover:bg-black hover:shadow-[0_0_40px_rgba(17,17,17,0.28)]"
                >
                  Unlock full clarity
                </button>
                <button
                  onClick={onContinue}
                  className="mt-4 font-barlow text-[13px] text-[#111]/55 transition-colors hover:text-[#111]"
                >
                  Continue with limited version
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45">
                    ( {LABEL[tier]} · {plan === "monthly" ? "Monthly" : "Yearly"} )
                  </p>
                  <button
                    onClick={close}
                    className="font-barlow text-[12px] text-[#111]/55 hover:text-[#111]"
                  >
                    Close
                  </button>
                </div>
                <StripeEmbeddedCheckoutForm
                  priceId={selected.priceId}
                  customerEmail={user?.email ?? undefined}
                  userId={user?.id ?? undefined}
                />
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaywallModal;
