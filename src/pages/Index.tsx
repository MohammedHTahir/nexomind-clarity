import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import FooterCTA from "@/components/FooterCTA";

const Index = () => {
  return (
    <main className="min-h-screen bg-[#F3F4ED]">
      <Navbar />
      <Hero />
      <About />
      <Features />
      <Testimonials />
      <FAQ />
      <FooterCTA />
    </main>
  );
};

export default Index;
