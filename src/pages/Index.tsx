import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ScrollHeroImage from "@/components/ScrollHeroImage";
import InstallPWA from "@/components/InstallPWA";
import Seo from "@/components/Seo";
import { useIsStandalone } from "@/hooks/useIsStandalone";
import { useAuth } from "@/hooks/useAuth";

// Below-the-fold — lazy load to slim the initial JS bundle
const About = lazy(() => import("@/components/About"));
const AiDemo = lazy(() => import("@/components/AiDemo"));
const DemoVideo = lazy(() => import("@/components/DemoVideo"));
const Features = lazy(() => import("@/components/Features"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const FAQ = lazy(() => import("@/components/FAQ"));
const BlogPreview = lazy(() => import("@/components/BlogPreview"));
const FooterCTA = lazy(() => import("@/components/FooterCTA"));
const WhatIsNexoMind = lazy(() => import("@/components/WhatIsNexoMind"));
const SiteFooter = lazy(() => import("@/components/SiteFooter"));
const InstantAiDemo = lazy(() => import("@/components/seo/InstantAiDemo"));
const TopicLinks = lazy(() => import("@/components/TopicLinks"));

const Fallback = () => <div className="h-32" aria-hidden />;

const Index = () => {
  const standalone = useIsStandalone();
  const { user, loading } = useAuth();

  // When launched as an installed PWA, never show the marketing page:
  // signed-in users go straight to /app, guests to /welcome.
  if (standalone && !loading) {
    return <Navigate to={user ? "/app" : "/welcome"} replace />;
  }

  const homeFaqs = [
    { q: "Is my journal really private?", a: "Yes. Entries are encrypted at rest and never sold or used to train external models. On Premium+, end-to-end encryption and on-device AI mean not even we can read them." },
    { q: "What do I get on Free vs Premium vs Premium+?", a: "Free gives you 3 reflections a week and AI insight on each entry. Premium ($9.99/mo or $95/yr) unlocks unlimited reflections, deep pattern analysis, emotional trends, voice entries, your Sunday Letter, and the Therapist Brief. Premium+ ($49.00/mo or $470/yr) adds end-to-end encryption and on-device AI for maximum privacy." },
    { q: "What's the Sunday Letter?", a: "A private weekly letter from your AI mentor — what shifted this week, the loops it noticed, and one quiet thing to watch for. It arrives every Sunday morning." },
    { q: "Can I use voice instead of typing?", a: "Yes. Premium members can speak a reflection and NexoMind will transcribe and analyze it privately — useful for late nights or walks." },
    { q: "Can I share insights with my therapist?", a: "Yes. The Therapist Brief generates a concise, professional summary of your week that you can export and share — entirely under your control." },
    { q: "Is NexoMind a replacement for therapy?", a: "No. It's a reflective companion. We strongly encourage pairing it with professional support when you need it." },
    { q: "Can I cancel anytime?", a: "Yes — one click in Settings. No retention calls, no friction. Access continues until the end of the billing period." },
    { q: "Can I export my entries?", a: "Anytime — as Markdown or PDF. Your words belong to you." },
  ];

  return (
    <main className="min-h-screen bg-[#F3F4ED]">
      <Seo
        title="NexoMind — AI journaling for a quieter mind"
        description="NexoMind is the private AI journaling app that turns racing thoughts into clarity. Reflect, understand patterns, and quiet overthinking."
        canonical="https://www.nexomind.ai/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "NexoMind",
            url: "https://www.nexomind.ai/",
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "@id": "https://www.nexomind.ai/#softwareapp",
            name: "NexoMind",
            url: "https://www.nexomind.ai/",
            applicationCategory: "HealthApplication",
            applicationSubCategory: "AI Journaling",
            operatingSystem: "Web, iOS, Android",
            description: "Private AI journaling platform that helps users stop overthinking and gain mental clarity through structured AI reflection.",
            publisher: { "@id": "https://www.nexomind.ai/#organization" },
            featureList: [
              "AI journaling",
              "Mental clarity insights",
              "Overthinking analysis",
              "Private reflection",
              "Emotional trend tracking",
              "Thought processing",
            ],
            offers: {
              "@type": "Offer",
              price: "9.99",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: "https://www.nexomind.ai/auth",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: homeFaqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <Navbar />
      <Hero />
      <ScrollHeroImage />
      <InstallPWA variant="floating" />
      <Suspense fallback={<Fallback />}>
        <About />
        <DemoVideo />
        <AiDemo />

        {/* Live AI demo — interactive, ranks for engagement signals */}
        <section className="px-6 py-24 bg-[#F3F4ED]">
          <div className="max-w-4xl mx-auto">
            <InstantAiDemo
              variant="dark"
              heading="See it in real time."
              subheading="Type a thought. Watch NexoMind reflect it back as clarity."
              placeholder="What's looping in your head right now?"
            />
          </div>
        </section>

        <Features />
        <Testimonials />
        <FAQ />
        <BlogPreview />
        <TopicLinks />
        <WhatIsNexoMind />
        <FooterCTA />
        <SiteFooter />
      </Suspense>
    </main>
  );
};

export default Index;
