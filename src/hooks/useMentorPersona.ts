import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { t } from "@/lib/i18n";

export interface MentorPersona {
  key: string;
  name: string;
  voice_block: string;
  compatible_modes: string[];
  is_curated: boolean;
  display_order: number;
}

export interface YouMentorProfile {
  themes: string[];
  vocab: string[];
  reframe_style: string;
  refreshed_at: string | null;
  source_entry_count: number;
}

export interface UseMentorPersonaReturn {
  activePersona: string | null;
  personas: MentorPersona[];
  setActivePersona: (key: string | null) => void;
  youMentorProfile: YouMentorProfile | null;
  isYouMentorEligible: boolean;
  youMentorProgress: number;
  isLoading: boolean;
  isSwitching: boolean;
  rateLimitMessage: string | null;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function useMentorPersona(): UseMentorPersonaReturn {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const queryClient = useQueryClient();
  const [isSwitching, setIsSwitching] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);

  // Fetch personas list
  const { data: personas = [] } = useQuery<MentorPersona[]>({
    queryKey: ["mentor-personas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_personas")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as MentorPersona[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user profile data (active persona, you_mentor_profile)
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["mentor-persona-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("active_mentor_persona, you_mentor_profile")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  // Fetch entry count for You-Mentor eligibility
  const { data: entryCount = 0 } = useQuery({
    queryKey: ["journal-entry-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("journals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const activePersona = (profileData as Record<string, unknown>)?.active_mentor_persona as string | null ?? null;
  const youMentorProfile = (profileData as Record<string, unknown>)?.you_mentor_profile as YouMentorProfile | null ?? null;
  const isYouMentorEligible = entryCount >= 30;
  const youMentorProgress = Math.min(entryCount, 30);

  const setActivePersona = useCallback(
    async (key: string | null) => {
      if (!user) return;
      setIsSwitching(true);
      setRateLimitMessage(null);

      try {
        // Free tier rate limit check: 1 switch per 7 days
        if (!isPremium && key !== null) {
          const since = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();
          const { data: switches, error: switchErr } = await supabase
            .from("user_persona_switches")
            .select("id")
            .eq("user_id", user.id)
            .gte("switched_at", since);
          if (switchErr) throw switchErr;
          if (switches && switches.length >= 1) {
            setRateLimitMessage(t("persona.rateLimitFree"));
            setIsSwitching(false);
            return;
          }
        }

        // You-Mentor eligibility check
        if (key === "you_mentor" && !isYouMentorEligible) {
          toast.error(t("persona.youMentorLocked"));
          setIsSwitching(false);
          return;
        }

        // Update profile
        const { error: updateErr } = await supabase
          .from("profiles")
          .update({ active_mentor_persona: key })
          .eq("id", user.id);
        if (updateErr) throw updateErr;

        // Log switch
        if (key !== null) {
          await supabase
            .from("user_persona_switches")
            .insert({ user_id: user.id, persona_key: key });
        }

        queryClient.invalidateQueries({ queryKey: ["mentor-persona-profile"] });
        toast.success(t("persona.switched"));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to switch persona";
        toast.error(msg);
      } finally {
        setIsSwitching(false);
      }
    },
    [user, isPremium, isYouMentorEligible, queryClient]
  );

  return {
    activePersona,
    personas,
    setActivePersona,
    youMentorProfile,
    isYouMentorEligible,
    youMentorProgress,
    isLoading,
    isSwitching,
    rateLimitMessage,
  };
}

export default useMentorPersona;
