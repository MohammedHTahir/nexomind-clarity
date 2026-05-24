import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import Seo from "@/components/Seo";
import { toast } from "sonner";

const ease = [0.16, 1, 0.3, 1] as const;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery hash automatically and emits a
    // PASSWORD_RECOVERY event with a temporary session.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().min(8, "At least 8 characters").max(72).safeParse(password);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated.");
    navigate("/app", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F3F4ED] text-[#111] relative overflow-hidden flex items-center justify-center px-6">
      <Seo
        title="Reset your NexoMind password"
        description="Set a new password for your NexoMind account and get back to your private, calm reflection practice in seconds."
        noindex
      />
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
            ( Set a new password )
          </p>
          <h1 className="font-instrument text-[40px] md:text-[52px] leading-[1.05]">
            Choose a new <span className="italic">passphrase.</span>
          </h1>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-[22px] border border-black/5 p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          {!ready ? (
            <p className="text-center font-barlow text-[13px] text-[#111]/55 py-4">
              Verifying your reset link…
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                className="w-full bg-white/80 border border-black/5 rounded-full px-5 py-3 font-barlow text-[14px] outline-none focus:border-black/20 transition-colors placeholder:text-[#111]/35"
              />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
                className="w-full bg-white/80 border border-black/5 rounded-full px-5 py-3 font-barlow text-[14px] outline-none focus:border-black/20 transition-colors placeholder:text-[#111]/35"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#111] text-white rounded-full px-6 py-3 font-barlow font-medium text-[14px] hover:bg-black transition-colors disabled:opacity-40"
              >
                {submitting ? "Saving…" : "Update password"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
