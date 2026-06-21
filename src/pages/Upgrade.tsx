import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { trackEvent } from "@/lib/analytics";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import Seo from "@/components/Seo";

const PRICE_ID = "premium_plus_monthly";
const DEFAULT_CODE = "UPGRADE10";

export default function Upgrade() {
  const [params] = useSearchParams();
  const { user, loading } = useAuth();
  const code = (params.get("code") || DEFAULT_CODE).toUpperCase();
  const utm_source = params.get("utm_source") || "direct";
  const utm_campaign = params.get("utm_campaign") || "upgrade";
  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("cta_click_pricing", { source: utm_source, campaign: utm_campaign, code });
  }, [utm_source, utm_campaign, code]);

  const startCheckout = async () => {
    if (!user) { window.location.href = `/auth?redirect=/upgrade?code=${code}`; return; }
    trackEvent("subscription_started", { code, source: utm_source, campaign: utm_campaign });
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        priceId: PRICE_ID,
        promoCode: code,
        environment: getStripeEnvironment(),
        returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      },
    });
    if (error || !data?.clientSecret) { setError(error?.message || "Checkout failed"); return; }
    setClientSecret(data.clientSecret);
    setOpen(true);
  };

  const options = useMemo(() => clientSecret ? { fetchClientSecret: async () => clientSecret } : null, [clientSecret]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F3F4ED" }}>
      <Seo title="Unlock Premium+ — 10% Off | NexoMind" description="Limited offer: 10% off Premium+ for 3 months. Unlock the full mentor experience." />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link to="/" className="text-sm opacity-60 hover:opacity-100">← NexoMind</Link>
        <div className="mt-10 rounded-3xl bg-white shadow-sm p-10 border border-black/5">
          <div className="inline-block px-3 py-1 rounded-full bg-black text-white text-xs tracking-wider uppercase">Limited offer</div>
          <h1 className="mt-6 text-4xl md:text-5xl font-serif leading-tight">Your <em className="opacity-60">future self</em> is on Premium+.</h1>
          <p className="mt-5 text-lg opacity-75 leading-relaxed">
            You've been showing up. Now go deeper — pattern detection across every entry, your personalised mentor persona, the Sunday Letter, and crisis-aware reflection. Code <strong>{code}</strong> takes <strong>10% off for 3 months</strong>.
          </p>

          <ul className="mt-8 space-y-3 text-[15px]">
            {[
              "Unlimited journaling + voice entries",
              "AI mentor that learns your patterns over time",
              "Sunday Letter — a weekly synthesis from your week",
              "Therapist Bridge: shareable summaries for your therapist",
              "Pattern Interrupts when overthinking spikes",
            ].map((f) => (
              <li key={f} className="flex gap-3"><span className="opacity-40">→</span><span>{f}</span></li>
            ))}
          </ul>

          {!open && (
            <button onClick={startCheckout} disabled={loading}
              className="mt-10 w-full md:w-auto px-8 py-4 rounded-full bg-black text-white text-sm font-medium hover:opacity-90 transition">
              Claim 10% off Premium+ →
            </button>
          )}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <p className="mt-4 text-xs opacity-50">Cancel anytime. Code applies automatically at checkout.</p>
        </div>

        {open && options && (
          <div className="mt-8 rounded-3xl bg-white shadow-sm p-6 border border-black/5">
            <EmbeddedCheckoutProvider stripe={getStripe()} options={options}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </div>
    </div>
  );
}
