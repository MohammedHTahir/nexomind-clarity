/**
 * Feature flags client: useFeatureFlag hook and FeatureGate component.
 * Fail-closed: returns false on timeout/error.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import React from "react";

type FlagMap = Record<string, boolean>;

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const TIMEOUT_MS = 3000;

async function fetchFlags(): Promise<FlagMap> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return {};

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate-flags`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        signal: controller.signal,
      }
    );

    if (!response.ok) return {};
    return (await response.json()) as FlagMap;
  } catch {
    // Fail-closed: any error (timeout, network, parse) returns empty map
    return {};
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * React hook that returns whether a feature flag is enabled for the current user.
 * Fail-closed: returns false on timeout, error, or if the flag is not present.
 */
export function useFeatureFlag(key: string): boolean {
  const { data } = useQuery<FlagMap>({
    queryKey: ["feature-flags"],
    queryFn: fetchFlags,
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: true,
    retry: false,
  });

  return data?.[key] ?? false;
}

/**
 * Component that conditionally renders children based on a feature flag.
 */
export function FeatureGate({
  flag,
  children,
}: {
  flag: string;
  children: React.ReactNode;
}): React.ReactElement | null {
  const enabled = useFeatureFlag(flag);
  if (!enabled) return null;
  return React.createElement(React.Fragment, null, children);
}
