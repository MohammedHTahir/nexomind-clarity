import { motion } from "framer-motion";
import TypingMessages from "./TypingMessages";

const ease = [0.16, 1, 0.3, 1] as const;

const Hero = () => {
  return (
    <section className="min-h-screen bg-[#F3F4ED] pt-24 md:pt-32 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 object-cover w-full h-full"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260427_054418_a6d194f0-ac86-4df9-abe5-ded73e596d7c.mp4"
          type="video/mp4"
        />
      </video>

      {/* Soft overlay */}
      <div className="absolute inset-0 z-10 bg-white/10" />

      {/* Typing message inside the phone */}
      <TypingMessages />

      {/* Hero text */}
      <div className="relative z-20 text-center pointer-events-none px-4">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease }}
          className="font-instrument text-[38px] md:text-[56px] lg:text-[72px] leading-[0.9] tracking-tight text-[#1a1a1a] mb-6"
        >
          Clarity, one thought
          <br />
          at a time.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease }}
          className="font-sans text-[16px] md:text-[18px] text-[#1a1a1a]/70 leading-relaxed max-w-xl mx-auto"
        >
          Write freely. NexoMind listens, understands, and helps you make sense of what's on your mind — privately, every day.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.6, ease }}
          className="pointer-events-auto"
        >
          <button
            type="button"
            className="mt-8 px-6 py-3 rounded-full bg-black text-white text-sm hover:scale-[1.02] transition-transform"
          >
            Try your first reflection
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
