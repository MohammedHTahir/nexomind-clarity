import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ScrollHeroImage from "@/components/ScrollHeroImage";
import InstallPWA from "@/components/InstallPWA";
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

  return (
    <main className="min-h-screen bg-[#F3F4ED]">
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
