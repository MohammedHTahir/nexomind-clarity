import { AnimatePresence, motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaywallModalProps {
  open: boolean;
  onUnlock?: () => void;
  onContinue: () => void;
}

const PaywallModal = ({ open, onUnlock, onContinue }: PaywallModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url as string;
      } else {
        throw new Error("No checkout URL returned");
      }
      onUnlock?.();
    } catch (e) {
      console.error(e);
      toast.error("Could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#111]/35 backdrop-blur-md px-5"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.65, ease }}
            className="w-full max-w-md rounded-[24px] border border-white/50 bg-white/75 backdrop-blur-xl p-7 md:p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.18)]"
          >
            <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-3">
              ( NexoMind Premium )
            </p>
            <h2 className="font-instrument text-[38px] md:text-[46px] leading-[1.02] tracking-tight text-[#111]">
              See what’s really <span className="italic">going on</span>
            </h2>
            <p className="font-barlow text-[15px] text-[#111]/65 leading-relaxed mt-5">
              Unlock the full insight behind your thoughts
            </p>
            <div className="my-7 rounded-[18px] border border-black/5 bg-white/65 px-5 py-4">
              <p className="font-instrument text-[34px] leading-none text-[#111]">
                $59.99<span className="font-barlow text-[13px] text-[#111]/45">/month</span>
              </p>
              <p className="font-barlow text-[13px] text-[#111]/55 mt-2">
                Less than $2 a day for clarity
              </p>
            </div>
            <button
              onClick={handleUnlock}
              disabled={loading}
              className="w-full rounded-full bg-[#111] px-6 py-3.5 font-barlow text-[14px] font-medium text-white shadow-[0_0_30px_rgba(17,17,17,0.18)] transition-all duration-300 hover:bg-black hover:shadow-[0_0_40px_rgba(17,17,17,0.28)] disabled:opacity-60"
            >
              {loading ? "Opening checkout…" : "Unlock full clarity"}
            </button>
            <button
              onClick={onContinue}
              className="mt-4 font-barlow text-[13px] text-[#111]/55 transition-colors hover:text-[#111]"
            >
              Continue with limited version
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaywallModal;