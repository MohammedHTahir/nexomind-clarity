import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/app/GlassCard";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fullDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const formatHour = (h: number) => {
  const period = h >= 12 ? "pm" : "am";
  const hr = ((h + 11) % 12) + 1;
  return `${hr}${period}`;
};

type Pattern = {
  id: string;
  day_of_week: number;
  hour_of_day: number;
  theme_label: string | null;
  sample_size: number;
  confidence: number;
};

const PatternsCard = ({ delay = 0.15 }: { delay?: number }) => {
  const [patterns, setPatterns] = useState<Pattern[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("user_patterns")
      .select("id, day_of_week, hour_of_day, theme_label, sample_size, confidence")
      .order("confidence", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setPatterns((data as Pattern[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <GlassCard className="p-7 mt-5" delay={delay}>
      <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
        ( Patterns we noticed )
      </p>
      <h3 className="font-instrument text-[26px] mb-5">
        When your mind <span className="italic">loops</span>.
      </h3>

      {loading ? (
        <p className="font-barlow text-[13px] text-[#111]/40">Quietly watching…</p>
      ) : !patterns || patterns.length === 0 ? (
        <p className="font-barlow text-[14px] text-[#111]/55 leading-relaxed">
          Keep writing. After about two weeks, NexoMind will surface the times and themes
          your loops tend to open — and gently nudge you before they grip.
        </p>
      ) : (
        <div className="space-y-3">
          {patterns.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.05 * i }}
              className="bg-white/60 border border-black/5 rounded-2xl px-5 py-4"
            >
              <p className="font-instrument text-[18px] text-[#111] leading-snug">
                You tend to overthink{" "}
                <span className="italic">{fullDays[p.day_of_week]}s</span> around{" "}
                <span className="italic">{formatHour(p.hour_of_day)}</span>
                {p.theme_label ? (
                  <>
                    , usually about <span className="italic">{p.theme_label}</span>
                  </>
                ) : null}
                .
              </p>
              <p className="font-barlow text-[11px] text-[#111]/45 mt-1.5">
                {p.sample_size} entries · {dayNames[p.day_of_week]} {formatHour(p.hour_of_day)}
              </p>
            </motion.div>
          ))}
          <p className="font-barlow text-[11px] text-[#111]/45 mt-1">
            A calm email arrives before these windows — when it would actually help.
          </p>
        </div>
      )}
    </GlassCard>
  );
};

export default PatternsCard;
