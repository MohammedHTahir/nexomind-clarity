import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureFlag } from "@/lib/feature-flags";
import GlassCard from "@/components/app/GlassCard";
import { toast } from "sonner";
import { t } from "@/lib/i18n";

const TIME_OPTIONS: { value: string; label: string }[] = [];
for (let h = 6; h <= 22; h++) {
  for (const m of [0, 30]) {
    if (h === 22 && m === 30) continue;
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const display = `${((h + 11) % 12) + 1}:${mm} ${h >= 12 ? "PM" : "AM"}`;
    TIME_OPTIONS.push({ value: `${hh}:${mm}`, label: display });
  }
}

const SundayLetterCard = ({ delay = 0.2 }: { delay?: number }) => {
  const { user } = useAuth();
  const flagEnabled = useFeatureFlag("sunday_letter");

  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("09:00");
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("sunday_letter_enabled, sunday_letter_time, sunday_letter_email_enabled, sunday_letter_push_enabled")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setEnabled(data.sunday_letter_enabled ?? false);
          setTime(data.sunday_letter_time ?? "09:00");
          setEmailEnabled(data.sunday_letter_email_enabled ?? false);
          setPushEnabled(data.sunday_letter_push_enabled ?? false);
        }
        setLoading(false);
      });
  }, [user]);

  const persist = async (updates: Record<string, unknown>) => {
    if (!user || saving) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(t("settings.sundayLetter.error"));
      return false;
    }
    toast.success(t("settings.sundayLetter.saved"));
    return true;
  };

  const handleToggle = async () => {
    const next = !enabled;
    const ok = await persist({ sunday_letter_enabled: next });
    if (ok) setEnabled(next);
  };

  const handleTimeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    const ok = await persist({ sunday_letter_time: next });
    if (ok) setTime(next);
  };

  const handleEmailChange = async () => {
    const next = !emailEnabled;
    const ok = await persist({ sunday_letter_email_enabled: next });
    if (ok) setEmailEnabled(next);
  };

  const handlePushChange = async () => {
    const next = !pushEnabled;
    const ok = await persist({ sunday_letter_push_enabled: next });
    if (ok) setPushEnabled(next);
  };

  if (!flagEnabled) return null;

  return (
    <GlassCard className="p-7 mb-4" delay={delay}>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div className="flex-1 min-w-[240px]">
          <h2 className="font-instrument text-[24px] mb-2">{t("settings.sundayLetter")}</h2>
          <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed">
            {t("settings.sundayLetter.description")}
          </p>
        </div>
      </div>

      <div className={`space-y-5 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
        {/* Enable toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggle}
            disabled={saving}
            className="w-5 h-5 accent-[#111] rounded"
          />
          <span className="font-barlow font-medium text-[14px]">
            {t("settings.sundayLetter.enable")}
          </span>
        </label>

        {enabled && (
          <>
            {/* Time picker */}
            <div>
              <label className="font-barlow text-[13px] text-[#111]/60 block mb-1.5">
                {t("settings.sundayLetter.deliveryTime")}
              </label>
              <select
                value={time}
                onChange={handleTimeChange}
                disabled={saving}
                className="bg-white/70 backdrop-blur-md border border-black/10 rounded-xl px-4 py-2.5 font-barlow text-[14px] text-[#111] focus:outline-none focus:ring-2 focus:ring-[#111]/10 disabled:opacity-50"
              >
                {TIME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Channel checkboxes */}
            <div>
              <p className="font-barlow text-[13px] text-[#111]/60 mb-2">
                {t("settings.sundayLetter.channels")}
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={handleEmailChange}
                    disabled={saving}
                    className="w-4 h-4 accent-[#111] rounded"
                  />
                  <span className="font-barlow text-[14px]">
                    {t("settings.sundayLetter.emailChannel")}
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushEnabled}
                    onChange={handlePushChange}
                    disabled={saving}
                    className="w-4 h-4 accent-[#111] rounded"
                  />
                  <span className="font-barlow text-[14px]">
                    {t("settings.sundayLetter.pushChannel")}
                  </span>
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
};

export default SundayLetterCard;
