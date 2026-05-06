import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import AiDemo from "@/components/AiDemo";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import BlogPreview from "@/components/BlogPreview";
import FooterCTA from "@/components/FooterCTA";
import SiteFooter from "@/components/SiteFooter";

const InstantAiDemo = lazy(() => import("@/components/seo/InstantAiDemo"));

const Index = () => {
  return (
    <main className="min-h-screen bg-[#F3F4ED]">
      <Navbar />
      <Hero />
      <About />
      <AiDemo />

      {/* Live AI demo — interactive, ranks for engagement signals */}
      <section className="px-6 py-24 bg-[#F3F4ED]">
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<div className="h-64" aria-hidden />}>
            <InstantAiDemo
              variant="dark"
              heading="See it in real time."
              subheading="Type a thought. Watch NexoMind reflect it back as clarity."
              placeholder="What's looping in your head right now?"
            />
          </Suspense>
        </div>
      </section>

      <Features />
      <Testimonials />
      <FAQ />
      <BlogPreview />
      <FooterCTA />
      <SiteFooter />
    </main>
  );
};

export default Index;
