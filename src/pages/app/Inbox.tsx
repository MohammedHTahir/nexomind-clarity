import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppShell from "@/components/app/AppShell";
import GlassCard from "@/components/app/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureFlag } from "@/lib/feature-flags";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";

interface SundayLetter {
  id: string;
  week_starts_on: string;
  body: string;
  generated_at: string;
  read_at: string | null;
}

const formatWeekDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
};

/** Simple markdown-to-JSX renderer for letter bodies */
const renderMarkdown = (text: string) => {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let key = 0;

  for (const line of lines) {
    key++;
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={key} className="h-3" />);
    } else if (trimmed.startsWith("### ")) {
      elements.push(
        <h4 key={key} className="font-instrument text-[18px] mt-4 mb-1">
          {trimmed.slice(4)}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h3 key={key} className="font-instrument text-[22px] mt-5 mb-2">
          {trimmed.slice(3)}
        </h3>
      );
    } else if (trimmed.startsWith("# ")) {
      elements.push(
        <h2 key={key} className="font-instrument text-[26px] mt-5 mb-2">
          {trimmed.slice(2)}
        </h2>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        <p key={key} className="font-barlow text-[15px] text-[#111]/75 leading-relaxed pl-4 mb-1">
          &bull; {trimmed.slice(2)}
        </p>
      );
    } else {
      elements.push(
        <p key={key} className="font-barlow text-[15px] text-[#111]/75 leading-relaxed mb-2">
          {trimmed}
        </p>
      );
    }
  }

  return elements;
};

const Inbox = () => {
  const { user } = useAuth();
  const flagEnabled = useFeatureFlag("sunday_letter");
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: letters = [], isLoading } = useQuery<SundayLetter[]>({
    queryKey: ["sunday-letters", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("sunday_letters")
        .select("id, week_starts_on, body, generated_at, read_at")
        .eq("user_id", user.id)
        .order("generated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SundayLetter[];
    },
    enabled: !!user,
  });

  const markRead = useMutation({
    mutationFn: async (letterId: string) => {
      const { error } = await supabase
        .from("sunday_letters")
        .update({ read_at: new Date().toISOString() })
        .eq("id", letterId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sunday-letters"] });
    },
  });

  const handleExpand = (letter: SundayLetter) => {
    if (expandedId === letter.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(letter.id);
    if (!letter.read_at) {
      markRead.mutate(letter.id);
    }
  };

  if (!flagEnabled) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto text-center pt-20">
          <p className="font-barlow text-[16px] text-[#111]/60">
            {t("inbox.unavailable")}
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-3">
            ( {t("inbox.kicker")} )
          </p>
          <h1 className="font-instrument text-[44px] md:text-[68px] leading-[1]">
            {t("inbox.title")}
          </h1>
          <p className="font-barlow text-[16px] text-[#111]/60 mt-3">
            {t("inbox.subtitle")}
          </p>
        </header>

        {isLoading && (
          <GlassCard className="p-7 mb-4" delay={0.05}>
            <p className="font-barlow text-[14px] text-[#111]/60">{t("general.loading")}</p>
          </GlassCard>
        )}

        {!isLoading && letters.length === 0 && (
          <GlassCard className="p-10 text-center" delay={0.05}>
            <p className="font-instrument text-[26px] mb-3">{t("inbox.empty.title")}</p>
            <p className="font-barlow text-[15px] text-[#111]/60 leading-relaxed max-w-md mx-auto">
              {t("inbox.empty.description")}
            </p>
          </GlassCard>
        )}

        {letters.map((letter, i) => {
          const isExpanded = expandedId === letter.id;
          const isUnread = !letter.read_at;

          return (
            <GlassCard key={letter.id} className="p-7 mb-4 cursor-pointer" delay={0.05 + i * 0.03}>
              <div onClick={() => handleExpand(letter)}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {isUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#111] shrink-0" />
                    )}
                    <div>
                      <p className="font-instrument text-[22px]">
                        {t("inbox.letterTitle", { date: formatWeekDate(letter.week_starts_on) })}
                      </p>
                      <p className="font-barlow text-[12px] text-[#111]/50 mt-0.5">
                        {new Date(letter.generated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="font-barlow text-[12px] text-[#111]/40">
                    {isExpanded ? t("inbox.collapse") : t("inbox.expand")}
                  </span>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="mt-5 pt-5 border-t border-black/5"
                  >
                    {renderMarkdown(letter.body)}
                  </motion.div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </AppShell>
  );
};

export default Inbox;
