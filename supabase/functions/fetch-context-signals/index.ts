/**
 * Internal helper: fetches context signals from connected wearable/calendar integrations.
 * Called inline from analyze-journal. Accepts user_id via JSON body (service-role only).
 * Returns { sleep_minutes, hrv_avg, meeting_count_24h, meeting_minutes_24h, source_versions }
 * or null on failure. Never surfaces errors to the end user.
 *
 * Security: Validates the X-Internal-Secret header (INTERNAL_FUNCTION_SECRET env var)
 * to ensure only authorized internal edge functions can invoke this endpoint.
 *
 * TODO: Tokens in access_token_enc are currently stored/read as plaintext.
 * Add pgsodium decryption or application-layer decryption before using as bearer tokens.
 *
 * TODO: token_expires_at is stored but never checked before making API calls.
 * Add refresh token flow: check expiry, call provider refresh endpoint if expired,
 * update stored tokens. Currently expired tokens produce silent 401 failures.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  fetchGoogleFitSignals,
  getFreshGoogleToken,
} from "../_shared/google-fit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContextSignals {
  sleep_minutes: number | null;
  hrv_avg: number | null;
  meeting_count_24h: number | null;
  meeting_minutes_24h: number | null;
  source_versions: Record<string, string>;
}

interface Integration {
  provider: string;
  access_token_enc: string | null;
  refresh_token_enc: string | null;
  token_expires_at: string | null;
  calendar_mask_titles: boolean;
}

const TIMEOUT_MS = 5000;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

// TODO: Each edge function implements its own ad-hoc timeout/retry logic with varying
// semantics (AbortController, setTimeout, different backoff strategies). Extract a shared
// utility module (e.g., supabase/functions/_shared/fetch-retry.ts) that provides:
//   - Configurable timeout via AbortController
//   - Exponential backoff with jitter
//   - Consistent error classification (retryable vs non-retryable)
//   - Shared logging format
// Then import it in fetch-context-signals, detect-crisis, generate-sunday-letter, etc.

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) return res;
      if (res.status >= 400 && res.status < 500) return null; // client error, no retry
    } catch (e) {
      // network/timeout error
    }
    // Exponential backoff capped at 30s
    const delay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt), 30000);
    await new Promise((r) => setTimeout(r, delay));
  }
  return null;
}

async function fetchOuraData(token: string): Promise<{ sleep_minutes: number | null; hrv_avg: number | null }> {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  let sleep_minutes: number | null = null;
  let hrv_avg: number | null = null;

  // Sleep data
  const sleepRes = await fetchWithRetry(
    `https://api.ouraring.com/v2/usercollection/sleep?start_date=${yesterday}&end_date=${today}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (sleepRes) {
    try {
      const data = await sleepRes.json();
      const sleepItems = data?.data ?? [];
      if (sleepItems.length > 0) {
        const totalSeconds = sleepItems.reduce(
          (sum: number, item: any) => sum + (item.total_sleep_duration ?? 0),
          0
        );
        sleep_minutes = Math.round(totalSeconds / 60);
      }
    } catch { /* ignore parse errors */ }
  }

  // HRV data
  const hrvRes = await fetchWithRetry(
    `https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${yesterday}&end_date=${today}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (hrvRes) {
    try {
      const data = await hrvRes.json();
      const items = data?.data ?? [];
      if (items.length > 0 && items[0]?.contributors?.hrv_balance !== undefined) {
        hrv_avg = items[0].contributors.hrv_balance;
      }
    } catch { /* ignore parse errors */ }
  }

  return { sleep_minutes, hrv_avg };
}

async function fetchGoogleFitData(token: string): Promise<{ sleep_minutes: number | null; hrv_avg: number | null }> {
  const endTime = Date.now();
  const startTime = endTime - 24 * 60 * 60 * 1000;

  let sleep_minutes: number | null = null;
  let hrv_avg: number | null = null;

  const res = await fetchWithRetry(
    "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        aggregateBy: [
          { dataTypeName: "com.google.sleep.segment" },
          { dataTypeName: "com.google.heart_rate.bpm" },
        ],
        startTimeMillis: startTime,
        endTimeMillis: endTime,
      }),
    }
  );

  if (res) {
    try {
      const data = await res.json();
      const buckets = data?.bucket ?? [];
      for (const bucket of buckets) {
        for (const dataset of bucket.dataset ?? []) {
          if (dataset.dataSourceId?.includes("sleep") && dataset.point?.length) {
            const totalMs = dataset.point.reduce(
              (sum: number, p: any) => sum + ((p.endTimeNanos - p.startTimeNanos) / 1e6),
              0
            );
            sleep_minutes = Math.round(totalMs / 60000);
          }
          if (dataset.dataSourceId?.includes("heart_rate") && dataset.point?.length) {
            const values = dataset.point.map((p: any) => p.value?.[0]?.fpVal).filter(Boolean);
            if (values.length) {
              hrv_avg = Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length);
            }
          }
        }
      }
    } catch { /* ignore parse errors */ }
  }

  return { sleep_minutes, hrv_avg };
}

async function fetchGoogleCalendarData(
  token: string,
  maskTitles: boolean
): Promise<{ meeting_count_24h: number | null; meeting_minutes_24h: number | null }> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    timeMin: yesterday.toISOString(),
    timeMax: now.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "100",
  });

  const res = await fetchWithRetry(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res) return { meeting_count_24h: null, meeting_minutes_24h: null };

  try {
    const data = await res.json();
    const events = data?.items ?? [];
    const meetings = events.filter(
      (e: any) => e.start?.dateTime && e.end?.dateTime
    );
    const meeting_count_24h = meetings.length;
    const meeting_minutes_24h = meetings.reduce((sum: number, e: any) => {
      const start = new Date(e.start.dateTime).getTime();
      const end = new Date(e.end.dateTime).getTime();
      return sum + (end - start) / 60000;
    }, 0);

    return {
      meeting_count_24h,
      meeting_minutes_24h: Math.round(meeting_minutes_24h),
    };
  } catch {
    return { meeting_count_24h: null, meeting_minutes_24h: null };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Caller authentication: verify this request comes from an internal edge function
    // (e.g., analyze-journal) by checking a shared internal secret header.
    const internalSecret = Deno.env.get("INTERNAL_FUNCTION_SECRET");
    const callerSecret = req.headers.get("x-internal-secret");
    if (!internalSecret || callerSecret !== internalSecret) {
      return new Response(JSON.stringify({ error: "Forbidden: internal use only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify(null), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get user's connected integrations
    const { data: integrations, error } = await admin
      .from("user_integrations")
      .select("provider, access_token_enc, refresh_token_enc, token_expires_at, calendar_mask_titles")
      .eq("user_id", user_id);

    if (error || !integrations || integrations.length === 0) {
      return new Response(JSON.stringify(null), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signals: ContextSignals = {
      sleep_minutes: null,
      hrv_avg: null,
      meeting_count_24h: null,
      meeting_minutes_24h: null,
      source_versions: {},
    };

    for (const integration of integrations as Integration[]) {
      const token = integration.access_token_enc;
      if (!token) continue;

      // TODO: Check token_expires_at before using the token. If expired, use
      // refresh_token_enc to obtain a new access token from the provider's OAuth
      // refresh endpoint, then update the stored tokens. Currently expired tokens
      // produce silent 401 failures from provider APIs.

      try {
        if (integration.provider === "oura") {
          const oura = await fetchOuraData(token);
          if (oura.sleep_minutes !== null) signals.sleep_minutes = oura.sleep_minutes;
          if (oura.hrv_avg !== null) signals.hrv_avg = oura.hrv_avg;
          signals.source_versions["oura"] = "v2";
        } else if (integration.provider === "google_fit") {
          const gfit = await fetchGoogleFitData(token);
          if (gfit.sleep_minutes !== null && signals.sleep_minutes === null) {
            signals.sleep_minutes = gfit.sleep_minutes;
          }
          if (gfit.hrv_avg !== null && signals.hrv_avg === null) {
            signals.hrv_avg = gfit.hrv_avg;
          }
          signals.source_versions["google_fit"] = "v1";
        } else if (integration.provider === "google_calendar") {
          const cal = await fetchGoogleCalendarData(token, integration.calendar_mask_titles);
          signals.meeting_count_24h = cal.meeting_count_24h;
          signals.meeting_minutes_24h = cal.meeting_minutes_24h;
          signals.source_versions["google_calendar"] = "v3";
        }
      } catch (e) {
        console.warn(`fetch-context-signals: ${integration.provider} failed`, e);
        // continue with other providers
      }
    }

    // If no data was collected at all, return null
    const hasData = signals.sleep_minutes !== null ||
      signals.hrv_avg !== null ||
      signals.meeting_count_24h !== null;

    return new Response(JSON.stringify(hasData ? signals : null), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-context-signals error", e);
    return new Response(JSON.stringify(null), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
