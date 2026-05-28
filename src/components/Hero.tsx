import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const ease = [0.16, 1, 0.3, 1] as const;

const Hero = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#F3F4ED] pt-28 md:pt-36 pb-12">
      {/* Subtle warm radial wash + grid */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(900px 520px at 50% -10%, rgba(0,0,0,0.06), transparent 60%), radial-gradient(700px 420px at 50% 110%, rgba(0,0,0,0.05), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 text-center">
        {/* Kicker pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/70 backdrop-blur px-4 py-1.5 text-[12px] md:text-[13px] text-foreground/75 font-barlow"
        >
          <Sparkles className="w-3.5 h-3.5 opacity-70" />
          <span>For when your mind won't slow down</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease }}
          className="mt-6 text-foreground"
        >
          <span className="block font-barlow font-medium text-[40px] md:text-[72px] lg:text-[88px] leading-[1.02] tracking-[-1.5px] md:tracking-[-3.5px]">
            A quieter way to think,
          </span>
          <span className="relative inline-block mt-3">
            <span className="absolute inset-0 -mx-3 md:-mx-5 rounded-[14px] bg-foreground/[0.06] border border-foreground/15" aria-hidden />
            <span className="relative font-instrument italic text-[44px] md:text-[76px] lg:text-[92px] leading-[1.05] px-3 md:px-5 text-foreground/85">
              one thought at a time.
            </span>
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease }}
          className="mt-8 font-barlow text-[15px] md:text-[18px] text-foreground/65 max-w-xl mx-auto leading-relaxed"
        >
          A private AI journal that turns overthinking into clarity — an emotional read, a clarity score, and one quiet reflection. In under 30 seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease }}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            to="/auth"
            onClick={() => trackEvent("cta_click_hero", { location: "hero_primary" })}
            className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-3.5 font-barlow font-medium text-[14px] hover:opacity-90 transition-all"
          >
            Start your first reflection
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/25 bg-white/60 backdrop-blur px-7 py-3.5 font-barlow font-medium text-[14px] text-foreground/85 hover:bg-white/80 transition-all"
          >
            See how it works
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.55, ease }}
          className="mt-4 font-barlow text-[12px] text-foreground/50"
        >
          Free to start · $9.99/mo for unlimited · cancel anytime
        </motion.p>

        {/* Floating testimonial cards (desktop only) */}
        <motion.figure
          initial={{ opacity: 0, x: -20, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 1.1, delay: 0.7, ease }}
          className="hidden lg:block absolute left-[-10px] top-[58%] w-[230px] rotate-[-6deg] bg-white/80 backdrop-blur-sm border border-black/10 rounded-2xl p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.18)]"
        >
          <blockquote className="font-instrument italic text-[15px] text-foreground/85 leading-snug">
            "I stopped spiraling at 1am. It just… listened, and made sense of it."
          </blockquote>
          <figcaption className="mt-3 flex items-center gap-2 font-barlow text-[10px] tracking-[0.14em] uppercase text-foreground/55">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
            Maya · early user
          </figcaption>
        </motion.figure>

        <motion.figure
          initial={{ opacity: 0, x: 20, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 1.1, delay: 0.85, ease }}
          className="hidden lg:block absolute right-[-10px] top-[62%] w-[240px] rotate-[5deg] bg-white/80 backdrop-blur-sm border border-black/10 rounded-2xl p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.18)]"
        >
          <blockquote className="font-instrument italic text-[15px] text-foreground/85 leading-snug">
            "Three minutes a night. My head is quieter than it's been in years."
          </blockquote>
          <figcaption className="mt-3 flex items-center gap-2 font-barlow text-[10px] tracking-[0.14em] uppercase text-foreground/55">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
            Jordan · daily user
          </figcaption>
        </motion.figure>
      </div>

    </section>
  );
};

export default Hero;
