import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import AppShell from "@/components/app/AppShell";
import GlassCard from "@/components/app/GlassCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Metrics = {
  windowDays: number;
  totals: {
    signups: number;
    subscribers: number;
    entryAuthors: number;
    entriesTotal: number;
  };
  cohort: { signups: number; subscribed: number; journaled: number };
};

const ranges = [7, 30, 90] as const;

const pct = (num: number, den: number) =>
  den === 0 ? "—" : `${((num / den) * 100).toFixed(1)}%`;

const AdminAnalytics = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data }) => setIsAdmin(Boolean(data)));
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    setErr(null);
    supabase.functions
      .invoke(`admin-funnel-metrics?days=${days}`, { method: "GET" })
      .then(({ data, error }) => {
        if (error) throw error;
        setData(data as Metrics);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [isAdmin, days]);

  if (authLoading || isAdmin === null) {
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto" />
      </AppShell>
    );
  }
  if (!isAdmin) return <Navigate to="/app" replace />;

  const c = data?.cohort;
  const t = data?.totals;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-3">
            ( Admin · Analytics )
          </p>
          <h1 className="font-instrument text-[44px] md:text-[56px] leading-[1.05] mb-6">
            Conversion <span className="italic">funnel</span>
          </h1>

          <div className="flex gap-2 mb-8">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setDays(r)}
                className={`rounded-full px-4 py-1.5 font-barlow text-[13px] border transition-colors ${
                  days === r
                    ? "bg-[#111] text-white border-[#111]"
                    : "bg-white/70 text-[#111] border-black/10 hover:border-black/30"
                }`}
              >
                Last {r}d
              </button>
            ))}
          </div>

          {err && (
            <GlassCard className="p-5 mb-6">
              <p className="font-barlow text-[14px] text-red-700">{err}</p>
            </GlassCard>
          )}

          {loading && !data && (
            <GlassCard className="p-6">
              <p className="font-barlow text-[14px] text-[#111]/60">Loading…</p>
            </GlassCard>
          )}

          {c && t && (
            <>
              <GlassCard className="p-6 md:p-8 mb-6">
                <h2 className="font-instrument text-[24px] mb-1">
                  Cohort funnel <span className="italic text-[#111]/60">(users who signed up in window)</span>
                </h2>
                <p className="font-barlow text-[13px] text-[#111]/55 mb-6">
                  Tracks each cohort user across all three steps regardless of timing.
                </p>

                <div className="space-y-4">
                  <FunnelRow
                    label="Signup completed"
                    count={c.signups}
                    base={c.signups}
                    barColor="#111"
                  />
                  <FunnelRow
                    label="Subscription started"
                    count={c.subscribed}
                    base={c.signups}
                    sub={`${pct(c.subscribed, c.signups)} of signups`}
                    barColor="#3D5AFE"
                  />
                  <FunnelRow
                    label="Journal entry created"
                    count={c.journaled}
                    base={c.signups}
                    sub={`${pct(c.journaled, c.signups)} of signups · ${pct(c.journaled, c.subscribed)} of subscribers`}
                    barColor="#7C5CFF"
                  />
                </div>
              </GlassCard>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Signups" value={t.signups} />
                <Stat label="New subscribers" value={t.subscribers} />
                <Stat label="Active journalers" value={t.entryAuthors} />
                <Stat label="Total entries" value={t.entriesTotal} />
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
};

const FunnelRow = ({
  label,
  count,
  base,
  sub,
  barColor,
}: {
  label: string;
  count: number;
  base: number;
  sub?: string;
  barColor: string;
}) => {
  const width = base === 0 ? 0 : Math.max(4, (count / base) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="font-barlow text-[14px] font-medium">{label}</span>
        <span className="font-instrument text-[22px]">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-black/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
        />
      </div>
      {sub && (
        <p className="font-barlow text-[12px] text-[#111]/55 mt-1.5">{sub}</p>
      )}
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <GlassCard className="p-5">
    <p className="font-barlow text-[12px] uppercase tracking-[0.15em] text-[#111]/50 mb-2">
      {label}
    </p>
    <p className="font-instrument text-[32px] leading-none">{value}</p>
  </GlassCard>
);

export default AdminAnalytics;
