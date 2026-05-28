import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { X } from "lucide-react";
import { t } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

interface InboxItem {
  id: string;
  distortion_label: string;
  body: string;
  created_at: string;
  expires_at: string;
}

const QUERY_KEY = "pattern-interrupt-inbox";

/**
 * Reads undismissed pattern_interrupt_inbox items for the current user
 * and renders a top-of-page dismissible banner.
 */
const PatternInterruptBanner = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items } = useQuery<InboxItem[]>({
    queryKey: [QUERY_KEY, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("pattern_interrupt_inbox")
        .select("id, distortion_label, body, created_at, expires_at")
        .eq("user_id", user.id)
        .is("dismissed_at", null)
        .gt("expires_at", now)
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) return [];
      return (data ?? []) as InboxItem[];
    },
    enabled: !!user,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const dismissMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pattern_interrupt_inbox")
        .update({ dismissed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, user?.id] });
    },
  });

  const item = items?.[0] ?? null;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key={item.id}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="w-full bg-indigo-50 border-b border-indigo-200/60 px-4 py-3 flex items-center justify-between gap-3 relative z-40">
            <div className="flex-1 min-w-0">
              <p className="font-barlow font-medium text-[12px] tracking-wide uppercase text-indigo-900/60 mb-0.5">
                {t("patternInterrupt.title")}
              </p>
              <p className="font-barlow text-[13px] text-indigo-900/80 truncate">
                {item.body || t("patternInterrupt.banner.distortion", { distortion: item.distortion_label })}
              </p>
            </div>
            <button
              onClick={() => dismissMutation.mutate(item.id)}
              disabled={dismissMutation.isPending}
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-indigo-600/60 hover:text-indigo-900 hover:bg-indigo-100 transition-colors disabled:opacity-50"
              aria-label={t("patternInterrupt.dismiss")}
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PatternInterruptBanner;
