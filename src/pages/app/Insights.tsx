import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/app/AppShell";
import GlassCard from "@/components/app/GlassCard";
import PremiumGate from "@/components/PremiumGate";
import { fetchJournals, type JournalWithAnalysis } from "@/lib/journal";

const Insights = () => {
  const [entries, setEntries] = useState<JournalWithAnalysis[]>([]);

  useEffect(() => {
    fetchJournals().then(setEntries).catch((e) => console.error(e));
  }, []);

  const stats = useMemo(() => {
    const withA = entries.filter((e) => e.analysis);
    if (!withA.length) return null;

    const moodCount: Record<string, number> = {};
    withA.forEach((e) => {
      const m = e.analysis!.emotional_state ?? "Unknown";
      moodCount[m] = (moodCount[m] || 0) + 1;
    });
    const topMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0][0];

    const hourCount: Record<number, number> = {};
    withA.forEach((e) => {
      const h = new Date(e.created_at).getHours();
      hourCount[h] = (hourCount[h] || 0) + 1;
    });
    const peakHour = Number(
      Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0][0],
    );
    const peakLabel =
      peakHour < 5 ? "Late nights" :
      peakHour < 12 ? "Mornings" :
      peakHour < 18 ? "Afternoons" : "Evenings";

    const avgClarity = Math.round(
      withA.reduce((acc, e) => acc + (e.analysis!.clarity_score ?? 0), 0) / withA.length,
    );

    const tagCount: Record<string, number> = {};
    withA.forEach((e) => {
      (e.analysis!.cognitive_patterns ?? []).forEach((t) => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
    });
    const topTag = Object.entries(tagCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    return { topMood, peakLabel, avgClarity, topTag, count: entries.length };
  }, [entries]);

  const cards = stats
    ? [
        { label: "Most common emotion", value: stats.topMood },
        { label: "Peak reflection time", value: stats.peakLabel },
        { label: "Recurring pattern", value: stats.topTag },
        { label: "Average clarity", value: `${stats.avgClarity} / 100` },
        { label: "Total reflections", value: String(stats.count) },
      ]
    : [];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-3">
            ( Insights )
          </p>
          <h1 className="font-instrument text-[44px] md:text-[68px] leading-[1]">
            Your clarity <span className="italic">insights.</span>
          </h1>
          <p className="font-barlow text-[16px] text-[#111]/60 mt-3 max-w-xl">
            Quiet patterns that emerge when you give your thoughts a place to land.
          </p>
        </header>

        {!stats ? (
          <GlassCard className="p-12 text-center">
            <p className="font-instrument italic text-[26px] text-[#111]/55 mb-2">
              Nothing to show — yet.
            </p>
            <p className="font-barlow text-[14px] text-[#111]/45">
              Insights appear after a few reflections.
            </p>
          </GlassCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((c, i) => (
              <GlassCard
                key={c.label}
                delay={i * 0.05}
                whileHover={{
                  y: -3,
                  boxShadow: "0 12px 40px rgba(120,140,200,0.18)",
                }}
                className="p-7 transition-shadow duration-500"
              >
                <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-4">
                  ( {c.label} )
                </p>
                <p className="font-instrument text-[36px] leading-[1.1]">
                  <span className="italic">{c.value}</span>
                </p>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Insights;
