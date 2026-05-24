import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import Seo from "@/components/Seo";
import { ArrowUpRight } from "lucide-react";
import { comparisonSeoPages } from "@/pages/seo/comparisonSeoPages";

const Compare = () => {
  return (
    <main className="min-h-screen bg-[#F3F4ED]">
      <Seo
        title="Compare NexoMind — Day One, Reflectly, Stoic, Apple Journal"
        description="Honest, side-by-side comparisons of NexoMind against the most popular journaling apps. See which fits how you actually reflect."
        canonical="https://www.nexomind.ai/compare"
      />
      <Navbar />

      <section className="px-6 pt-40 pb-24">
        <div className="max-w-4xl mx-auto">
          <p className="font-barlow text-[12px] tracking-[0.22em] uppercase text-[#111]/50 mb-6">
            Compare
          </p>
          <h1 className="font-instrument text-[44px] md:text-[68px] leading-[1.05] tracking-tight text-[#111]">
            How NexoMind <span className="italic text-[#111]/60">compares.</span>
          </h1>
          <p className="font-barlow text-[17px] text-[#111]/65 mt-6 max-w-2xl leading-relaxed">
            Choosing a journaling app is personal. These are honest, side-by-side
            comparisons — including when another app is the better choice.
          </p>
        </div>
      </section>

      <section className="px-6 pb-32">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-5">
          {comparisonSeoPages.map((p) => (
            <Link
              key={p.path}
              to={p.path}
              className="group bg-white rounded-[20px] p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-shadow flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <p className="font-barlow text-[11px] tracking-[0.22em] uppercase text-[#111]/45 mb-3">
                  {p.eyebrow}
                </p>
                <h2 className="font-instrument text-[28px] leading-tight tracking-tight text-[#111]">
                  {p.title} <span className="italic text-[#111]/60">{p.italic}</span>
                </h2>
                <p className="font-barlow text-[14px] text-[#111]/60 mt-3 leading-relaxed line-clamp-3">
                  {p.intro}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 font-barlow text-[13px] text-[#111] opacity-80 group-hover:opacity-100">
                <span>Read comparison</span>
                <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
};

export default Compare;
