/**
 * Minimal i18n shim with t() function for string interpolation.
 * Uses a flat JSON resource file with {{param}} interpolation.
 */

import strings from "@/locales/en-US.json";

const catalog: Record<string, string> = strings;

/**
 * Translate a key, with optional parameter interpolation.
 * Returns the key itself as a fallback if not found.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  let value = catalog[key];
  if (value === undefined) {
    if (import.meta.env.DEV) {
      console.warn(`[i18n] Missing key: "${key}"`);
    }
    return key;
  }
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
    }
  }
  return value;
}

/**
 * Format a date using Intl.DateTimeFormat.
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("en-US", options).format(d);
}

/**
 * Format a number using Intl.NumberFormat.
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat("en-US", options).format(value);
}

/**
 * Format a relative time (e.g., "3 days ago").
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  options?: Intl.RelativeTimeFormatOptions
): string {
  return new Intl.RelativeTimeFormat("en-US", {
    numeric: "auto",
    ...options,
  }).format(value, unit);
}
