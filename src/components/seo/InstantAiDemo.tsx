import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seo-ai`;

interface Props {
  variant?: "light" | "dark";
  heading?: string;
  subheading?: string;
  placeholder?: string;
}

const InstantAiDemo = ({
  variant = "light",
  heading = "Try a reflection in real time.",
  subheading = "Write a thought. Watch it become clarity.",
  placeholder = "I keep replaying a conversation from earlier...",
}: Props) => {
  const [text, setText] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const submit = async () => {
    if (text.trim().length < 4 || loading) return;
    setLoading(true);
    setReply("");
    setError(null);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const resp = await fetch(FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ mode: "stream", content: text }),
        signal: ctrl.signal,
      });
      if (!resp.ok || !resp.body) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j?.error ?? "AI error");
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, i);
          buf = buf.slice(i + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (delta) setReply((p) => p + delta);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError(e instanceof Error ? e.message : "AI error");
    } finally {
      setLoading(false);
    }
  };

  const isDark = variant === "dark";
  return (
    <section
      aria-label="Instant AI reflection demo"
      className={`rounded-[24px] border p-6 md:p-10 ${
        isDark
          ? "bg-[#111] text-white border-white/10"
          : "bg-white text-[#111] border-black/5"
      }`}
    >
      <p
        className={`font-barlow font-medium text-[11px] tracking-[0.22em] uppercase mb-3 ${
          isDark ? "text-white/50" : "text-[#111]/50"
        }`}
      >
        Live AI reflection
      </p>
      <h2
        className={`font-instrument text-[28px] md:text-[36px] leading-tight mb-2 ${
          isDark ? "text-white" : "text-[#111]"
        }`}
      >
        {heading}
      </h2>
      <p
        className={`font-barlow text-[15px] mb-6 ${
          isDark ? "text-white/60" : "text-[#111]/60"
        }`}
      >
        {subheading}
      </p>

      <div className="flex flex-col md:flex-row gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={placeholder}
          maxLength={500}
          className={`flex-1 rounded-full px-5 py-3 font-barlow text-[15px] focus:outline-none transition border ${
            isDark
              ? "bg-white/5 text-white placeholder:text-white/35 border-white/10 focus:border-white/30"
              : "bg-[#FAFAF7] text-[#111] placeholder:text-[#111]/35 border-black/10 focus:border-[#111]/40"
          }`}
        />
        <button
          onClick={submit}
          disabled={loading || text.trim().length < 4}
          className={`rounded-full px-7 py-3 font-barlow font-medium text-[14px] transition disabled:opacity-40 disabled:cursor-not-allowed ${
            isDark
              ? "bg-white text-[#111] hover:bg-white/90"
              : "bg-[#111] text-white hover:bg-black"
          }`}
        >
          {loading ? "Reflecting…" : "Reflect"}
        </button>
      </div>

      <AnimatePresence>
        {(reply || loading) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`mt-6 rounded-2xl p-5 md:p-6 border ${
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-[#F3F4ED] border-black/5"
            }`}
          >
            <p
              className={`font-barlow font-medium text-[10px] tracking-[0.22em] uppercase mb-3 ${
                isDark ? "text-white/45" : "text-[#111]/45"
              }`}
            >
              NexoMind reflection
            </p>
            <p
              className={`font-instrument text-[18px] md:text-[22px] leading-snug whitespace-pre-line ${
                isDark ? "text-white" : "text-[#111]"
              }`}
            >
              {reply || (
                <span className={isDark ? "text-white/40" : "text-[#111]/40"}>
                  Thinking…
                </span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-4 font-barlow text-[14px] text-red-400">{error}</p>
      )}

      {reply && !loading && (
        <div className="mt-6">
          <Link
            to="/auth"
            className={`inline-block rounded-full px-7 py-3 font-barlow font-medium text-[14px] transition ${
              isDark
                ? "bg-white text-[#111] hover:bg-white/90"
                : "bg-[#111] text-white hover:bg-black"
            }`}
          >
            Save your first reflection →
          </Link>
        </div>
      )}
    </section>
  );
};

export default InstantAiDemo;
