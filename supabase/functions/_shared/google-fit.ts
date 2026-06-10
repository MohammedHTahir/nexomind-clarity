/**
 * Shared Google OAuth token refresh + Google Fit data fetch helpers.
 *
 * - getFreshGoogleToken: returns a valid access token, refreshing via the
 *   stored refresh_token if expired/near-expiry; persists the new token.
 * - fetchGoogleFitSignals: reads sleep (Sessions API, more reliable for
 *   manual entries) + heart rate (aggregate) over a configurable window.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const REFRESH_SKEW_MS = 60_000; // refresh if expiring within 60s
const SLEEP_ACTIVITY_TYPE = 72; // Google Fit "Sleep" activity type

export async function getFreshGoogleToken(
  admin: ReturnType<typeof createClient>,
  row: {
    user_id: string;
    provider: string;
    access_token_enc: string | null;
    refresh_token_enc: string | null;
    token_expires_at: string | null;
  },
): Promise<string | null> {
  const token = row.access_token_enc;
  if (!token) return null;

  const expiresAt = row.token_expires_at
    ? new Date(row.token_expires_at).getTime()
    : 0;
  const needsRefresh = !expiresAt || expiresAt - Date.now() < REFRESH_SKEW_MS;

  if (!needsRefresh) return token;
  if (!row.refresh_token_enc) return token; // try the (likely stale) token

  const clientId = Deno.env.get("GOOGLE_CLIENT_ID") ??
    "564658078394-8r89v37156uboejrbbru4g50k3eanec5.apps.googleusercontent.com";
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  if (!clientSecret) return token;

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: row.refresh_token_enc,
        grant_type: "refresh_token",
      }),
    });
    if (!res.ok) {
      console.warn(
        `google token refresh failed: ${res.status} ${await res.text()}`,
      );
      return token;
    }
    const data = await res.json() as {
      access_token: string;
      expires_in?: number;
    };
    const newExpiresAt = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : null;

    await admin
      .from("user_integrations")
      .update({
        access_token_enc: data.access_token,
        token_expires_at: newExpiresAt,
      })
      .eq("user_id", row.user_id)
      .eq("provider", row.provider);

    return data.access_token;
  } catch (e) {
    console.warn("google token refresh threw", e);
    return token;
  }
}

async function safeFetch(
  url: string,
  init: RequestInit,
  timeoutMs = 8000,
): Promise<Response | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) {
      console.warn(`google fit fetch ${res.status} ${url}`);
      return null;
    }
    return res;
  } catch (e) {
    console.warn("google fit fetch threw", e);
    return null;
  }
}

export async function fetchGoogleFitSignals(
  token: string,
  windowMs: number = 36 * 60 * 60 * 1000, // last 36h to capture last night's sleep
): Promise<{ sleep_minutes: number | null; hrv_avg: number | null }> {
  const end = Date.now();
  const start = end - windowMs;

  let sleep_minutes: number | null = null;
  let hrv_avg: number | null = null;

  // --- Sleep via Sessions API (covers manual entries) ---
  const sessParams = new URLSearchParams({
    startTime: new Date(start).toISOString(),
    endTime: new Date(end).toISOString(),
    activityType: String(SLEEP_ACTIVITY_TYPE),
  });
  const sessRes = await safeFetch(
    `https://www.googleapis.com/fitness/v1/users/me/sessions?${sessParams}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (sessRes) {
    try {
      const data = await sessRes.json();
      const sessions: any[] = data?.session ?? [];
      if (sessions.length) {
        const totalMs = sessions.reduce((sum, s) => {
          const sMs = Number(s.startTimeMillis ?? 0);
          const eMs = Number(s.endTimeMillis ?? 0);
          return sum + Math.max(0, eMs - sMs);
        }, 0);
        if (totalMs > 0) sleep_minutes = Math.round(totalMs / 60000);
      }
    } catch { /* ignore */ }
  }

  // --- Heart rate via aggregate (avg bpm) ---
  const aggRes = await safeFetch(
    "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        aggregateBy: [{ dataTypeName: "com.google.heart_rate.bpm" }],
        bucketByTime: { durationMillis: windowMs },
        startTimeMillis: start,
        endTimeMillis: end,
      }),
    },
  );
  if (aggRes) {
    try {
      const data = await aggRes.json();
      for (const bucket of data?.bucket ?? []) {
        for (const ds of bucket.dataset ?? []) {
          for (const p of ds.point ?? []) {
            const v = p.value?.[0];
            const avg = v?.fpVal ?? v?.intVal;
            if (typeof avg === "number") {
              hrv_avg = Math.round(avg);
            }
          }
        }
      }
    } catch { /* ignore */ }
  }

  return { sleep_minutes, hrv_avg };
}
