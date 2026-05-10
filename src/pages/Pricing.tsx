import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import Seo from "@/components/Seo";
import PaywallModal from "@/components/PaywallModal";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { trackEvent } from "@/lib/analytics";

const SITE_URL = "https://www.nexomind.ai";

const freeFeatures = [
  "3 reflections per week",
  "AI insight on each entry",
  "Private by design — encrypted at rest",
  "Web access",
];

const proFeatures = [
  "Unlimited reflections",
  "Deep pattern analysis across entries",
  "Emotional trend tracking",
  "Overthinking loop detection",
  "Priority AI model (deeper insight)",
  "Export your journal anytime",
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. One click in Settings. No retention calls, no friction. Your access continues until the end of the billing period.",
  },
  {
    q: "Is my journal really private?",
    a: "Yes. Entries are encrypted at rest, never sold, and never used to train external AI models. We treat privacy as a precondition, not a feature.",
  },
  {
    q: "What's the difference between Free and Pro?",
    a: "Free gives you 3 reflections per week — enough to try the practice. Pro removes the limit and unlocks pattern analysis across entries, emotional trends, and overthinking-loop detection.",
  },
  {
    q: "Do you offer refunds?",
    a: "If you're not satisfied within the first 14 days, email us and we'll refund the most recent payment, no questions asked.",
  },
  {
    q: "Will the price ever change?",
    a: "If you're already subscribed, your price is locked in. New users may see different pricing if we adjust it later.",
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const handlePremiumClick = () => {
    trackEvent("cta_click_pricing", { plan: "premium" });
    if (!user) {
      navigate("/auth");
      return;
    }
    if (isPremium) {
      navigate("/app/settings");
      return;
    }
    setPaywallOpen(true);
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "NexoMind Premium",
      description: "Unlimited private AI journaling with deeper reflection insights.",
      brand: { "@type": "Organization", name: "NexoMind" },
      offers: {
        "@type": "Offer",
        price: "9.99",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/pricing`,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "9.99",
          priceCurrency: "USD",
          billingDuration: "P1M",
          unitText: "month",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Pricing", item: `${SITE_URL}/pricing` },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#F3F4ED]">
      <Seo
        title="Pricing — NexoMind"
        description="Simple pricing for NexoMind. Start free with 3 reflections a week. Upgrade to unlimited for $9.99/month. Cancel anytime."
        canonical={`${SITE_URL}/pricing`}
        jsonLd={jsonLd}
        type="website"
      />
      <Navbar />

      <section className="px-6 pt-32 pb-16 max-w-5xl mx-auto text-center">
        <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-4">
          ( Pricing )
        </p>
        <h1 className="font-instrument text-[48px] md:text-[80px] leading-[1] tracking-tight text-[#111]">
          One price. <span className="italic">Total clarity.</span>
        </h1>
        <p className="font-barlow text-[17px] md:text-[19px] leading-relaxed text-[#111]/65 mt-6 max-w-xl mx-auto">
          Start free. Upgrade when you're ready. Cancel anytime — one click, no friction.
        </p>
      </section>

      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-5">
          {/* Free */}
          <article className="bg-white rounded-[24px] p-8 md:p-10 border border-black/5 flex flex-col">
            <p className="font-barlow font-medium text-[11px] tracking-[0.22em] uppercase text-[#111]/50">
              Free
            </p>
            <h2 className="font-instrument text-[40px] text-[#111] mt-3">
              Try the practice
            </h2>
            <p className="font-barlow text-[15px] text-[#111]/60 mt-3 leading-relaxed">
              Enough to feel what reflection does to a noisy mind.
            </p>

            <div className="mt-8">
              <span className="font-instrument text-[56px] text-[#111] leading-none">$0</span>
              <span className="font-barlow text-[15px] text-[#111]/55 ml-2">forever</span>
            </div>

            <ul className="mt-8 space-y-3 flex-1">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 font-barlow text-[15px] text-[#111]/80">
                  <Check className="w-4 h-4 mt-1 text-[#111]/55 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/auth"
              onClick={() => trackEvent("cta_click_pricing", { plan: "free" })}
              className="mt-10 block text-center bg-[#F3F4ED] border border-black/10 text-[#111] rounded-full px-6 py-3.5 font-barlow font-medium text-[14px] hover:bg-black/5 transition-colors"
            >
              Start free
            </Link>
          </article>

          {/* Pro */}
          <article className="bg-[#111] text-white rounded-[24px] p-8 md:p-10 flex flex-col relative overflow-hidden">
            <div className="absolute top-6 right-6 font-barlow text-[10px] tracking-[0.2em] uppercase bg-white/10 text-white/85 rounded-full px-3 py-1.5">
              Most popular
            </div>
            <p className="font-barlow font-medium text-[11px] tracking-[0.22em] uppercase text-white/55">
              Premium
            </p>
            <h2 className="font-instrument text-[40px] mt-3">
              Unlimited <span className="italic">clarity.</span>
            </h2>
            <p className="font-barlow text-[15px] text-white/60 mt-3 leading-relaxed max-w-xs">
              For when reflection becomes part of how you live.
            </p>

            <div className="mt-8">
              <span className="font-instrument text-[56px] leading-none">$9.99</span>
              <span className="font-barlow text-[15px] text-white/55 ml-2">/month</span>
            </div>
            <p className="font-barlow text-[12px] text-white/45 mt-1">
              Billed monthly · cancel anytime
            </p>

            <ul className="mt-8 space-y-3 flex-1">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 font-barlow text-[15px] text-white/85">
                  <Check className="w-4 h-4 mt-1 text-white/65 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handlePremiumClick}
              className="mt-10 block w-full text-center bg-white text-[#111] rounded-full px-6 py-3.5 font-barlow font-medium text-[14px] hover:bg-white/90 transition-colors"
            >
              {isPremium ? "Manage subscription" : user ? "Upgrade to Premium" : "Start free, upgrade anytime"}
            </button>

          </article>
        </div>

        <p className="text-center font-barlow text-[13px] text-[#111]/55 mt-10">
          14-day refund · No hidden fees · Encrypted &amp; never sold
        </p>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-28 max-w-3xl mx-auto">
        <h2 className="font-instrument text-[36px] md:text-[48px] text-[#111] tracking-tight mb-10">
          Questions, answered.
        </h2>
        <dl className="space-y-8">
          {faqs.map((f) => (
            <div key={f.q} className="border-b border-black/10 pb-8 last:border-none">
              <dt className="font-instrument text-[22px] text-[#111] mb-3">{f.q}</dt>
              <dd className="font-barlow text-[16px] text-[#111]/70 leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <SiteFooter />
    </main>
  );
};

export default Pricing;
