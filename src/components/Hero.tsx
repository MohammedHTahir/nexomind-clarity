import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

const Hero = () => {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Defer video mount until after first paint so it doesn't compete with LCP
    const w = window as any;
    const idle = w.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 200));
    const handle = idle(() => setShowVideo(true));
    return () => {
      const cancel = w.cancelIdleCallback || clearTimeout;
      cancel(handle);
    };
  }, []);

  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden flex items-center justify-center">
      {/* Placeholder backdrop — paints instantly, replaced by video once idle */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 bg-gradient-to-br from-[#1a1a2a] via-[#2a2a3a] to-[#1a1a2a]"
      />
      {/* Video bg (lazy-mounted) */}
      {showVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
            type="video/mp4"
          />
        </video>
      )}

      {/* Readability overlay — dark scrim for light video */}
      <div className="absolute inset-0 z-[1] bg-black/45" aria-hidden />
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-black/20 to-black/60"
        aria-hidden
      />

      {/* Hero content */}
      <div className="relative z-10 text-center px-6 pt-32 pb-16 max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1, ease }}
          className="font-barlow font-medium text-[13px] md:text-[14px] text-white/70 mb-6 tracking-wide"
        >
          For when your mind won't slow down.
        </motion.p>

        <motion.h1
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease }}
          className="text-white"
        >
          <span className="block font-barlow font-medium text-[40px] md:text-[68px] lg:text-[80px] leading-[1.05] md:leading-[0.95] tracking-[-1.5px] md:tracking-[-4px]">
            Understand your thoughts
          </span>
          <span className="block font-instrument italic text-[48px] md:text-[76px] lg:text-[96px] leading-[1.05] md:leading-[1] mt-2">
            in seconds.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease }}
          className="font-barlow font-medium text-[16px] md:text-[19px] text-white/85 mt-8 max-w-xl mx-auto leading-relaxed"
        >
          A private AI journaling app that turns overthinking into clarity — in under 30 seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45, ease }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <Link
            to="/auth"
            className="bg-white text-[#111] rounded-full px-8 py-4 font-barlow font-medium text-[15px] hover:bg-white/90 hover:scale-[1.02] transition-all duration-300"
          >
            Start your first reflection — free
          </Link>
          <p className="font-barlow text-sm text-white/65">
            Free to start · <span className="text-white/85">$9.99/mo</span> for unlimited · cancel anytime
          </p>
          <p className="font-barlow text-xs text-white/45">
            Takes under 30 seconds.
          </p>
        </motion.div>

        {/* Social proof */}
        <motion.figure
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease }}
          className="mt-12 max-w-lg mx-auto"
        >
          <blockquote className="font-instrument italic text-[20px] md:text-[22px] text-white/90 leading-snug">
            “I stopped spiraling at 1am. It just… listened, and made sense of it.”
          </blockquote>
          <figcaption className="font-barlow text-[12px] tracking-[0.14em] uppercase text-white/55 mt-3">
            Maya · early user
          </figcaption>
        </motion.figure>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-barlow text-[12px] tracking-[0.12em] uppercase text-white/55"
        >
          <span>Private by design</span>
          <span className="opacity-40">•</span>
          <span>Encrypted reflections</span>
          <span className="opacity-40">•</span>
          <span>No data sold</span>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
