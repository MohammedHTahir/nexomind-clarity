import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

type Q = { q: string; options: { label: string; score: number }[] };

const QUESTIONS: Q[] = [
  {
    q: "When you wake up, your mind tends to feel:",
    options: [
      { label: "Already racing", score: 1 },
      { label: "Foggy but settling", score: 2 },
      { label: "Quiet for a few minutes", score: 3 },
      { label: "Spacious and clear", score: 4 },
    ],
  },
  {
    q: "How often do you replay past conversations?",
    options: [
      { label: "Constantly", score: 1 },
      { label: "Most days", score: 2 },
      { label: "Sometimes", score: 3 },
      { label: "Rarely", score: 4 },
    ],
  },
  {
    q: "Before sleep, your thoughts usually:",
    options: [
      { label: "Loop loudly", score: 1 },
      { label: "Drift between worries", score: 2 },
      { label: "Slow down", score: 3 },
      { label: "Land easily", score: 4 },
    ],
  },
  {
    q: "When something upsets you, you usually:",
    options: [
      { label: "Spiral and second-guess", score: 1 },
      { label: "Talk it over with someone", score: 2 },
      { label: "Write or reflect on it", score: 3 },
      { label: "Name the feeling and move", score: 4 },
    ],
  },
  {
    q: "How clear are your priorities right now?",
    options: [
      { label: "Tangled", score: 1 },
      { label: "Mostly competing", score: 2 },
      { label: "Clear-ish", score: 3 },
      { label: "Sharply clear", score: 4 },
    ],
  },
];

const insightFor = (pct: number) => {
  if (pct < 35)
    return {
      band: "Mental fog",
      text: "Your mind is carrying more than it can quietly file. Daily 3-minute reflection is the fastest way to lower the noise.",
    };
  if (pct < 60)
    return {
      band: "Mixed clarity",
      text: "You move in and out of clarity. The pattern usually breaks once you start naming the emotion underneath the loop.",
    };
  if (pct < 85)
    return {
      band: "Stable awareness",
      text: "You already process well. Reflection sharpens what's already there — fewer loops, faster decisions.",
    };
  return {
    band: "High clarity",
    text: "Your baseline is calm. Use reflection as preventive maintenance, not damage control.",
  };
};

const ClarityQuiz = () => {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const total = QUESTIONS.length;
  const done = step >= total;

  const choose = (s: number) => {
    setScores((prev) => [...prev, s]);
    setStep((s2) => s2 + 1);
  };

  const reset = () => {
    setStep(0);
    setScores([]);
  };

  const max = total * 4;
  const pct = done ? Math.round((scores.reduce((a, b) => a + b, 0) / max) * 100) : 0;
  const insight = done ? insightFor(pct) : null;
  const current = QUESTIONS[step];

  return (
    <section
      aria-label="Mental clarity quiz"
      className="my-16 rounded-[24px] bg-white border border-black/5 p-6 md:p-10"
    >
      <p className="font-barlow font-medium text-[11px] tracking-[0.22em] uppercase text-[#111]/50 mb-3">
        2-minute clarity quiz
      </p>
      <h2 className="font-instrument text-[28px] md:text-[36px] leading-tight text-[#111] mb-2">
        Where is your mind, today?
      </h2>
      <p className="font-barlow text-[15px] text-[#111]/60 mb-8">
        Five questions. Honest answers only. Get your clarity score and a calm next step.
      </p>

      {!done && (
        <div className="mb-6">
          <div className="flex items-center justify-between font-barlow text-[12px] text-[#111]/45 mb-2">
            <span>
              {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <span>{Math.round((step / total) * 100)}%</span>
          </div>
          <div className="h-[2px] bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#111] transition-[width] duration-500"
              style={{ width: `${(step / total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!done && current && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-instrument text-[24px] md:text-[28px] leading-snug text-[#111] mb-6">
              {current.q}
            </p>
            <div className="grid gap-3">
              {current.options.map((o) => (
                <button
                  key={o.label}
                  onClick={() => choose(o.score)}
                  className="text-left rounded-2xl border border-black/10 bg-[#FAFAF7] hover:bg-[#F3F4ED] hover:border-[#111]/30 px-5 py-4 font-barlow text-[16px] text-[#111] transition"
                >
                  {o.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {done && insight && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-2xl bg-[#F3F4ED] border border-black/5 p-6 md:p-8">
              <p className="font-barlow font-medium text-[10px] tracking-[0.22em] uppercase text-[#111]/45 mb-3">
                Your clarity score
              </p>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-instrument text-[64px] md:text-[80px] leading-none text-[#111]">
                  {pct}
                </span>
                <span className="font-barlow text-[14px] text-[#111]/50">/ 100</span>
              </div>
              <p className="font-instrument italic text-[20px] md:text-[24px] text-[#111] mb-3">
                {insight.band}
              </p>
              <p className="font-barlow text-[16px] leading-relaxed text-[#111]/75">
                {insight.text}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-4 flex-wrap">
              <Link
                to="/auth"
                className="inline-block bg-[#111] text-white rounded-full px-7 py-3 font-barlow font-medium text-[14px] hover:bg-black transition"
              >
                Start your first reflection
              </Link>
              <button
                onClick={reset}
                className="font-barlow text-[14px] text-[#111]/60 hover:text-[#111] underline underline-offset-4"
              >
                Retake quiz
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ClarityQuiz;
