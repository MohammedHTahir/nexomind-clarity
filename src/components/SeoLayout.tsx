import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import FooterCTA from "@/components/FooterCTA";

const ease = [0.16, 1, 0.3, 1] as const;

interface SeoLayoutProps {
  eyebrow: string;
  title: ReactNode;
  italic?: string;
  intro: string;
  children: ReactNode;
  related: { to: string; label: string; desc: string }[];
}

const SeoLayout = ({ eyebrow, title, italic, intro, children, related }: SeoLayoutProps) => {
  return (
    <main className="min-h-screen bg-[#F3F4ED] text-[#111]">
      <Navbar />

      {/* Hero */}
      <section className="px-6 pt-40 pb-20 max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-6"
        >
          ( {eyebrow} )
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease }}
          className="font-instrument text-[44px] md:text-[80px] leading-[1] tracking-tight text-[#111]"
        >
          {title}
          {italic && <> <span className="italic">{italic}</span></>}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease }}
          className="font-barlow text-[17px] md:text-[19px] leading-relaxed text-[#111]/70 mt-8 max-w-2xl"
        >
          {intro}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease }}
          className="mt-10"
        >
          <Link
            to="/auth"
            className="inline-block bg-[#111] text-white rounded-full px-8 py-4 font-barlow font-medium text-[15px] hover:bg-black hover:scale-[1.02] transition-all duration-300"
          >
            Start your first reflection
          </Link>
          <p className="font-barlow text-sm text-[#111]/50 mt-3">
            Free to try — takes less than 30 seconds.
          </p>
        </motion.div>
      </section>

      {/* Body */}
      <article className="px-6 pb-24 max-w-3xl mx-auto">{children}</article>

      {/* Related */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-6">
          ( Continue reading )
        </p>
        <div className="grid md:grid-cols-2 gap-5">
          {related.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className="block bg-white rounded-[20px] p-7 border border-black/5 hover:border-black/15 transition-colors"
            >
              <h3 className="font-instrument text-[26px] leading-tight text-[#111] mb-2">
                {r.label}
              </h3>
              <p className="font-barlow text-[15px] text-[#111]/60 leading-relaxed">
                {r.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <FooterCTA />
    </main>
  );
};

export default SeoLayout;
