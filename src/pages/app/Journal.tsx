import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { analyzeAndStore, clarityBand, FreeLimitReachedError, type AnalysisRow } from "@/lib/journal";
import ChallengerNotice from "@/components/app/ChallengerNotice";
import VoiceEntryButton from "@/components/app/VoiceEntryButton";
import { useFeatureFlag } from "@/lib/feature-flags";
import { isVoiceSupported } from "@/lib/voice";
import { useSubscription } from "@/hooks/useSubscription";
import PremiumGate from "@/components/PremiumGate";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

const ease = [0.16, 1, 0.3, 1] as const;

const Journal = () => {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const voiceFlagEnabled = useFeatureFlag("voice_entry");
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"write" | "processing" | "done">("write");
  const [result, setResult] = useState<AnalysisRow | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const submit = async () => {
    if (!text.trim()) return;
    setPhase("processing");
    try {
      const { analysis } = await analyzeAndStore(text);
      setResult(analysis);
      setPhase("done");
      trackEvent("journal_entry_created", {
        source: "journal_mode",
        word_count: text.trim().split(/\s+/).filter(Boolean).length,
      });
    } catch (e) {
      if (e instanceof FreeLimitReachedError) {
        toast.error(`You've used all ${e.limit} free reflections this week.`);
      } else {
        const msg = e instanceof Error ? e.message : "Analysis failed";
        toast.error(msg);
      }
      setPhase("write");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F3F4ED] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-60 -left-40 w-[700px] h-[700px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #C9D2E8 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-60 -right-40 w-[700px] h-[700px] rounded-full opacity-35 blur-3xl"
        style={{ background: "radial-gradient(circle, #E0D5EE 0%, transparent 70%)" }}
      />

      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <Link to="/" className="font-instrument text-[22px] tracking-tight">
          nexo<span className="italic text-[#111]/60">mind</span>
        </Link>
        <button
          onClick={() => navigate("/app")}
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-black/5 flex items-center justify-center text-[#111]/60 hover:text-[#111] hover:scale-[1.05] transition-all"
          aria-label="Close"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      <div className="relative z-10 h-full flex">
        <div className="flex-1 flex items-center justify-center px-6 md:px-10">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {phase === "write" && (
                <motion.div
                  key="write"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.7, ease }}
                >
                  <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-4">
                    ( Journaling mode )
                  </p>
                  <textarea
                    autoFocus
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Begin anywhere. Only you can read this."
                    rows={10}
                    className="w-full resize-none bg-transparent outline-none font-instrument text-[26px] md:text-[34px] leading-[1.4] placeholder:text-[#111]/25 text-[#111]"
                  />
                  <div className="flex items-center justify-between mt-6">
                    <span className="font-barlow text-[12px] text-[#111]/40">
                      {text.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    <div className="flex items-center gap-3">
                      {voiceFlagEnabled && isVoiceSupported() && (
                        <VoiceEntryButton
                          demoMode={!isPremium}
                          onComplete={(analysis) => {
                            setResult(analysis);
                            setPhase("done");
                          }}
                        />
                      )}
                      <button
                        onClick={submit}
                        disabled={!text.trim()}
                        className="group flex items-center gap-2 bg-[#111] text-white rounded-full pl-5 pr-1.5 py-1.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors disabled:opacity-30"
                      >
                        <span>Reflect</span>
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#111] group-hover:rotate-45 transition-transform duration-300">
                          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.25} />
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {phase === "processing" && (
                <motion.div
                  key="proc"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease }}
                  className="text-center py-20"
                >
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.9, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-3 h-3 rounded-full bg-[#111]/60 mx-auto mb-6"
                  />
                  <p className="font-instrument italic text-[24px] text-[#111]/70">Listening…</p>
                </motion.div>
              )}

              {phase === "done" && result && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease }}
                >
                  <ChallengerNotice
                    analysisId={result.id}
                    reflectionMode={(result as Record<string, unknown>).reflection_mode as string | undefined}
                  />
                  <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-4">
                    ( Reflection · {clarityBand(result.clarity_score)} )
                  </p>
                  <p className="font-barlow text-[15px] text-[#111]/65 leading-relaxed mb-6">
                    {result.summary}
                  </p>
                  <PremiumGate
                    title="Full reflection"
                    subtitle="Unlock the deeper insight from this entry"
                  >
                    <h2 className="font-instrument text-[34px] md:text-[44px] leading-[1.1] mb-5">
                      {result.clarity_insight}
                    </h2>
                    <div
                      className="rounded-[18px] p-[1px] mb-8"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(180,200,235,0.5), rgba(220,200,235,0.5), rgba(0,0,0,0.05))",
                      }}
                    >
                      <div className="bg-white/80 backdrop-blur-md rounded-[17px] p-5">
                        <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
                          ( A small reflection )
                        </p>
                        <p className="font-instrument italic text-[20px] text-[#111]/85 leading-snug">
                          {result.suggested_reflection}
                        </p>
                      </div>
                    </div>
                  </PremiumGate>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setText("");
                        setResult(null);
                        setPhase("write");
                      }}
                      className="bg-white/70 backdrop-blur-md border border-black/5 text-[#111] rounded-full px-6 py-3 font-barlow font-medium text-[13px] hover:bg-white transition-colors"
                    >
                      Write another
                    </button>
                    <button
                      onClick={() => navigate("/app")}
                      className="bg-[#111] text-white rounded-full px-6 py-3 font-barlow font-medium text-[13px] hover:bg-black transition-colors"
                    >
                      Back to dashboard
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <aside className="hidden lg:flex flex-col justify-center w-[320px] px-8 border-l border-black/5">
          <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-6">
            ( Reflection panel )
          </p>

          <div className="space-y-7">
            <div>
              <p className="font-barlow text-[11px] text-[#111]/45 uppercase tracking-wider mb-2">
                Emotional state
              </p>
              <p className="font-instrument text-[24px]">
                {result?.emotional_state ?? (
                  <span className="text-[#111]/30 italic">awaiting</span>
                )}
              </p>
            </div>

            <div>
              <p className="font-barlow text-[11px] text-[#111]/45 uppercase tracking-wider mb-2">
                Clarity
              </p>
              <div className="flex items-end gap-2">
                <span className="font-instrument text-[44px] leading-none">
                  {result?.clarity_score ?? "—"}
                </span>
                <span className="font-barlow text-[12px] text-[#111]/40 mb-2">/ 100</span>
              </div>
              <div className="h-1 bg-[#111]/8 rounded-full mt-3 overflow-hidden">
                <motion.div
                  animate={{ width: `${result?.clarity_score ?? 0}%` }}
                  transition={{ duration: 0.6, ease }}
                  className="h-full bg-[#111]/60 rounded-full"
                />
              </div>
            </div>

            <div>
              <p className="font-barlow text-[11px] text-[#111]/45 uppercase tracking-wider mb-3">
                Patterns
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result?.cognitive_patterns?.length ? (
                  result.cognitive_patterns.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="font-barlow text-[11px] text-[#111]/65 bg-white/70 border border-black/5 rounded-full px-2.5 py-1"
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="font-barlow text-[12px] text-[#111]/30 italic">
                    nothing yet
                  </span>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Journal;
