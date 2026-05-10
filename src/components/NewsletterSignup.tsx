import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";

interface NewsletterSignupProps {
  source?: string;
}

const NewsletterSignup = ({ source = "footer" }: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const trimmed = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setStatus("error");
      setError("Please enter a valid email.");
      return;
    }

    const { error: insertError } = await supabase.from("email_leads").insert({
      email: trimmed,
      source,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
    });

    // Treat duplicate-key as success — user is already subscribed.
    if (insertError && !insertError.message.toLowerCase().includes("duplicate")) {
      setStatus("error");
      setError("Something went wrong. Please try again.");
      return;
    }

    setStatus("success");
    setEmail("");
    trackEvent("newsletter_signup", { source });
  };

  return (
    <div>
      <p className="font-barlow font-medium text-[11px] tracking-[0.22em] uppercase text-white/45 mb-5">
        Stay in the loop
      </p>
      <p className="font-barlow text-[14px] text-white/65 leading-relaxed mb-5 max-w-xs">
        Occasional notes on overthinking, clarity, and product updates. No spam.
      </p>

      {status === "success" ? (
        <p className="font-barlow text-[14px] text-white/85">
          Thanks — you're on the list.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-2 max-w-xs">
          <div className="flex">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              className="flex-1 bg-white/5 border border-white/15 rounded-l-full px-4 py-2.5 font-barlow text-[14px] text-white placeholder:text-white/35 focus:outline-none focus:border-white/40 transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-white text-[#111] rounded-r-full px-5 py-2.5 font-barlow font-medium text-[13px] hover:bg-white/90 transition-colors disabled:opacity-60"
            >
              {status === "loading" ? "…" : "Join"}
            </button>
          </div>
          {error && (
            <p className="font-barlow text-[12px] text-red-300/80">{error}</p>
          )}
        </form>
      )}
    </div>
  );
};

export default NewsletterSignup;
