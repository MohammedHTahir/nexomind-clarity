import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import PaywallModal from "@/components/PaywallModal";

const ease = [0.16, 1, 0.3, 1] as const;

interface PremiumGateProps {
  children: ReactNode;
  /** Optional title shown over the blurred content. */
  title?: string;
  /** Optional subtitle shown over the blurred content. */
  subtitle?: string;
  /** When true, no blur/lock is applied — used to render fallbacks. */
  bypass?: boolean;
}

/**
 * Wraps premium-only UI. When the user is not subscribed, the children are
 * blurred + non-interactive and an "Unlock" overlay opens the paywall.
 * The moment `isPremium` flips to true (via realtime subscription updates
 * from the Stripe webhook), the gate transparently unlocks.
 */
const PremiumGate = ({ children, title, subtitle, bypass }: PremiumGateProps) => {
  const { isPremium, loading } = useSubscription();
  const [paywallOpen, setPaywallOpen] = useState(false);

  if (bypass || isPremium || loading) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative">
        <div
          className="blur-md opacity-50 select-none pointer-events-none transition-all duration-500"
          aria-hidden
        >
          {children}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="rounded-[20px] border border-white/60 bg-white/80 backdrop-blur-xl px-6 py-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.12)] max-w-sm">
            <div className="w-9 h-9 mx-auto mb-3 rounded-full bg-[#111]/5 flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#111]/60" strokeWidth={1.75} />
            </div>
            <p className="font-instrument text-[22px] leading-tight text-[#111]">
              {title ?? "Premium insight"}
            </p>
            {subtitle && (
              <p className="font-barlow text-[13px] text-[#111]/55 mt-1.5">{subtitle}</p>
            )}
            <button
              onClick={() => setPaywallOpen(true)}
              className="mt-4 rounded-full bg-[#111] text-white px-5 py-2 font-barlow text-[13px] font-medium hover:bg-black transition-colors"
            >
              Unlock full clarity
            </button>
          </div>
        </motion.div>
      </div>

      <PaywallModal
        open={paywallOpen}
        onUnlock={() => setPaywallOpen(false)}
        onContinue={() => setPaywallOpen(false)}
      />
    </>
  );
};

export default PremiumGate;
