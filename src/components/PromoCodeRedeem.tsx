import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { getStripeEnvironment } from "@/lib/stripe";
import { trackEvent } from "@/lib/analytics";

const ERROR_COPY: Record<string, string> = {
  invalid_code: "That code isn't valid.",
  code_expired: "This code has expired.",
  code_exhausted: "This code has reached its redemption limit.",
  already_redeemed: "You've already redeemed this code.",
  unauthorized: "Please sign in to redeem a code.",
  server_error: "Something went wrong. Try again in a moment.",
};

const PromoCodeRedeem = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh } = useSubscription();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const trimmed = code.trim();
    if (!trimmed) return;

    if (!user) {
      navigate(`/auth?redirect=/pricing&promo=${encodeURIComponent(trimmed)}`);
      return;
    }

    setLoading(true);
    trackEvent("promo_code_redeem_attempt", { code: trimmed.toUpperCase() });
    try {
      const { data, error } = await supabase.functions.invoke("redeem-promo-code", {
        body: { code: trimmed, environment: getStripeEnvironment() },
      });
      if (error || !data?.ok) {
        const key = (data?.error as string) || "server_error";
        setMessage({ type: "err", text: ERROR_COPY[key] ?? ERROR_COPY.server_error });
        trackEvent("promo_code_redeem_failed", { code: trimmed.toUpperCase(), reason: key });
      } else {
        setMessage({
          type: "ok",
          text: "You're in. Premium+ unlocked for the next 2 months — enjoy.",
        });
        trackEvent("promo_code_redeem_success", { code: trimmed.toUpperCase() });
        await refresh();
      }
    } catch {
      setMessage({ type: "err", text: ERROR_COPY.server_error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-6 pb-20 max-w-3xl mx-auto">
      <div className="rounded-[24px] border border-black/10 bg-white p-8 md:p-10 text-center">
        <p className="font-barlow font-medium text-[11px] tracking-[0.22em] uppercase text-[#111]/50">
          ( Have a code? )
        </p>
        <h3 className="font-instrument text-[28px] md:text-[34px] text-[#111] mt-3">
          Unlock <span className="italic">2 months free</span>
        </h3>
        <p className="font-barlow text-[14px] text-[#111]/60 mt-2">
          No card. No catch. Premium+ for 60 days.
        </p>
        <form onSubmit={handleRedeem} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 rounded-full bg-[#F3F4ED] border border-black/10 px-5 py-3 font-barlow text-[14px] tracking-[0.15em] uppercase text-[#111] placeholder:text-[#111]/35 focus:outline-none focus:border-black/30"
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="rounded-full bg-[#111] px-6 py-3 font-barlow text-[14px] font-medium text-white hover:bg-black transition-colors disabled:opacity-50"
          >
            {loading ? "Redeeming…" : "Redeem"}
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 font-barlow text-[13px] ${
              message.type === "ok" ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </section>
  );
};

export default PromoCodeRedeem;
