import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import Seo from "@/components/Seo";

const ease = [0.16, 1, 0.3, 1] as const;

const MobileWelcome = () => {
  const { user, loading } = useAuth();

  // Already signed in? Go to the app immediately.
  if (!loading && user) return <Navigate to="/app" replace />;

  return (
    <main
      className="min-h-[100dvh] w-full relative overflow-hidden text-white flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #1a1a2a 0%, #232338 45%, #1a1a2a 100%)",
      }}
    >
      <Seo
        title="Welcome to NexoMind"
        description="A private AI journaling app that turns overthinking into clarity in under 30 seconds."
        noindex
      />

      {/* Soft ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-20 w-[460px] h-[460px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #4a4a7a 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-20 w-[420px] h-[420px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #6b5b8a 0%, transparent 70%)" }}
      />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pt-20 pb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
          className="font-instrument text-[42px] leading-none tracking-tight"
        >
          nexo<span className="italic text-white/70">mind</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease }}
          className="mt-8 font-instrument italic text-[34px] leading-[1.1] max-w-[20rem]"
        >
          Clarity, one thought at a time.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 0.75, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease }}
          className="mt-5 font-barlow text-[14px] text-white/70 max-w-[18rem]"
        >
          A private AI journal that listens, understands, and reflects you back to yourself.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.45, ease }}
        className="relative z-10 px-6 pb-10 flex flex-col gap-3"
      >
        <Link
          to="/auth?mode=signup"
          className="w-full text-center bg-white text-[#111] rounded-full py-4 font-barlow font-medium text-[15px] active:scale-[0.98] transition-transform"
        >
          Create account
        </Link>
        <Link
          to="/auth?mode=signin"
          className="w-full text-center bg-white/10 border border-white/20 text-white rounded-full py-4 font-barlow font-medium text-[15px] active:scale-[0.98] transition-transform"
        >
          Sign in
        </Link>
        <p className="text-center text-[11px] text-white/45 font-barlow mt-2 tracking-wide">
          Private by design · Encrypted · No data sold
        </p>
      </motion.div>
    </main>
  );
};

export default MobileWelcome;
