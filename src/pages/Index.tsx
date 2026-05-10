import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

// Below-the-fold — lazy load to slim the initial JS bundle
const About = lazy(() => import("@/components/About"));
const AiDemo = lazy(() => import("@/components/AiDemo"));
const Features = lazy(() => import("@/components/Features"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const FAQ = lazy(() => import("@/components/FAQ"));
const BlogPreview = lazy(() => import("@/components/BlogPreview"));
const FooterCTA = lazy(() => import("@/components/FooterCTA"));
const WhatIsNexoMind = lazy(() => import("@/components/WhatIsNexoMind"));
const SiteFooter = lazy(() => import("@/components/SiteFooter"));
const InstantAiDemo = lazy(() => import("@/components/seo/InstantAiDemo"));

const Fallback = () => <div className="h-32" aria-hidden />;

const Index = () => {
  return (
    <main className="min-h-screen bg-[#F3F4ED]">
      <Navbar />
      <Hero />
      <Suspense fallback={<Fallback />}>
        <About />
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
        <WhatIsNexoMind />
        <FooterCTA />
        <SiteFooter />
      </Suspense>
    </main>
  );
};

export default Index;
