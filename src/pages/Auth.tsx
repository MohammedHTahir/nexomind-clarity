import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ease = [0.16, 1, 0.3, 1] as const;
const OAUTH_REDIRECT_KEY = "nexomind:oauth_redirect";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/app", { replace: true });
  }, [loading, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        toast.success("Welcome to NexoMind.");
        navigate("/onboarding", { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        navigate("/app", { replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const forgotPassword = async () => {
    const emailParse = z.string().trim().email().max(255).safeParse(email);
    if (!emailParse.success) {
      toast.error("Enter your email above first, then tap 'Forgot password'.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(emailParse.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your inbox for a reset link.");
  };

  const google = async () => {
    setSubmitting(true);
    localStorage.setItem(OAUTH_REDIRECT_KEY, "app");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: { prompt: "select_account" },
    });
    if (result.error) {
      localStorage.removeItem(OAUTH_REDIRECT_KEY);
      toast.error(result.error.message || "Google sign-in failed");
      setSubmitting(false);
      return;
    }
    if (result.redirected) return;
    localStorage.removeItem(OAUTH_REDIRECT_KEY);
    navigate("/app", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F3F4ED] text-[#111] relative overflow-hidden flex items-center justify-center px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #C9D2E8 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-35 blur-3xl"
        style={{ background: "radial-gradient(circle, #E0D5EE 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="font-instrument text-[28px] tracking-tight">
            nexo<span className="italic text-[#111]/60">mind</span>
          </Link>
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mt-6 mb-3">
            ( {mode === "signin" ? "Welcome back" : "Create your space"} )
          </p>
          <h1 className="font-instrument text-[40px] md:text-[52px] leading-[1.05]">
            {mode === "signin" ? (
              <>
                Continue your <span className="italic">reflection.</span>
              </>
            ) : (
              <>
                Begin your <span className="italic">clarity.</span>
              </>
            )}
          </h1>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-[22px] border border-black/5 p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <form onSubmit={submit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              className="w-full bg-white/80 border border-black/5 rounded-full px-5 py-3 font-barlow text-[14px] outline-none focus:border-black/20 transition-colors placeholder:text-[#111]/35"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="w-full bg-white/80 border border-black/5 rounded-full px-5 py-3 font-barlow text-[14px] outline-none focus:border-black/20 transition-colors placeholder:text-[#111]/35"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#111] text-white rounded-full px-6 py-3 font-barlow font-medium text-[14px] hover:bg-black transition-colors disabled:opacity-40"
            >
              {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
            {mode === "signin" && (
              <button
                type="button"
                onClick={forgotPassword}
                disabled={submitting}
                className="block mx-auto pt-1 font-barlow text-[12px] text-[#111]/55 hover:text-[#111] transition-colors disabled:opacity-40"
              >
                Forgot password?
              </button>
            )}
          </form>

          <div className="flex items-center gap-3 my-5">
            <span className="flex-1 h-px bg-black/10" />
            <span className="font-barlow text-[11px] uppercase tracking-wider text-[#111]/40">or</span>
            <span className="flex-1 h-px bg-black/10" />
          </div>

          <button
            onClick={google}
            disabled={submitting}
            className="w-full bg-white border border-black/10 text-[#111] rounded-full px-6 py-3 font-barlow font-medium text-[14px] hover:bg-white/90 transition-colors disabled:opacity-40"
          >
            Continue with Google
          </button>

          <AnimatePresence mode="wait">
            <motion.button
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="block mx-auto mt-6 font-barlow text-[13px] text-[#111]/55 hover:text-[#111] transition-colors"
            >
              {mode === "signin"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </motion.button>
          </AnimatePresence>
        </div>

        <p className="text-center font-barlow text-[12px] text-[#111]/40 mt-6">
          Private by design. Your reflections are only ever visible to you.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
