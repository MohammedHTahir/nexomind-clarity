/**
 * Lightweight analytics wrapper around GA4 (gtag).
 *
 * Safe to call before consent: gtag is configured with Consent Mode v2 in
 * index.html and only receives data once the user grants `analytics_storage`.
 * Calls before that are queued/dropped by gtag itself — no errors thrown.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type ConversionEvent =
  | "cta_click_hero"
  | "cta_click_pricing"
  | "cta_click_seo_page"
  | "newsletter_signup"
  | "signup_completed"
  | "subscription_started"
  | "journal_entry_created"
  | "blog_post_view"
  | "overthinking_analyzer_result"
  | "overthinking_analyzer_copy"
  | "overthinking_analyzer_share";

export function trackEvent(
  event: ConversionEvent,
  params: Record<string, string | number | boolean> = {},
) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, params);
  } catch {
    // Never throw from analytics
  }
}
