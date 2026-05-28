import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/app/GlassCard";
import { toast } from "sonner";
import { t } from "@/lib/i18n";

type Channel = "push" | "banner" | "off";

const channelOptions: { value: Channel; labelKey: string; descKey: string }[] = [
  {
    value: "push",
    labelKey: "settings.patternInterrupts.push",
    descKey: "settings.patternInterrupts.push.description",
  },
  {
    value: "banner",
    labelKey: "settings.patternInterrupts.banner",
    descKey: "settings.patternInterrupts.banner.description",
  },
  {
    value: "off",
    labelKey: "settings.patternInterrupts.off",
    descKey: "settings.patternInterrupts.off.description",
  },
];

const PatternInterruptsCard = ({ delay = 0.2 }: { delay?: number }) => {
  const { user } = useAuth();
  const [channel, setChannel] = useState<Channel>("push");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notification_preferences")
      .select("pattern_interrupts_enabled, pattern_interrupt_channel")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          // Support legacy: if pattern_interrupt_channel exists, use it;
          // otherwise fall back to the boolean flag
          if (data.pattern_interrupt_channel) {
            setChannel(data.pattern_interrupt_channel as Channel);
          } else if (data.pattern_interrupts_enabled === false) {
            setChannel("off");
          }
        }
        setLoading(false);
      });
  }, [user]);

  const handleChange = async (next: Channel) => {
    if (!user || saving) return;
    setSaving(true);
    const { error } = await supabase
      .from("notification_preferences")
      .upsert(
        {
          user_id: user.id,
          pattern_interrupt_channel: next,
          pattern_interrupts_enabled: next !== "off",
        },
        { onConflict: "user_id" }
      );
    setSaving(false);
    if (error) {
      toast.error(t("settings.patternInterrupts.error"));
      return;
    }
    setChannel(next);
    toast.success(t("settings.patternInterrupts.saved"));
  };

  return (
    <GlassCard className="p-7 mb-4" delay={delay}>
      <div className="flex-1 min-w-[240px]">
        <h2 className="font-instrument text-[24px] mb-2">{t("settings.patternInterrupts")}</h2>
        <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-5">
          {t("settings.patternInterrupts.description")}
        </p>
      </div>
      <div className={`space-y-3 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
        {channelOptions.map((opt) => {
          const selected = channel === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${
                selected
                  ? "bg-[#111]/5 border-[#111]/20"
                  : "bg-white/50 border-black/5 hover:bg-white/80"
              } ${saving ? "opacity-50 pointer-events-none" : ""}`}
            >
              <input
                type="radio"
                name="pattern-interrupt-channel"
                value={opt.value}
                checked={selected}
                onChange={() => handleChange(opt.value)}
                className="mt-1 accent-[#111]"
              />
              <div>
                <span className="font-barlow font-medium text-[14px]">{t(opt.labelKey)}</span>
                <p className="font-barlow text-[12px] text-[#111]/55 mt-0.5">
                  {t(opt.descKey)}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default PatternInterruptsCard;
