import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const STORAGE_KEY = "nm_consent";
const GA_ID = "G-GHRSKGB302";

const isDNT = () => {
  if (typeof navigator === "undefined") return false;
  const w = window as unknown as { doNotTrack?: string };
  const n = navigator as unknown as { doNotTrack?: string; msDoNotTrack?: string };
  return n.doNotTrack === "1" || w.doNotTrack === "1" || n.msDoNotTrack === "1";
};

const loadGa = () => {
  if (document.getElementById("ga4-loader")) return;
  const s = document.createElement("script");
  s.id = "ga4-loader";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.gtag?.("config", GA_ID, { anonymize_ip: true });
};

const ConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // If DNT is on, silently set denied — no banner noise.
        if (isDNT()) {
          localStorage.setItem(STORAGE_KEY, "denied");
          return;
        }
        // Defer slightly to avoid blocking LCP
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
      /* no-op */
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "granted");
    } catch {/* no-op */}
    window.gtag?.("consent", "update", {
      analytics_storage: "granted",
      functionality_storage: "granted",
      personalization_storage: "granted",
    });
    if (!isDNT()) loadGa();
    setVisible(false);
  };

  const decline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "denied");
    } catch {/* no-op */}
    window.gtag?.("consent", "update", {
      analytics_storage: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
    });
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:bottom-6 md:max-w-md z-[60] bg-white/95 backdrop-blur-md border border-black/5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-5 md:p-6"
        >
          <p className="font-instrument text-[20px] leading-tight text-[#111] mb-1">
            A quiet ask.
          </p>
          <p className="font-barlow text-[13.5px] text-[#111]/65 leading-relaxed">
            We use privacy-friendly analytics to understand what helps people find
            clarity. No ads, no selling data. You can decline — everything still works.{" "}
            <Link to="/privacy-policy" className="underline hover:text-[#111]">
              Learn more
            </Link>
            .
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={decline}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-full font-barlow font-medium text-[13px] text-[#111]/70 hover:text-[#111] border border-black/10 hover:border-black/25 transition"
            >
              Decline
            </button>
            <button
              onClick={accept}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-full font-barlow font-medium text-[13px] bg-[#111] text-white hover:bg-black transition"
            >
              Accept
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConsentBanner;
