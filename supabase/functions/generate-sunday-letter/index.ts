// Hourly cron: generate Sunday Letter from Yourself for eligible users.
// Idempotent via unique(user_id, week_starts_on).
// Free tier: monthly cadence (1st of month, prior 30 days).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

function getFirstOfMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

function isSundayInTimezone(tz: string): boolean {
  try {
    const now = new Date();
    const dayStr = now.toLocaleDateString("en-US", { weekday: "long", timeZone: tz });
    return dayStr === "Sunday";
  } catch {
    return new Date().getDay() === 0;
  }
}

function isFirstOfMonthInTimezone(tz: string): boolean {
  try {
    const now = new Date();
    const dayStr = now.toLocaleDateString("en-US", { day: "numeric", timeZone: tz });
    return dayStr === "1";
  } catch {
    return new Date().getDate() === 1;
  }
}

function getCurrentHourInTimezone(tz: string): number {
  try {
    const now = new Date();
    const hourStr = now.toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: tz });
    return parseInt(hourStr, 10);
  } catch {
    return new Date().getUTCHours();
  }
}

function parseTimeToHour(timeStr: string): number {
  // timeStr format: "HH:MM"
  const [h] = timeStr.split(":");
  return parseInt(h, 10);
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are NexoMind, writing a thoughtful weekly reflection letter addressed to the user from their own perspective. Write in first person as if the user is writing to themselves. Be warm, insightful, and concise. Use markdown formatting. Never include raw journal text. Only synthesize themes and patterns.`,
          },
          { role: "user", content: prompt },
        ],
      }),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < MAX_RETRIES - 1) {
        await sleep(BASE_DELAY_MS * Math.pow(2, attempt));
      }
    }
  }
  throw lastError;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    // Select profiles with sunday_letter_enabled = true
    const { data: profiles, error: profileErr } = await admin
      .from("profiles")
      .select("id, sunday_letter_time, sunday_letter_email_enabled, sunday_letter_push_enabled, timezone, email")
      .eq("sunday_letter_enabled", true);
    if (profileErr) throw profileErr;

    let generated = 0;

    for (const profile of profiles ?? []) {
      try {
        const tz = profile.timezone || "UTC";
        const currentHour = getCurrentHourInTimezone(tz);
        const preferredHour = parseTimeToHour(profile.sunday_letter_time || "09:00");

        // Check if current hour matches the user's preferred delivery time
        if (currentHour !== preferredHour) continue;

        // Determine cadence: check if user is premium
        const { data: isPremiumData } = await admin.rpc("is_premium", { _user_id: profile.id });
        const isPremium = !!isPremiumData;

        let weekStartsOn: string;
        let lookbackDays: number;

        if (isPremium) {
          // Premium: weekly on Sundays
          if (!isSundayInTimezone(tz)) continue;
          weekStartsOn = getMondayOfWeek(new Date());
          lookbackDays = 7;
        } else {
          // Free tier: monthly on 1st of the month
          if (!isFirstOfMonthInTimezone(tz)) continue;
          weekStartsOn = getFirstOfMonth(new Date());
          lookbackDays = 30;
        }

        // Idempotency check: skip if letter already exists for this period
        const { data: existing } = await admin
          .from("sunday_letters")
          .select("id")
          .eq("user_id", profile.id)
          .eq("week_starts_on", weekStartsOn)
          .maybeSingle();
        if (existing) continue;

        // Query prior entries
        const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString();
        const { data: analyses } = await admin
          .from("journal_analysis")
          .select("summary, emotional_state, cognitive_patterns, distortions_or_biases, clarity_insight, suggested_reflection")
          .eq("user_id", profile.id)
          .gte("created_at", since)
          .order("created_at", { ascending: false });

        let body: string;

        if (!analyses || analyses.length < 2) {
          // Low-effort prompt for sparse data
          body = "You had a quiet week. Even one brief check-in can reveal something worth noticing. Try writing a few lines about what is on your mind right now.";
        } else {
          // Build Gemini prompt from synthesized data (never raw text)
          const summaries = analyses.map((a) => a.summary).filter(Boolean);
          const emotions = analyses.map((a) => a.emotional_state).filter(Boolean);
          const patterns = analyses.flatMap((a) => a.cognitive_patterns ?? []);
          const distortions = analyses.flatMap((a) => a.distortions_or_biases ?? []);
          const insights = analyses.map((a) => a.clarity_insight).filter(Boolean);

          const prompt = `Based on ${analyses.length} reflection entries from the past ${lookbackDays} days, write a letter from the user to themselves. Here is synthesized data (never quote raw journal text):

Emotional states observed: ${[...new Set(emotions)].slice(0, 8).join(", ")}
Recurring themes from summaries: ${[...new Set(summaries)].slice(0, 6).join("; ")}
Cognitive patterns (each appeared in 2+ entries): ${[...new Set(patterns)].slice(0, 5).join(", ")}
Distortions noticed (each in 2+ analyses): ${[...new Set(distortions)].slice(0, 3).join(", ")}
Clarity insights: ${insights.slice(0, 4).join("; ")}

Structure your letter with:
- Up to 5 themes (each present in at least 2 entries)
- Up to 3 distortions (each in at least 2 analyses)
- Up to 3 decisions or shifts noticed
- Up to 3 prompts for revisiting next week
- Total length: 200-800 words
- Write in first person, as a letter from the user to themselves
- Use markdown formatting (headers, bullet points)
- Be warm but honest`;

          body = await withRetry(() => callGemini(prompt));
        }

        // Insert the letter
        const { error: insertErr } = await admin
          .from("sunday_letters")
          .insert({
            user_id: profile.id,
            week_starts_on: weekStartsOn,
            body,
          });
        if (insertErr) {
          console.error("Insert sunday_letter failed", insertErr);
          continue;
        }

        generated++;

        // Dispatch push notification if enabled
        if (profile.sunday_letter_push_enabled) {
          try {
            await admin.functions.invoke("send-push-notification", {
              body: {
                user_id: profile.id,
                title: "Your Sunday Letter is ready",
                body: "A new reflection letter from yourself is waiting in your inbox.",
                url: "/app/inbox",
                tag: "sunday-letter",
              },
            });
          } catch (e) {
            console.error("Push dispatch failed", e);
          }
        }

        // Dispatch email if enabled
        if (profile.sunday_letter_email_enabled && profile.email) {
          try {
            await admin.functions.invoke("send-transactional-email", {
              body: {
                templateName: "sunday-letter",
                recipientEmail: profile.email,
                idempotencyKey: `sunday-letter-${profile.id}-${weekStartsOn}`,
                templateData: {
                  body: body.slice(0, 2000),
                  weekStartsOn,
                },
              },
            });
          } catch (e) {
            console.error("Email dispatch failed", e);
          }
        }
      } catch (e) {
        console.error(`Error processing user ${profile.id}`, e);
        continue;
      }
    }

    return new Response(JSON.stringify({ processed: profiles?.length ?? 0, generated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-sunday-letter error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
