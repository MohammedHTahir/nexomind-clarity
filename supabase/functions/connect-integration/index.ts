/**
 * Exchange OAuth authorization code for tokens and store in user_integrations.
 * Supports: google_calendar, google_fit, oura.
 *
 * Body: { code: string, provider: string, redirect_uri: string }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Provider = "google_calendar" | "google_fit" | "oura";

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
}

async function exchangeGoogle(
  code: string,
  redirectUri: string,
): Promise<TokenResponse> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID") ??
    "564658078394-8r89v37156uboejrbbru4g50k3eanec5.apps.googleusercontent.com";
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  if (!clientSecret) throw new Error("GOOGLE_CLIENT_SECRET not configured");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed: ${res.status} ${text}`);
  }
  return await res.json();
}

async function exchangeOura(
  code: string,
  redirectUri: string,
): Promise<TokenResponse> {
  const clientId = Deno.env.get("OURA_CLIENT_ID");
  const clientSecret = Deno.env.get("OURA_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new Error("Oura credentials not configured");
  }
  const res = await fetch("https://api.ouraring.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Oura token exchange failed: ${res.status} ${text}`);
  }
  return await res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { code, provider, redirect_uri } = body as {
      code?: string;
      provider?: Provider;
      redirect_uri?: string;
    };

    if (!code || !provider || !redirect_uri) {
      return new Response(
        JSON.stringify({ error: "Missing code, provider, or redirect_uri" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const validProviders: Provider[] = ["google_calendar", "google_fit", "oura"];
    if (!validProviders.includes(provider)) {
      return new Response(JSON.stringify({ error: "Unsupported provider" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let tokens: TokenResponse;
    if (provider === "oura") {
      tokens = await exchangeOura(code, redirect_uri);
    } else {
      tokens = await exchangeGoogle(code, redirect_uri);
    }

    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;
    const scopes = tokens.scope ? tokens.scope.split(/\s+/) : [];

    // NOTE: tokens are stored as-is for now. A future migration should encrypt
    // these at rest using a vault key — column names already imply _enc.
    const admin = createClient(supabaseUrl, serviceKey);
    const { error: upsertErr } = await admin
      .from("user_integrations")
      .upsert(
        {
          user_id: userData.user.id,
          provider,
          access_token_enc: tokens.access_token,
          refresh_token_enc: tokens.refresh_token ?? null,
          token_expires_at: expiresAt,
          scopes,
          connected_at: new Date().toISOString(),
        },
        { onConflict: "user_id,provider" },
      );

    if (upsertErr) {
      return new Response(JSON.stringify({ error: upsertErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
