import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { t } from "@/lib/i18n";

export type ReflectionMode = "companion" | "challenger";

const QUERY_KEY = "reflection-mode";

export function useReflectionMode() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: mode, isLoading } = useQuery<ReflectionMode>({
    queryKey: [QUERY_KEY, user?.id],
    queryFn: async () => {
      if (!user) return "companion";
      const { data, error } = await supabase
        .from("profiles")
        .select("reflection_mode")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return (data?.reflection_mode as ReflectionMode) ?? "companion";
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const mutation = useMutation<void, Error, ReflectionMode>({
    mutationFn: async (newMode) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ reflection_mode: newMode })
        .eq("id", user.id);
      if (error) throw error;
    },
    onMutate: async (newMode) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, user?.id] });
      const previous = queryClient.getQueryData<ReflectionMode>([QUERY_KEY, user?.id]);
      queryClient.setQueryData([QUERY_KEY, user?.id], newMode);
      return { previous };
    },
    onError: (_err, _newMode, context: unknown) => {
      const ctx = context as { previous?: ReflectionMode } | undefined;
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData([QUERY_KEY, user?.id], ctx.previous);
      }
      toast.error(t("settings.reflectionMode.error"));
    },
    onSuccess: () => {
      toast.success(t("settings.reflectionMode.saved"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, user?.id] });
    },
  });

  return {
    mode: mode ?? "companion",
    setMode: mutation.mutate,
    isLoading,
  };
}
