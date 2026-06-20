import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE = "sc-domain:nexomind.ai";
const GW = "https://connector-gateway.lovable.dev/google_search_console";

const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

async function gsc(path: string, init: RequestInit = {}) {
  const r = await fetch(`${GW}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      "X-Connection-Api-Key": Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY")!,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`GSC ${path} ${r.status}: ${txt.slice(0, 200)}`);
  return txt ? JSON.parse(txt) : {};
}

async function query(body: Record<string, unknown>) {
  const site = encodeURIComponent(SITE);
  return gsc(`/webmasters/v3/sites/${site}/searchAnalytics/query`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id, _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const days = Math.max(7, Math.min(365, Number(url.searchParams.get("days") ?? 28)));
    // GSC has ~3 day lag; use end = today - 2
    const end = new Date(Date.now() - 2 * 86400_000);
    const start = new Date(end.getTime() - (days - 1) * 86400_000);
    const startDate = fmtDate(start);
    const endDate = fmtDate(end);

    const base = { startDate, endDate, dataState: "all" as const };

    const [byDate, byQuery, byPage, links] = await Promise.all([
      query({ ...base, dimensions: ["date"], rowLimit: 400 }),
      query({ ...base, dimensions: ["query"], rowLimit: 50 }),
      query({ ...base, dimensions: ["page"], rowLimit: 25 }),
      // Top linking sites — best-effort; older sitemaps endpoint differs per-property,
      // so we surface what we can without failing the whole dashboard.
      gsc(`/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps`).catch(() => null),
    ]);

    type Row = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };
    const trend = (byDate.rows ?? []).map((r: Row) => ({
      date: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    }));
    const totals = trend.reduce(
      (a, r) => {
        a.clicks += r.clicks;
        a.impressions += r.impressions;
        a.posSum += r.position * r.impressions;
        return a;
      },
      { clicks: 0, impressions: 0, posSum: 0 },
    );
    const avgPosition = totals.impressions ? totals.posSum / totals.impressions : 0;
    const avgCtr = totals.impressions ? totals.clicks / totals.impressions : 0;

    const queries = (byQuery.rows ?? []).map((r: Row) => ({
      query: r.keys[0], clicks: r.clicks, impressions: r.impressions,
      ctr: r.ctr, position: r.position,
    }));
    const pages = (byPage.rows ?? []).map((r: Row) => ({
      page: r.keys[0], clicks: r.clicks, impressions: r.impressions,
      ctr: r.ctr, position: r.position,
    }));

    return new Response(
      JSON.stringify({
        site: SITE,
        windowDays: days,
        startDate,
        endDate,
        totals: {
          clicks: totals.clicks,
          impressions: totals.impressions,
          avgPosition,
          avgCtr,
          rankingQueries: queries.length,
          indexedPages: pages.length,
          sitemaps: links?.sitemap?.length ?? 0,
        },
        trend,
        queries,
        pages,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
