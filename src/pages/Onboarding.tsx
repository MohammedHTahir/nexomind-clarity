import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import Seo from "@/components/Seo";

const ease = [0.16, 1, 0.3, 1] as const;

const moods = ["Overwhelmed", "Anxious", "Distracted", "Calm but unfocused", "Stressed", "Reflective"];
const intents = [
  "Reduce overthinking",
  "Improve focus",
  "Understand emotions",
  "Manage stress",
  "Self-awareness",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  const togglePicked = (v: string) =>
    setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  const next = () => setStep((s) => s + 1);
  const finish = () => {
    try {
      localStorage.setItem(
        "nexomind:onboarding",
        JSON.stringify({ name, mood, intents: picked, completedAt: Date.now() })
      );
    } catch {}
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-[#F3F4ED] text-[#111] relative overflow-hidden flex items-center justify-center px-6">
      <Seo
        title="Welcome to NexoMind — set up your reflection"
        description="A short onboarding to personalize your NexoMind journaling experience — mood, intentions, and how you'd like to reflect."
        noindex
      />
      {/* Soft ambient color */}
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

      {/* Progress dots */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === step ? "w-8 bg-[#111]" : i < step ? "w-4 bg-[#111]/60" : "w-4 bg-[#111]/15"
            }`}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0, scale: 0.98, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.9, ease }}
              className="text-center"
            >
              <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-6">
                ( Welcome )
              </p>
              <h1 className="font-instrument text-[52px] md:text-[80px] leading-[1] mb-6">
                Welcome to <br />
                <span className="italic">NexoMind.</span>
              </h1>
              <p className="font-barlow text-[17px] text-[#111]/65 max-w-md mx-auto mb-12">
                A private space for clarity, reflection, and understanding your thoughts.
              </p>

              <div className="max-w-xs mx-auto mb-8">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name (optional)"
                  className="w-full bg-white/70 backdrop-blur-md border border-black/5 rounded-full px-5 py-3 font-barlow text-[14px] text-center outline-none focus:border-black/20 transition-colors placeholder:text-[#111]/35"
                />
              </div>

              <button
                onClick={next}
                className="bg-[#111] text-white rounded-full px-10 py-4 font-barlow font-medium text-[15px] hover:bg-black hover:scale-[1.02] transition-all duration-300"
              >
                Begin
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8, ease }}
              className="text-center"
            >
              <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-6">
                ( Step 02 )
              </p>
              <h2 className="font-instrument text-[40px] md:text-[58px] leading-[1.05] mb-12">
                How are you <span className="italic">feeling</span> today?
              </h2>

              <div className="flex flex-wrap justify-center gap-3 max-w-xl mx-auto mb-12">
                {moods.map((m) => {
                  const active = mood === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`bg-white/70 backdrop-blur-md border rounded-full px-5 py-2.5 font-barlow text-[14px] transition-all duration-300 hover:scale-[1.03] ${
                        active
                          ? "border-[#111] bg-[#111] text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                          : "border-black/5 text-[#111]/75 hover:border-black/15"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={next}
                disabled={!mood}
                className="bg-[#111] text-white rounded-full px-10 py-4 font-barlow font-medium text-[15px] hover:bg-black hover:scale-[1.02] transition-all duration-300 disabled:opacity-30 disabled:hover:scale-100"
              >
                Continue
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8, ease }}
              className="text-center"
            >
              <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-6">
                ( Step 03 )
              </p>
              <h2 className="font-instrument text-[40px] md:text-[58px] leading-[1.05] mb-4">
                What do you want <br />
                <span className="italic">help with?</span>
              </h2>
              <p className="font-barlow text-[14px] text-[#111]/55 mb-10">
                Select as many as you like.
              </p>

              <div className="flex flex-wrap justify-center gap-3 max-w-xl mx-auto mb-12">
                {intents.map((it) => {
                  const active = picked.includes(it);
                  return (
                    <button
                      key={it}
                      onClick={() => togglePicked(it)}
                      className={`flex items-center gap-2 bg-white/70 backdrop-blur-md border rounded-full px-5 py-2.5 font-barlow text-[14px] transition-all duration-300 hover:scale-[1.03] ${
                        active
                          ? "border-[#111] bg-[#111] text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                          : "border-black/5 text-[#111]/75 hover:border-black/15"
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                      {it}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={next}
                disabled={picked.length === 0}
                className="bg-[#111] text-white rounded-full px-10 py-4 font-barlow font-medium text-[15px] hover:bg-black hover:scale-[1.02] transition-all duration-300 disabled:opacity-30 disabled:hover:scale-100"
              >
                Continue
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, scale: 0.98, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.9, ease }}
              className="text-center"
            >
              <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-6">
                ( You're ready )
              </p>
              <h2 className="font-instrument text-[44px] md:text-[68px] leading-[1] mb-6">
                NexoMind will adapt <br />
                to your <span className="italic">thoughts.</span>
              </h2>
              <p className="font-barlow text-[16px] text-[#111]/65 max-w-md mx-auto mb-12">
                Private. Secure. Judgment-free. Your space is ready.
              </p>
              <button
                onClick={finish}
                className="bg-[#111] text-white rounded-full px-10 py-4 font-barlow font-medium text-[15px] hover:bg-black hover:scale-[1.02] transition-all duration-300"
              >
                Enter your space
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
