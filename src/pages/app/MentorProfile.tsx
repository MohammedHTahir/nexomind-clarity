import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import GlassCard from "@/components/app/GlassCard";
import { useMentorPersona } from "@/hooks/useMentorPersona";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { t } from "@/lib/i18n";

const MentorProfile = () => {
  const { user } = useAuth();
  const { youMentorProfile, isYouMentorEligible, youMentorProgress } = useMentorPersona();
  const [themes, setThemes] = useState<string[]>([]);
  const [vocab, setVocab] = useState<string[]>([]);
  const [reframeStyle, setReframeStyle] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (youMentorProfile) {
      setThemes(youMentorProfile.themes ?? []);
      setVocab(youMentorProfile.vocab ?? []);
      setReframeStyle(youMentorProfile.reframe_style ?? "");
    }
  }, [youMentorProfile]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not signed in");
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refresh-you-mentor`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Refresh failed");
      }
      const { profile } = await res.json();
      setThemes(profile.themes ?? []);
      setVocab(profile.vocab ?? []);
      setReframeStyle(profile.reframe_style ?? "");
      toast.success(t("persona.profileRefreshed"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      const updatedProfile = {
        ...(youMentorProfile ?? {}),
        themes,
        vocab,
        reframe_style: reframeStyle,
      };
      const { error } = await supabase
        .from("profiles")
        .update({ you_mentor_profile: updatedProfile } as never)

        .eq("id", user.id);
      if (error) throw error;
      toast.success(t("persona.profileSaved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-3">
            ( {t("persona.profileKicker")} )
          </p>
          <h1 className="font-instrument text-[44px] md:text-[68px] leading-[1]">
            Your <span className="italic">mentor voice.</span>
          </h1>
          <p className="font-barlow text-[16px] text-[#111]/60 mt-3">
            {t("persona.profileSubtitle")}
          </p>
        </header>

        {!isYouMentorEligible ? (
          <GlassCard className="p-7" delay={0.05}>
            <h2 className="font-instrument text-[26px] mb-3">{t("persona.youMentorLockedTitle")}</h2>
            <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-4">
              {t("persona.youMentorLockedDescription")}
            </p>
            <div className="h-2 w-full bg-[#111]/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#111]/50 rounded-full transition-all"
                style={{ width: `${(youMentorProgress / 30) * 100}%` }}
              />
            </div>
            <p className="font-barlow text-[12px] text-[#111]/50 mt-2">
              {t("persona.youMentorProgress", { current: youMentorProgress, total: 30 })}
            </p>
          </GlassCard>
        ) : (
          <>
            <GlassCard className="p-7 mb-4" delay={0.05}>
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-instrument text-[26px] mb-1">{t("persona.profileThemes")}</h2>
                  <p className="font-barlow text-[13px] text-[#111]/50">
                    {t("persona.profileThemesHint")}
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 bg-[#111] text-white rounded-full px-4 py-2 font-barlow font-medium text-[12px] hover:bg-black transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} strokeWidth={2} />
                  <span>{refreshing ? t("persona.refreshing") : t("persona.refresh")}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-barlow font-medium text-[11px] tracking-[0.15em] uppercase text-[#111]/45 mb-2 block">
                    {t("persona.themes")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {themes.map((theme, i) => (
                      <input
                        key={i}
                        value={theme}
                        onChange={(e) => {
                          const updated = [...themes];
                          updated[i] = e.target.value;
                          setThemes(updated);
                        }}
                        className="font-barlow text-[13px] bg-white/70 border border-black/10 rounded-lg px-3 py-1.5 w-40 outline-none focus:border-[#111]/30 transition-colors"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-barlow font-medium text-[11px] tracking-[0.15em] uppercase text-[#111]/45 mb-2 block">
                    {t("persona.vocab")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {vocab.map((word, i) => (
                      <input
                        key={i}
                        value={word}
                        onChange={(e) => {
                          const updated = [...vocab];
                          updated[i] = e.target.value;
                          setVocab(updated);
                        }}
                        className="font-barlow text-[13px] bg-white/70 border border-black/10 rounded-lg px-3 py-1.5 w-32 outline-none focus:border-[#111]/30 transition-colors"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-barlow font-medium text-[11px] tracking-[0.15em] uppercase text-[#111]/45 mb-2 block">
                    {t("persona.reframeStyle")}
                  </label>
                  <textarea
                    value={reframeStyle}
                    onChange={(e) => setReframeStyle(e.target.value)}
                    rows={3}
                    className="w-full font-barlow text-[14px] bg-white/70 border border-black/10 rounded-lg px-4 py-3 outline-none focus:border-[#111]/30 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/5">
                <div>
                  {youMentorProfile?.refreshed_at && (
                    <p className="font-barlow text-[11px] text-[#111]/40">
                      {t("persona.lastRefresh", {
                        date: new Date(youMentorProfile.refreshed_at).toLocaleDateString(),
                      })}
                      {youMentorProfile.source_entry_count
                        ? ` · ${t("persona.sourceEntries", { count: youMentorProfile.source_entry_count })}`
                        : ""}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#111] text-white rounded-full px-5 py-2.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors disabled:opacity-50"
                >
                  {saving ? t("general.loading") : t("general.save")}
                </button>
              </div>
            </GlassCard>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default MentorProfile;
