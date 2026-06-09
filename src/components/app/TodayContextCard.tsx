/**
 * TodayContextCard — Dashboard widget surfacing the live signals pulled from
 * connected wearable/calendar integrations (sleep, HRV, meeting load).
 * Renders nothing for users with no connected providers.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, HeartPulse, CalendarClock, Link2 } from "lucide-react";
import GlassCard from "@/components/app/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useFeatureFlag } from "@/lib/feature-flags";

interface Signals {
  sleep_minutes: number | null;
  hrv_avg: number | null;
  meeting_count_24h: number | null;
  meeting_minutes_24h: number | null;
  providers: string[];
  fetched_at: string;
}

const formatSleep = (m: number | null) => {
  if (m == null) return "—";
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}h ${min}m`;
};

const formatMeetings = (count: number | null, minutes: number | null) => {
  if (count == null) return "—";
  if (count === 0) return "Clear day";
  const h = minutes != null ? `${Math.round((minutes / 60) * 10) / 10}h` : "";
  return `${count} · ${h}`;
};

interface Props {
  delay?: number;
}

const TodayContextCard = ({ delay = 0 }: Props) => {
  const { isPremium } = useSubscription();
  const flag = useFeatureFlag("wearable_integrations");
  const [signals, setSignals] = useState<Signals | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasIntegrations, setHasIntegrations] = useState(false);

  useEffect(() => {
    if (!flag || !isPremium) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data: rows } = await supabase
          .from("user_integrations")
          .select("provider")
          .limit(1);
        if (cancelled) return;
        if (!rows || rows.length === 0) {
          setHasIntegrations(false);
          setLoading(false);
          return;
        }
        setHasIntegrations(true);
        const { data, error } = await supabase.functions.invoke<Signals>(
          "get-my-context-signals",
          { body: {} },
        );
        if (!cancelled && !error && data) setSignals(data);
      } catch {
        // silent fail — widget is non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [flag, isPremium]);

  if (!flag || !isPremium) return null;
  if (loading) return null;

  // No integrations connected yet — gentle CTA
  if (!hasIntegrations) {
    return (
      <GlassCard className="p-7 mb-6" delay={delay}>
        <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
          ( Today's context )
        </p>
        <h3 className="font-instrument text-[22px] mb-3">
          Connect a <span className="italic">signal source</span>
        </h3>
        <p className="font-barlow text-[13px] text-[#111]/60 leading-relaxed mb-4">
          Link Oura, Google Fit, or Google Calendar to give your reflections
          context — sleep, HRV, and meeting load shape how your day really felt.
        </p>
        <Link
          to="/app/settings"
          className="inline-flex items-center gap-2 bg-[#111] text-white rounded-full px-4 py-2 font-barlow font-medium text-[12px] hover:bg-black transition-colors"
        >
          <Link2 className="w-3.5 h-3.5" />
          Connect integrations
        </Link>
      </GlassCard>
    );
  }

  const sleep = signals?.sleep_minutes ?? null;
  const hrv = signals?.hrv_avg ?? null;
  const meetingCount = signals?.meeting_count_24h ?? null;
  const meetingMinutes = signals?.meeting_minutes_24h ?? null;

  const items = [
    {
      icon: Moon,
      label: "Sleep",
      value: formatSleep(sleep),
      sub: sleep != null && sleep < 360 ? "Short night" : sleep != null ? "Last 24h" : "No data",
    },
    {
      icon: HeartPulse,
      label: "HRV",
      value: hrv != null ? `${hrv}` : "—",
      sub: hrv != null ? "Balance score" : "No data",
    },
    {
      icon: CalendarClock,
      label: "Meetings",
      value: formatMeetings(meetingCount, meetingMinutes),
      sub: meetingCount != null ? "Last 24h" : "No data",
    },
  ];

  return (
    <GlassCard className="p-7 mb-6" delay={delay}>
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
            ( Today's context )
          </p>
          <h3 className="font-instrument text-[24px]">
            How your <span className="italic">body & calendar</span> feel
          </h3>
        </div>
        <Link
          to="/app/settings"
          className="font-barlow text-[11px] text-[#111]/45 hover:text-[#111]/70 transition-colors"
        >
          Manage
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {items.map((it) => (
          <div
            key={it.label}
            className="bg-white/60 border border-black/5 rounded-2xl px-4 py-4 flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-2 text-[#111]/55">
              <it.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span className="font-barlow text-[11px] tracking-wider uppercase">{it.label}</span>
            </div>
            <span className="font-instrument text-[24px] leading-none text-[#111]">{it.value}</span>
            <span className="font-barlow text-[11px] text-[#111]/40">{it.sub}</span>
          </div>
        ))}
      </div>

      <p className="font-barlow text-[11px] text-[#111]/40 mt-4">
        These signals quietly shape your AI reflections — not stored, refreshed each visit.
      </p>
    </GlassCard>
  );
};

export default TodayContextCard;
