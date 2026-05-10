import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

const ease = [0.16, 1, 0.3, 1] as const;

const CheckoutReturn = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) return;
    try {
      const flagKey = `nexomind:sub_tracked:${sessionId}`;
      if (!sessionStorage.getItem(flagKey)) {
        trackEvent("subscription_started", { session_id: sessionId });
        sessionStorage.setItem(flagKey, "1");
      }
    } catch {}
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#F3F4ED] text-[#111] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="text-center max-w-md"
      >
        <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-4">
          ( {sessionId ? "Welcome to Premium" : "Checkout"} )
        </p>
        <h1 className="font-instrument text-[44px] md:text-[56px] leading-[1.05]">
          {sessionId ? (
            <>Your clarity, <span className="italic">unlocked.</span></>
          ) : (
            <>No session <span className="italic">found.</span></>
          )}
        </h1>
        <p className="font-barlow text-[15px] text-[#111]/65 mt-5 leading-relaxed">
          {sessionId
            ? "Thank you. Your subscription is being activated. You can return to the app whenever you're ready."
            : "We couldn't find a checkout session. Please try again from the app."}
        </p>
        <Link
          to="/app"
          className="inline-block mt-8 rounded-full bg-[#111] text-white px-7 py-3 font-barlow text-[14px] font-medium hover:bg-black transition-colors"
        >
          Continue to NexoMind
        </Link>
      </motion.div>
    </div>
  );
};

export default CheckoutReturn;
