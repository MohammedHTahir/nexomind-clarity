import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/app/GlassCard";
import { toast } from "sonner";

const PatternInterruptsCard = ({ delay = 0.2 }: { delay?: number }) => {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notification_preferences")
      .select("pattern_interrupts_enabled")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setEnabled(!!data.pattern_interrupts_enabled);
        setLoading(false);
      });
  }, [user]);

  const toggle = async () => {
    if (!user || saving) return;
    setSaving(true);
    const next = !enabled;
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({ user_id: user.id, pattern_interrupts_enabled: next }, { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      toast.error("Couldn't save preference");
      return;
    }
    setEnabled(next);
    toast.success(next ? "Pattern interrupts on." : "Pattern interrupts paused.");
  };

  return (
    <GlassCard className="p-7 mb-4" delay={delay}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <h2 className="font-instrument text-[24px] mb-2">Pattern interrupts</h2>
          <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed">
            When NexoMind learns the times your loops tend to open, it'll send one calm
            email — only when it would help. Never spam, never daily.
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={loading || saving}
          className={`relative w-14 h-8 rounded-full border transition-colors flex-shrink-0 ${
            enabled ? "bg-[#111] border-[#111]" : "bg-white/70 border-black/10"
          } disabled:opacity-50`}
          aria-label="Toggle pattern interrupts"
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </GlassCard>
  );
};

export default PatternInterruptsCard;
