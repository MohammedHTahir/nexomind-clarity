import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AppShell from "@/components/app/AppShell";
import GlassCard from "@/components/app/GlassCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

type TrendRow = { date: string; clicks: number; impressions: number; ctr: number; position: number };
type QueryRow = { query: string; clicks: number; impressions: number; ctr: number; position: number };
type PageRow = { page: string; clicks: number; impressions: number; ctr: number; position: number };
type Data = {
  site: string;
  windowDays: number;
  startDate: string;
  endDate: string;
  totals: {
    clicks: number; impressions: number; avgPosition: number; avgCtr: number;
    rankingQueries: number; indexedPages: number; sitemaps: number;
  };
  trend: TrendRow[];
  queries: QueryRow[];
  pages: PageRow[];
};

const ranges = [7, 28, 90, 180] as const;
const fmt = (n: number) => n.toLocaleString();
const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

const Kpi = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <GlassCard className="p-5">
    <div className="text-[12px] uppercase tracking-wider text-[#111]/50 font-barlow">{label}</div>
    <div className="text-[28px] font-instrument mt-1 leading-none">{value}</div>
    {sub && <div className="text-[12px] text-[#111]/50 mt-1">{sub}</div>}
  </GlassCard>
);

const Chart = ({ data, dataKey, label, invert = false }: {
  data: TrendRow[]; dataKey: keyof TrendRow; label: string; invert?: boolean;
}) => (
  <GlassCard className="p-5">
    <div className="text-[13px] font-medium mb-3 font-barlow">{label}</div>
    <div className="h-[160px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#11111110" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#11111180" }}
            tickFormatter={(d) => d.slice(5)} minTickGap={24} />
          <YAxis tick={{ fontSize: 10, fill: "#11111180" }}
            domain={invert ? ["auto", "auto"] : [0, "auto"]}
            reversed={invert} width={40} />
          <Tooltip
            contentStyle={{ background: "white", border: "1px solid #00000010", borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => dataKey === "ctr" ? pct(v) : dataKey === "position" ? v.toFixed(1) : fmt(v)}
          />
          <Line type="monotone" dataKey={dataKey} stroke="#111" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </GlassCard>
);

const AdminSeo = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [days, setDays] = useState<number>(28);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data }) => setIsAdmin(Boolean(data)));
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true); setErr(null);
    supabase.functions
      .invoke(`gsc-dashboard?days=${days}`, { method: "GET" })
      .then(({ data, error }) => {
        if (error) throw error;
        setData(data as Data);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [isAdmin, days]);

  if (authLoading || isAdmin === null) {
    return <AppShell><div className="max-w-6xl mx-auto" /></AppShell>;
  }
  if (!isAdmin) return <Navigate to="/app" replace />;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-instrument text-[40px] leading-[1.05]">SEO dashboard</h1>
            <p className="text-[13px] text-[#111]/60 mt-1">
              Live Google Search Console data for nexomind.ai
              {data && ` · ${data.startDate} → ${data.endDate}`}
            </p>
          </div>
          <div className="flex gap-1 bg-white/60 backdrop-blur rounded-full p-1 border border-black/5">
            {ranges.map((r) => (
              <button key={r}
                onClick={() => setDays(r)}
                className={`text-[12px] px-3 py-1.5 rounded-full font-barlow transition ${
                  days === r ? "bg-[#111] text-white" : "text-[#111]/60 hover:text-[#111]"
                }`}>
                {r}d
              </button>
            ))}
          </div>
        </div>

        {err && <GlassCard className="p-4 text-[13px] text-red-700">{err}</GlassCard>}
        {loading && !data && <GlassCard className="p-8 text-center text-[13px] text-[#111]/50">Loading…</GlassCard>}

        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Kpi label="Clicks" value={fmt(data.totals.clicks)} sub={`${data.windowDays}d total`} />
              <Kpi label="Impressions" value={fmt(data.totals.impressions)} sub={`${data.windowDays}d total`} />
              <Kpi label="Avg position" value={data.totals.avgPosition ? data.totals.avgPosition.toFixed(1) : "—"} sub="lower is better" />
              <Kpi label="Avg CTR" value={pct(data.totals.avgCtr)} sub="clicks ÷ impressions" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Chart data={data.trend} dataKey="clicks" label="Clicks over time" />
              <Chart data={data.trend} dataKey="impressions" label="Impressions over time" />
              <Chart data={data.trend} dataKey="position" label="Avg position over time" invert />
              <Chart data={data.trend} dataKey="ctr" label="CTR over time" />
            </div>

            <GlassCard className="p-0 overflow-hidden">
              <div className="px-5 pt-5 pb-3 text-[13px] font-medium font-barlow">
                Top keywords ({data.queries.length})
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead className="text-[11px] uppercase tracking-wider text-[#111]/50">
                    <tr className="border-t border-black/5">
                      <th className="text-left px-5 py-2 font-medium">Query</th>
                      <th className="text-right px-3 py-2 font-medium">Clicks</th>
                      <th className="text-right px-3 py-2 font-medium">Impr.</th>
                      <th className="text-right px-3 py-2 font-medium">CTR</th>
                      <th className="text-right px-5 py-2 font-medium">Pos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.queries.map((q) => (
                      <tr key={q.query} className="border-t border-black/5 hover:bg-black/[0.02]">
                        <td className="px-5 py-2 max-w-[360px] truncate">{q.query}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{fmt(q.clicks)}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{fmt(q.impressions)}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{pct(q.ctr)}</td>
                        <td className="px-5 py-2 text-right tabular-nums">{q.position.toFixed(1)}</td>
                      </tr>
                    ))}
                    {!data.queries.length && (
                      <tr><td className="px-5 py-6 text-[#111]/50" colSpan={5}>No queries yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            <GlassCard className="p-0 overflow-hidden">
              <div className="px-5 pt-5 pb-3 text-[13px] font-medium font-barlow">
                Top pages ({data.pages.length})
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead className="text-[11px] uppercase tracking-wider text-[#111]/50">
                    <tr className="border-t border-black/5">
                      <th className="text-left px-5 py-2 font-medium">URL</th>
                      <th className="text-right px-3 py-2 font-medium">Clicks</th>
                      <th className="text-right px-3 py-2 font-medium">Impr.</th>
                      <th className="text-right px-3 py-2 font-medium">CTR</th>
                      <th className="text-right px-5 py-2 font-medium">Pos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pages.map((p) => {
                      const path = p.page.replace(/^https?:\/\/[^/]+/, "") || "/";
                      return (
                        <tr key={p.page} className="border-t border-black/5 hover:bg-black/[0.02]">
                          <td className="px-5 py-2 max-w-[360px] truncate">
                            <a href={p.page} target="_blank" rel="noreferrer" className="hover:underline">{path}</a>
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmt(p.clicks)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmt(p.impressions)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{pct(p.ctr)}</td>
                          <td className="px-5 py-2 text-right tabular-nums">{p.position.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                    {!data.pages.length && (
                      <tr><td className="px-5 py-6 text-[#111]/50" colSpan={5}>No pages yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="text-[13px] font-medium font-barlow mb-2">Backlinks</div>
              <p className="text-[12px] text-[#111]/60 leading-relaxed">
                Google Search Console doesn't expose backlink/referring-domain data through its API —
                only the in-app "Links" report does. To see referring domains and total backlinks here,
                connecting Semrush would unlock that view (Semrush has a generous free tier; an upgrade
                isn't required to start).
              </p>
            </GlassCard>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default AdminSeo;
