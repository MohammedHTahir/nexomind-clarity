/**
 * User-facing context signals endpoint.
 * Returns the same shape as fetch-context-signals but is authenticated via the
 * caller's JWT (not the internal shared secret) so the dashboard widget can
 * surface today's sleep / HRV / meeting load to the user.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  fetchGoogleFitSignals,
  getFreshGoogleToken,
} from "../_shared/google-fit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Signals {
  sleep_minutes: number | null;
  hrv_avg: number | null;
  meeting_count_24h: number | null;
  meeting_minutes_24h: number | null;
  providers: string[];
  fetched_at: string;
}

const TIMEOUT_MS = 5000;

async function safeFetch(url: string, init: RequestInit): Promise<Response | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    clearTimeout(t);
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

async function oura(token: string) {
  const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const t = new Date().toISOString().slice(0, 10);
  let sleep_minutes: number | null = null;
  let hrv_avg: number | null = null;
  const s = await safeFetch(
    `https://api.ouraring.com/v2/usercollection/sleep?start_date=${y}&end_date=${t}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (s) {
    try {
      const d = await s.json();
      const items = d?.data ?? [];
      if (items.length) {
        const sec = items.reduce((a: number, i: any) => a + (i.total_sleep_duration ?? 0), 0);
        sleep_minutes = Math.round(sec / 60);
      }
    } catch { /* ignore */ }
  }
  const h = await safeFetch(
    `https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${y}&end_date=${t}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (h) {
    try {
      const d = await h.json();
      const v = d?.data?.[0]?.contributors?.hrv_balance;
      if (typeof v === "number") hrv_avg = v;
    } catch { /* ignore */ }
  }
  return { sleep_minutes, hrv_avg };
}

async function googleFit(token: string) {
  const end = Date.now();
  const start = end - 86400000;
  let sleep_minutes: number | null = null;
  let hrv_avg: number | null = null;
  const res = await safeFetch(
    "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        aggregateBy: [
          { dataTypeName: "com.google.sleep.segment" },
          { dataTypeName: "com.google.heart_rate.bpm" },
        ],
        startTimeMillis: start,
        endTimeMillis: end,
      }),
    },
  );
  if (res) {
    try {
      const data = await res.json();
      for (const bucket of data?.bucket ?? []) {
        for (const ds of bucket.dataset ?? []) {
          if (ds.dataSourceId?.includes("sleep") && ds.point?.length) {
            const ms = ds.point.reduce(
              (a: number, p: any) => a + (p.endTimeNanos - p.startTimeNanos) / 1e6,
              0,
            );
            sleep_minutes = Math.round(ms / 60000);
          }
          if (ds.dataSourceId?.includes("heart_rate") && ds.point?.length) {
            const vals = ds.point.map((p: any) => p.value?.[0]?.fpVal).filter(Boolean);
            if (vals.length) {
              hrv_avg = Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length);
            }
          }
        }
      }
    } catch { /* ignore */ }
  }
  return { sleep_minutes, hrv_avg };
}

async function googleCalendar(token: string) {
  const now = new Date();
  const yest = new Date(now.getTime() - 86400000);
  const params = new URLSearchParams({
    timeMin: yest.toISOString(),
    timeMax: now.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "100",
  });
  const res = await safeFetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res) return { meeting_count_24h: null, meeting_minutes_24h: null };
  try {
    const d = await res.json();
    const meetings = (d?.items ?? []).filter(
      (e: any) => e.start?.dateTime && e.end?.dateTime,
    );
    const mins = meetings.reduce((s: number, e: any) => {
      return s + (new Date(e.end.dateTime).getTime() - new Date(e.start.dateTime).getTime()) / 60000;
    }, 0);
    return {
      meeting_count_24h: meetings.length,
      meeting_minutes_24h: Math.round(mins),
    };
  } catch {
    return { meeting_count_24h: null, meeting_minutes_24h: null };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: userRes, error: userErr } = await admin.auth.getUser(jwt);
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userRes.user.id;

    const { data: integrations } = await admin
      .from("user_integrations")
      .select("provider, access_token_enc, calendar_mask_titles")
      .eq("user_id", userId);

    const signals: Signals = {
      sleep_minutes: null,
      hrv_avg: null,
      meeting_count_24h: null,
      meeting_minutes_24h: null,
      providers: [],
      fetched_at: new Date().toISOString(),
    };

    for (const i of integrations ?? []) {
      const token = (i as any).access_token_enc;
      if (!token) continue;
      try {
        if (i.provider === "oura") {
          const r = await oura(token);
          if (r.sleep_minutes !== null) signals.sleep_minutes = r.sleep_minutes;
          if (r.hrv_avg !== null) signals.hrv_avg = r.hrv_avg;
          signals.providers.push("oura");
        } else if (i.provider === "google_fit") {
          const r = await googleFit(token);
          if (r.sleep_minutes !== null && signals.sleep_minutes === null) {
            signals.sleep_minutes = r.sleep_minutes;
          }
          if (r.hrv_avg !== null && signals.hrv_avg === null) {
            signals.hrv_avg = r.hrv_avg;
          }
          signals.providers.push("google_fit");
        } else if (i.provider === "google_calendar") {
          const r = await googleCalendar(token);
          signals.meeting_count_24h = r.meeting_count_24h;
          signals.meeting_minutes_24h = r.meeting_minutes_24h;
          signals.providers.push("google_calendar");
        }
      } catch (e) {
        console.warn(`get-my-context-signals: ${i.provider} failed`, e);
      }
    }

    return new Response(JSON.stringify(signals), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("get-my-context-signals error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
