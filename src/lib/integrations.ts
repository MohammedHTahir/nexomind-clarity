/**
 * OAuth flow helpers for wearable and calendar integrations.
 * Handles URL building for authorization redirects and token exchange stubs.
 */

import { supabase } from "@/integrations/supabase/client";

export type IntegrationProvider =
  | "oura"
  | "google_fit"
  | "google_calendar"
  | "apple_health"
  | "apple_calendar";

export interface Integration {
  id: string;
  provider: IntegrationProvider;
  connected_at: string;
  calendar_mask_titles: boolean;
}

const REDIRECT_URI = `${window.location.origin}/app/settings/integrations/callback`;

// --- OAuth URL Builders ---

export function getOuraAuthUrl(): string {
  const clientId = import.meta.env.VITE_OURA_CLIENT_ID ?? "";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    scope: "daily readiness sleep personal",
    state: "oura",
  });
  return `https://cloud.ouraring.com/oauth/authorize?${params.toString()}`;
}

export function getGoogleFitAuthUrl(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    scope: "https://www.googleapis.com/auth/fitness.sleep.read https://www.googleapis.com/auth/fitness.heart_rate.read",
    access_type: "offline",
    prompt: "consent",
    state: "google_fit",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function getGoogleCalendarAuthUrl(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    access_type: "offline",
    prompt: "consent",
    state: "google_calendar",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// --- OAuth Callback Handler ---

export async function handleOAuthCallback(
  code: string,
  provider: IntegrationProvider
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("connect-integration", {
      body: { code, provider, redirect_uri: REDIRECT_URI },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Connection failed" };
  }
}

// --- Integration Management ---

export async function fetchIntegrations(): Promise<Integration[]> {
  const { data, error } = await supabase
    .from("user_integrations")
    .select("id, provider, connected_at, calendar_mask_titles")
    .order("connected_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Integration[];
}

export async function disconnectIntegration(provider: IntegrationProvider): Promise<void> {
  const { error } = await supabase
    .from("user_integrations")
    .delete()
    .eq("provider", provider);
  if (error) throw error;
}

export async function updateCalendarMaskTitles(
  provider: IntegrationProvider,
  maskTitles: boolean
): Promise<void> {
  const { error } = await supabase
    .from("user_integrations")
    .update({ calendar_mask_titles: maskTitles })
    .eq("provider", provider);
  if (error) throw error;
}

// --- Provider Display Info ---

export const PROVIDER_INFO: Record<
  IntegrationProvider,
  { name: string; description: string; comingSoon?: boolean }
> = {
  oura: { name: "Oura Ring", description: "Sleep, HRV, and readiness data" },
  google_fit: { name: "Google Fit", description: "Sleep and heart rate data" },
  google_calendar: { name: "Google Calendar", description: "Meeting count and duration" },
  apple_health: { name: "Apple Health", description: "Sleep and activity data", comingSoon: true },
  apple_calendar: { name: "Apple Calendar", description: "Calendar events", comingSoon: true },
};

export function getAuthUrl(provider: IntegrationProvider): string | null {
  switch (provider) {
    case "oura":
      return getOuraAuthUrl();
    case "google_fit":
      return getGoogleFitAuthUrl();
    case "google_calendar":
      return getGoogleCalendarAuthUrl();
    default:
      return null;
  }
}
