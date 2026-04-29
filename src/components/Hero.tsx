import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ease = [0.16, 1, 0.3, 1] as const;

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden flex items-center justify-center">
      {/* Video bg */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
          type="video/mp4"
        />
      </video>

      {/* Subtle readability overlay */}
      <div className="absolute inset-0 z-[1] bg-white/25 backdrop-blur-[2px]" aria-hidden />

      {/* Hero content */}
      <div className="relative z-10 text-center px-6 pt-32 pb-16 max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1, ease }}
          className="font-barlow font-medium text-[13px] md:text-[14px] text-white/70 mb-6 tracking-wide"
        >
          For when your mind feels noisy.
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease }}
          className="text-white"
        >
          <span className="block font-barlow font-medium text-[40px] md:text-[68px] lg:text-[80px] leading-[1.05] md:leading-[0.95] tracking-[-1.5px] md:tracking-[-4px]">
            Clear your mind
          </span>
          <span className="block font-instrument italic text-[48px] md:text-[76px] lg:text-[96px] leading-[1.05] md:leading-[1] mt-2">
            with AI journaling
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease }}
          className="font-barlow font-medium text-[16px] md:text-[18px] text-white/85 mt-8 max-w-xl mx-auto"
        >
          Write what's on your mind. NexoMind helps you understand your thoughts
          and emotions — privately, in seconds.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease }}
          className="font-barlow text-sm text-white/60 mt-4 max-w-xl mx-auto"
        >
          A private AI journaling app for reflection, clarity, and emotional insight.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45, ease }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <Link
            to="/onboarding"
            className="bg-white text-[#111] rounded-full px-8 py-4 font-barlow font-medium text-[15px] hover:bg-white/90 hover:scale-[1.02] transition-all duration-300"
          >
            Start your first reflection
          </Link>
          <p className="font-barlow text-sm text-white/60">
            No signup required
          </p>
          <p className="font-barlow text-sm text-white/50">
            Takes less than 30 seconds to get your first insight.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1, delay: 0.65, ease }}
          className="font-barlow italic text-sm text-white mt-8"
        >
          Used when your thoughts feel too loud.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1, delay: 0.8, ease }}
          className="font-barlow text-sm text-white mt-6 tracking-wide"
        >
          Private. Secure. Judgment-free.
        </motion.p>
      </div>
    </section>
  );
};

export default Hero;
