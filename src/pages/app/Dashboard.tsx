import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, ArrowRight, ChevronDown } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import GlassCard from "@/components/app/GlassCard";
import PatternsCard from "@/components/app/PatternsCard";
import ChallengerNotice from "@/components/app/ChallengerNotice";
import ModeConflictNotice from "@/components/app/ModeConflictNotice";
import VoiceEntryButton from "@/components/app/VoiceEntryButton";
import { useFeatureFlag } from "@/lib/feature-flags";
import { isVoiceSupported } from "@/lib/voice";
import {
  analyzeAndStore,
  analyzeAndStoreE2EE,
  fetchJournals,
  clarityBand,
  FreeLimitReachedError,
  type AnalysisRow,
  type JournalWithAnalysis,
} from "@/lib/journal";
import PaywallModal from "@/components/PaywallModal";
import PremiumGate from "@/components/PremiumGate";
import E2EEStatusBadge from "@/components/app/E2EEStatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useE2EE } from "@/hooks/useE2EE";
import { getOnDeviceLLM } from "@/lib/on-device-llm";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { t } from "@/lib/i18n";

const ease = [0.16, 1, 0.3, 1] as const;

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const Dashboard = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { isE2EE, encryptEntry, isLLMAvailable } = useE2EE();
  const voiceFlagEnabled = useFeatureFlag("voice_entry");
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisRow | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [entries, setEntries] = useState<JournalWithAnalysis[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  // Close any open paywall the moment the subscription becomes active.
  useEffect(() => {
    if (isPremium) setPaywallOpen(false);
  }, [isPremium]);

  useEffect(() => {
    try {
      const o = JSON.parse(localStorage.getItem("nexomind:onboarding") || "{}");
      if (o.name) setName(o.name);
    } catch {}
    if (!name && user?.email) setName(user.email.split("@")[0]);
    fetchJournals().then(setEntries).catch((e) => console.error(e));
  }, [user]);

  const submit = async () => {
    if (!text.trim() || analyzing) return;
    setAnalyzing(true);
    setResult(null);
    try {
      let analysis: AnalysisRow;
      if (isE2EE) {
        const llm = await getOnDeviceLLM();
        const result = await analyzeAndStoreE2EE(text, encryptEntry, llm);
        analysis = result.analysis;
        if (llm) llm.destroy();
      } else {
        const result = await analyzeAndStore(text);
        analysis = result.analysis;
        if (!isPremium) {
          window.setTimeout(() => setPaywallOpen(true), 650);
        }
      }
      setResult(analysis);
      trackEvent("journal_entry_created", {
        source: "dashboard",
        word_count: text.trim().split(/\s+/).filter(Boolean).length,
        e2ee: isE2EE,
      });
      setText("");
      const fresh = await fetchJournals();
      setEntries(fresh);
    } catch (e) {
      if (e instanceof FreeLimitReachedError) {
        toast.error(`You've used all ${e.limit} free reflections this week.`);
        setPaywallOpen(true);
      } else {
        const msg = e instanceof Error ? e.message : "Analysis failed";
        toast.error(msg);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const weekly = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      const next = d.getTime() + 86400000;
      const dayEntries = entries.filter((e) => {
        const t = new Date(e.created_at).getTime();
        return t >= d.getTime() && t < next && e.analysis?.clarity_score != null;
      });
      const avg = dayEntries.length
        ? dayEntries.reduce((acc, e) => acc + (e.analysis!.clarity_score ?? 0), 0) /
          dayEntries.length
        : null;
      return { label: d.toLocaleDateString(undefined, { weekday: "short" })[0], value: avg };
    });
    return days;
  }, [entries]);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="mb-12 text-center md:text-left"
        >
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-3">
            ( {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} )
          </p>
          <h1 className="font-instrument text-[44px] md:text-[68px] leading-[1]">
            {greeting()}{name ? `, ${name}` : ""}.
          </h1>
          <p className="font-barlow text-[16px] md:text-[18px] text-[#111]/60 mt-3">
            Let's bring clarity to your thoughts.
          </p>
        </motion.header>

        <GlassCard className="p-6 md:p-8 mb-6">
          {isE2EE && (
            <div className="mb-4 flex items-center gap-2">
              <E2EEStatusBadge />
              {!isLLMAvailable && (
                <span className="font-barlow text-[11px] text-amber-700">
                  {t("e2ee.llmUnavailableNotice")}
                </span>
              )}
            </div>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind today?"
            rows={4}
            className="w-full resize-none bg-transparent outline-none font-instrument text-[22px] md:text-[28px] leading-[1.4] placeholder:text-[#111]/30 text-[#111]"
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = el.scrollHeight + "px";
            }}
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5">
            {voiceFlagEnabled && isVoiceSupported() ? (
              <VoiceEntryButton
                demoMode={!isPremium}
                onComplete={(analysis) => {
                  setResult(analysis);
                  fetchJournals().then(setEntries).catch(console.error);
                }}
              />
            ) : (
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-white/60 border border-black/5 flex items-center justify-center text-[#111]/60 hover:text-[#111] hover:scale-[1.05] transition-all"
                aria-label="Voice"
              >
                <Mic className="w-4 h-4" strokeWidth={1.75} />
              </button>
            )}
            <button
              onClick={submit}
              disabled={!text.trim() || analyzing}
              className="group flex items-center gap-2 bg-[#111] text-white rounded-full pl-5 pr-1.5 py-1.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors disabled:opacity-30"
            >
              <span>{analyzing ? "Reflecting…" : "Analyze thoughts"}</span>
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#111] group-hover:rotate-45 transition-transform duration-300">
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.25} />
              </span>
            </button>
          </div>
        </GlassCard>

        <AnimatePresence>
          {analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease }}
              className="text-center mb-6"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block w-2 h-2 rounded-full bg-[#111]/60"
              />
              <p className="font-barlow text-[13px] text-[#111]/55 mt-3">
                Listening to your thoughts…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && !analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease }}
              className="mb-12"
            >
              <div
                className="rounded-[22px] p-[1px]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(180,200,235,0.6), rgba(220,200,235,0.6), rgba(0,0,0,0.05))",
                }}
              >
                <div className="bg-white/80 backdrop-blur-md rounded-[21px] p-7 md:p-9">
                  <ChallengerNotice
                    analysisId={result.id}
                    reflectionMode={(result as Record<string, unknown>).reflection_mode as string | undefined}
                  />
                  <ModeConflictNotice
                    reflectionMode={(result as Record<string, unknown>).reflection_mode as string | undefined}
                  />
                  <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-3">
                    ( {result.emotional_state} )
                  </p>
                  <p className="font-barlow text-[15px] text-[#111]/65 leading-relaxed mb-6">
                    {result.summary}
                  </p>

                  <PremiumGate
                    title="Full clarity insight"
                    subtitle="Unlock deep patterns and reflections"
                  >
                    <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-3">
                      ( {clarityBand(result.clarity_score)} )
                    </p>
                    <h3 className="font-instrument text-[28px] md:text-[34px] leading-[1.15] mb-4">
                      {result.clarity_insight}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {(result.cognitive_patterns ?? []).map((t) => (
                        <span
                          key={t}
                          className="font-barlow text-[12px] text-[#111]/70 bg-white/80 border border-black/5 rounded-full px-3 py-1"
                        >
                          {t}
                        </span>
                      ))}
                      {(result.distortions_or_biases ?? []).map((t) => (
                        <span
                          key={`d-${t}`}
                          className="font-barlow text-[12px] text-[#111]/70 bg-white/60 border border-black/10 rounded-full px-3 py-1"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="border-t border-black/5 pt-5">
                      <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
                        ( Try this )
                      </p>
                      <p className="font-instrument italic text-[20px] leading-snug text-[#111]/85">
                        {result.suggested_reflection}
                      </p>
                    </div>
                  </PremiumGate>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <PaywallModal
          open={paywallOpen}
          onUnlock={() => setPaywallOpen(false)}
          onContinue={() => setPaywallOpen(false)}
        />

        <div className="grid md:grid-cols-2 gap-5">
          <GlassCard className="p-7" delay={0.05}>
            <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
              ( This week )
            </p>
            <h3 className="font-instrument text-[26px] mb-6">
              Your emotional <span className="italic">pattern</span>
            </h3>

            <div className="relative h-32 flex items-end gap-3">
              {weekly.map((d, i) => {
                const v = d.value ?? 0;
                const has = d.value !== null;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: has ? `${(v / 100) * 100}%` : "6%" }}
                      transition={{ duration: 0.8, delay: 0.1 + i * 0.05, ease }}
                      className={`w-full rounded-t-md ${
                        has ? "bg-gradient-to-t from-[#111]/70 to-[#111]/30" : "bg-[#111]/8"
                      }`}
                      style={{ minHeight: 4 }}
                    />
                    <span className="font-barlow text-[10px] text-[#111]/40">{d.label}</span>
                  </div>
                );
              })}
            </div>
            <p className="font-barlow text-[12px] text-[#111]/45 mt-5">
              {entries.length === 0
                ? "Write your first reflection to see your pattern emerge."
                : "Soft fluctuations are normal. Notice — don't judge."}
            </p>
          </GlassCard>

          <GlassCard className="p-7" delay={0.1}>
            <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
              ( Continue )
            </p>
            <h3 className="font-instrument text-[26px] mb-6">
              Go <span className="italic">deeper.</span>
            </h3>
            <div className="space-y-3">
              <Link
                to="/app/journal"
                className="flex items-center justify-between bg-white/60 border border-black/5 rounded-2xl px-5 py-4 hover:bg-white/90 transition-colors group"
              >
                <div>
                  <p className="font-barlow font-medium text-[14px]">Open journaling mode</p>
                  <p className="font-barlow text-[12px] text-[#111]/50">Distraction-free writing</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#111]/40 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/app/insights"
                className="flex items-center justify-between bg-white/60 border border-black/5 rounded-2xl px-5 py-4 hover:bg-white/90 transition-colors group"
              >
                <div>
                  <p className="font-barlow font-medium text-[14px]">View clarity insights</p>
                  <p className="font-barlow text-[12px] text-[#111]/50">Patterns across all entries</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#111]/40 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </GlassCard>
        </div>

        <PatternsCard />


        <div className="mt-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
                ( History )
              </p>
              <h3 className="font-instrument text-[32px]">
                Past <span className="italic">reflections</span>
              </h3>
            </div>
            <span className="font-barlow text-[12px] text-[#111]/40">{entries.length} entries</span>
          </div>

          {entries.length === 0 ? (
            <GlassCard className="p-10 text-center">
              <p className="font-instrument italic text-[22px] text-[#111]/55">
                A quiet page. It's waiting for you.
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {entries.map((e, i) => {
                const open = openId === e.id;
                const a = e.analysis;
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.3), ease }}
                    className="bg-white/60 backdrop-blur-md border border-black/5 rounded-2xl overflow-hidden hover:bg-white/85 transition-colors"
                  >
                    <button
                      onClick={() => setOpenId(open ? null : e.id)}
                      className="w-full text-left px-5 py-4 flex items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-barlow text-[14px] text-[#111] truncate">{e.content}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="font-barlow text-[11px] text-[#111]/45">
                            {new Date(e.created_at).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                          {a?.emotional_state && (
                            <span className="font-barlow text-[11px] text-[#111]/50 bg-[#111]/5 rounded-full px-2 py-0.5">
                              {a.emotional_state}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-[#111]/40 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {open && a && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 border-t border-black/5">
                            <p className="font-instrument italic text-[18px] text-[#111]/85 mb-3">
                              {a.clarity_insight}
                            </p>
                            <p className="font-barlow text-[13px] text-[#111]/60 leading-relaxed mb-3">
                              {a.suggested_reflection}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {(a.cognitive_patterns ?? []).map((t) => (
                                <span
                                  key={t}
                                  className="font-barlow text-[11px] text-[#111]/55 bg-white border border-black/5 rounded-full px-2 py-0.5"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
