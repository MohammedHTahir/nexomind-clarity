import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

type Result = {
  trigger: string;
  thought_loop: string;
  distortion: string;
  clarity: string;
};

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seo-ai`;
const SHARE_URL = "https://www.nexomind.ai/overthinking-analyzer";

const fields: { key: keyof Result; label: string }[] = [
  { key: "trigger", label: "Trigger" },
  { key: "thought_loop", label: "Thought loop" },
  { key: "distortion", label: "Distortion" },
  { key: "clarity", label: "Clarity" },
];

const formatShareText = (r: Result) =>
  [
    "I just analyzed an overthinking loop with NexoMind:",
    "",
    `· Trigger — ${r.trigger}`,
    `· Thought loop — ${r.thought_loop}`,
    `· Distortion — ${r.distortion}`,
    `· Clarity — ${r.clarity}`,
    "",
    `Try it free → ${SHARE_URL}`,
  ].join("\n");

const OverthinkingAnalyzer = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const submit = async () => {
    if (text.trim().length < 4) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch(FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ mode: "analyze", content: text }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Something went wrong");
      setResult(data as Result);
      trackEvent("overthinking_analyzer_result", { word_count: text.trim().split(/\s+/).filter(Boolean).length });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = async (current: Result) => {
    const payload = formatShareText(current);
    try {
      await navigator.clipboard.writeText(payload);
      toast.success("Copied — paste anywhere.");
      trackEvent("overthinking_analyzer_copy", { method: "clipboard" });
    } catch {
      toast.error("Couldn't copy. Long-press the result to select it instead.");
    }
  };

  const shareResult = async (current: Result) => {
    const payload = formatShareText(current);
    // Web Share API on mobile / supported browsers — falls back to copy.
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "NexoMind — Overthinking Analyzer",
          text: payload,
          url: SHARE_URL,
        });
        trackEvent("overthinking_analyzer_share", { method: "web_share" });
        return;
      } catch (err) {
        // User cancelled the share sheet — silent return.
        if (err instanceof Error && err.name === "AbortError") return;
        // Real failure — fall through to clipboard fallback.
      }
    }
    await copyResult(current);
    trackEvent("overthinking_analyzer_share", { method: "clipboard_fallback" });
  };

  return (
    <section
      aria-label="Overthinking analyzer"
      className="my-16 rounded-[24px] bg-white border border-black/5 p-6 md:p-10 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
    >
      <p className="font-barlow font-medium text-[11px] tracking-[0.22em] uppercase text-[#111]/50 mb-3">
        Try it now — free
      </p>
      <h2 className="font-instrument text-[28px] md:text-[36px] leading-tight text-[#111] mb-2">
        Analyze your overthinking loop.
      </h2>
      <p className="font-barlow text-[15px] text-[#111]/60 mb-6">
        Write what's looping in your head. NexoMind will name the trigger, the loop, the distortion, and a path to clarity.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write what's on your mind..."
        rows={4}
        maxLength={2000}
        className="w-full resize-none rounded-2xl border border-black/10 bg-[#FAFAF7] p-4 font-barlow text-[16px] text-[#111] placeholder:text-[#111]/35 focus:outline-none focus:border-[#111]/40 transition"
      />

      <div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
        <span className="font-barlow text-[13px] text-[#111]/40">
          {text.length}/2000 — private, not stored.
        </span>
        <button
          onClick={submit}
          disabled={loading || text.trim().length < 4}
          className="inline-flex items-center gap-2 bg-[#111] text-white rounded-full px-7 py-3 font-barlow font-medium text-[14px] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>

      {error && (
        <p className="mt-5 font-barlow text-[14px] text-red-700/80">{error}</p>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 grid md:grid-cols-2 gap-3"
          >
            {fields.map((f) => (
              <div
                key={f.key}
                className="rounded-2xl bg-[#F3F4ED] border border-black/5 p-5"
              >
                <p className="font-barlow font-medium text-[10px] tracking-[0.22em] uppercase text-[#111]/45 mb-2">
                  {f.label}
                </p>
                <p className="font-instrument text-[18px] md:text-[20px] leading-snug text-[#111]">
                  {result[f.key]}
                </p>
              </div>
            ))}
            <div className="md:col-span-2 mt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/auth"
                className="inline-block bg-[#111] text-white rounded-full px-7 py-3 font-barlow font-medium text-[14px] hover:bg-black transition"
              >
                Go deeper — start your first reflection
              </Link>
              <button
                type="button"
                onClick={() => copyResult(result)}
                className="inline-flex items-center gap-2 bg-transparent border border-[#111]/15 text-[#111] rounded-full px-5 py-3 font-barlow font-medium text-[14px] hover:bg-[#111]/5 transition"
                aria-label="Copy result to clipboard"
              >
                Copy result
              </button>
              <button
                type="button"
                onClick={() => shareResult(result)}
                className="inline-flex items-center gap-2 bg-transparent border border-[#111]/15 text-[#111] rounded-full px-5 py-3 font-barlow font-medium text-[14px] hover:bg-[#111]/5 transition"
                aria-label="Share result"
              >
                Share
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default OverthinkingAnalyzer;
