// Send a Web Push notification to all of a user's subscribed devices.
// Body: { user_id: string; title: string; body?: string; url?: string; tag?: string; icon?: string }
// Auth: requires a valid logged-in user (can only send to self) OR service-role key.
// Dead endpoints (404/410) are pruned automatically.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VAPID_PUBLIC_KEY =
  "BP_rHfzOTJI2WXwGhHnhYz-NslV7DwDQdCx26e92pc99qGpH8U1KbR-Gy1nracbVNRvnO6dshEK_0aIOG-og9T4";

interface SendBody {
  user_id?: string;
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
  icon?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!vapidPrivate) {
      return json({ error: "Push not configured (missing VAPID_PRIVATE_KEY)" }, 500);
    }
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:hello@nexomind.ai";

    webpush.setVapidDetails(vapidSubject, VAPID_PUBLIC_KEY, vapidPrivate);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Identify caller. Allow either an authenticated user (self-only) or service role.
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    let callerId: string | null = null;
    let isService = false;

    if (token && token === serviceKey) {
      isService = true;
    } else if (token) {
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data } = await userClient.auth.getUser();
      callerId = data.user?.id ?? null;
    }

    if (!isService && !callerId) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = (await req.json().catch(() => ({}))) as SendBody;
    const targetUserId = isService ? body.user_id : callerId!;
    if (!targetUserId) return json({ error: "user_id required" }, 400);
    if (!body.title) return json({ error: "title required" }, 400);

    const { data: subs, error } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", targetUserId);

    if (error) return json({ error: error.message }, 500);
    if (!subs || subs.length === 0) return json({ sent: 0, results: [] }, 200);

    const payload = JSON.stringify({
      title: body.title,
      body: body.body ?? "",
      url: body.url ?? "/app",
      tag: body.tag,
      icon: body.icon,
    });

    const results = await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: s.endpoint,
              keys: { p256dh: s.p256dh, auth: s.auth },
            },
            payload,
          );
          return { id: s.id, ok: true };
        } catch (e: unknown) {
          const status = (e as { statusCode?: number }).statusCode;
          // Prune dead subscriptions
          if (status === 404 || status === 410) {
            await admin.from("push_subscriptions").delete().eq("id", s.id);
          }
          return {
            id: s.id,
            ok: false,
            status,
            error: e instanceof Error ? e.message : String(e),
          };
        }
      }),
    );

    const sent = results.filter((r) => r.ok).length;
    return json({ sent, total: subs.length, results }, 200);
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      500,
    );
  }
});

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
