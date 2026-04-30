import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const ease = [0.16, 1, 0.3, 1] as const;
const SAMPLE = "I feel stuck. My mind keeps racing at night and I can't switch it off.";

type Phase = "typing" | "processing" | "result";

const AiDemo = () => {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  // Start when section is in view
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setStarted(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // Run the demo loop
  useEffect(() => {
    if (!started) return;
    let timers: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      setTyped("");
      setPhase("typing");

      let i = 0;
      const type = () => {
        if (i <= SAMPLE.length) {
          setTyped(SAMPLE.slice(0, i));
          i++;
          const delay = 40 + Math.random() * 20;
          timers.push(setTimeout(type, delay));
        } else {
          timers.push(
            setTimeout(() => {
              setPhase("processing");
              timers.push(
                setTimeout(() => {
                  setPhase("result");
                  // Loop again after a long pause
                  timers.push(setTimeout(run, 9000));
                }, 1800)
              );
            }, 1000)
          );
        }
      };
      type();
    };

    run();
    return () => timers.forEach(clearTimeout);
  }, [started]);

  return (
    <section ref={ref} className="px-6 py-32 bg-[#F3F4ED]">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="max-w-2xl mb-16">
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-6">
            ( See it in motion )
          </p>
          <h2 className="font-instrument text-[44px] md:text-[64px] leading-[1] tracking-tight text-[#111]">
            From a messy thought to <span className="italic">quiet clarity.</span>
          </h2>
          <p className="font-barlow text-[17px] md:text-[19px] leading-relaxed text-[#111]/70 mt-6">
            Watch what happens when a real, half-formed thought meets NexoMind. No edits. No prompts. Just reflection, in seconds.
          </p>
        </div>

        {/* Demo grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* LEFT — user input */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease }}
            className="relative"
          >
            <div
              className={`relative rounded-2xl bg-white/70 backdrop-blur-sm border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 md:p-10 min-h-[280px] transition-all duration-500 hover:-translate-y-0.5 ${
                phase === "processing" ? "blur-[1px]" : ""
              }`}
            >
              <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/40 mb-6">
                Your thought
              </p>

              {phase !== "processing" ? (
                <p className="font-instrument text-[24px] md:text-[28px] leading-snug text-[#111]">
                  {typed}
                  <span
                    className="inline-block w-[2px] h-[1em] align-middle ml-1 bg-[#111] animate-pulse"
                    style={{ animationDuration: "1s" }}
                  />
                </p>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="font-instrument italic text-[24px] md:text-[28px] text-[#111]/70">
                    Analyzing
                  </p>
                  <div className="flex gap-1.5 mt-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="block w-2 h-2 rounded-full bg-[#111]/50"
                        style={{
                          animation: `pulse 1.2s ${i * 0.18}s ease-in-out infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* soft glow when processing */}
              {phase === "processing" && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-purple-200/20 via-transparent to-blue-200/20 animate-pulse" />
              )}
            </div>
          </motion.div>

          {/* RIGHT — AI output */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.15, ease }}
            className="relative"
          >
            <div className="relative rounded-2xl bg-[#111] text-white border border-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-8 md:p-10 min-h-[280px] transition-all duration-500 hover:-translate-y-0.5">
              <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-white/40 mb-6">
                NexoMind reflection
              </p>

              <AnimatePresence mode="wait">
                {phase !== "result" ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease }}
                    className="font-instrument italic text-[22px] md:text-[26px] text-white/30 leading-snug"
                  >
                    Waiting for your thought…
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0 }}
                    variants={{
                      hidden: {},
                      show: { transition: { staggerChildren: 0.2 } },
                    }}
                    className="space-y-6"
                  >
                    {/* Summary */}
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
                      }}
                    >
                      <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-white/40 mb-2">
                        Summary
                      </p>
                      <p className="font-instrument text-[22px] md:text-[26px] leading-snug text-white">
                        Your thoughts show a pattern of repetitive mental loops, especially at night.
                      </p>
                    </motion.div>

                    {/* Emotion */}
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
                      }}
                    >
                      <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-white/40 mb-2">
                        Emotional state
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["Overwhelm", "Mental fatigue"].map((tag) => (
                          <span
                            key={tag}
                            className="font-barlow text-[14px] px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/85"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>

                    {/* Insight */}
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
                      }}
                    >
                      <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-white/40 mb-2">
                        Insight
                      </p>
                      <p className="font-instrument italic text-[22px] md:text-[26px] leading-snug text-white">
                        You're not stuck — your mind is overloaded without a way to process it.
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease }}
          className="mt-16 text-center"
        >
          <p className="font-instrument text-[28px] md:text-[36px] text-[#111] mb-6">
            Try it yourself.
          </p>
          <Link
            to="/auth"
            className="inline-block bg-[#111] text-white rounded-full px-8 py-4 font-barlow font-medium text-[15px] hover:bg-black hover:scale-[1.02] transition-all duration-300"
          >
            Start your first reflection
          </Link>
          <p className="font-barlow text-sm text-[#111]/50 mt-3">
            Free to try — takes less than 30 seconds.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AiDemo;
