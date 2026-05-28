/**
 * Therapist Bridge page: generate a therapist-ready brief with entry redaction,
 * PDF download, and reminder scheduling.
 * Gated behind premium tier + therapist_bridge feature flag.
 */

import { useState, useEffect, useCallback } from "react";
import { FileText, Download, Clock, CheckSquare, Square } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import GlassCard from "@/components/app/GlassCard";
import PremiumGate from "@/components/PremiumGate";
import DisclaimerModal from "@/components/app/DisclaimerModal";
import { useFeatureFlag } from "@/lib/feature-flags";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { generateTherapistBriefPDF, type TherapistBriefData } from "@/lib/therapist-brief";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

const FEATURE_KEY = "therapist_bridge";
const DISCLAIMER_VERSION = "1.0";

const TherapistBridge = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const flagEnabled = useFeatureFlag("therapist_bridge");

  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean | null>(null);
  const [disclaimerModalOpen, setDisclaimerModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [briefData, setBriefData] = useState<TherapistBriefData | null>(null);
  const [redactedIds, setRedactedIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderHours, setReminderHours] = useState(24);

  // Check disclaimer acceptance
  const checkDisclaimer = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("disclaimer_acceptances")
      .select("id")
      .eq("user_id", user.id)
      .eq("feature_key", FEATURE_KEY)
      .eq("disclaimer_version", DISCLAIMER_VERSION)
      .maybeSingle();
    setDisclaimerAccepted(!!data);
  }, [user]);

  useEffect(() => {
    checkDisclaimer();
  }, [checkDisclaimer]);

  const handleGenerate = async () => {
    setGenerating(true);
    setBriefData(null);
    setRedactedIds(new Set());
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not signed in");

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-therapist-brief`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.code === "INSUFFICIENT_DATA") {
          toast.error(t("therapistBridge.insufficientData"));
          return;
        }
        if (err.code === "E2EE_REQUIRES_CLIENT") {
          toast.error(t("therapistBridge.e2eeBlocked"));
          return;
        }
        throw new Error(err.error || "Brief generation failed");
      }

      const data: TherapistBriefData = await res.json();
      setBriefData(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("general.error"));
    } finally {
      setGenerating(false);
    }
  };

  const toggleRedact = (journalId: string) => {
    setRedactedIds((prev) => {
      const next = new Set(prev);
      if (next.has(journalId)) {
        next.delete(journalId);
      } else {
        next.add(journalId);
      }
      return next;
    });
  };

  const handleDownload = async () => {
    if (!briefData) return;
    setDownloading(true);
    try {
      const pdfBytes = await generateTherapistBriefPDF(briefData, redactedIds);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `nexomind-therapist-brief-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(t("therapistBridge.downloaded"));
    } catch (e) {
      toast.error(t("general.error"));
    } finally {
      setDownloading(false);
    }
  };

  const handleSetReminder = () => {
    // Schedule a local notification via service worker
    if ("Notification" in window && Notification.permission === "granted") {
      const ms = reminderHours * 60 * 60 * 1000;
      setTimeout(() => {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification("NexoMind Therapist Bridge", {
              body: t("therapistBridge.reminderBody"),
              icon: "/icon-192.png",
            });
          });
        }
      }, ms);
    }
    toast.success(t("therapistBridge.reminderSet", { hours: String(reminderHours) }));
    setReminderOpen(false);
  };

  if (!flagEnabled) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto text-center py-20">
          <p className="font-barlow text-[14px] text-[#111]/50">
            {t("therapistBridge.unavailable")}
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
            ( {t("therapistBridge.kicker")} )
          </p>
          <h1 className="font-instrument text-[44px] md:text-[68px] leading-[1]">
            {t("therapistBridge.title")}
          </h1>
          <p className="font-barlow text-[16px] text-[#111]/60 mt-3">
            {t("therapistBridge.subtitle")}
          </p>
        </header>

        <PremiumGate title={t("therapistBridge.premiumTitle")} subtitle={t("therapistBridge.premiumSubtitle")}>
          {/* Disclaimer gate */}
          {disclaimerAccepted === false && (
            <GlassCard className="p-7 mb-6" delay={0.05}>
              <p className="font-barlow text-[14px] text-[#111]/70 mb-4">
                {t("therapistBridge.disclaimerNeeded")}
              </p>
              <button
                onClick={() => setDisclaimerModalOpen(true)}
                className="bg-[#111] text-white rounded-full px-5 py-2.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors"
              >
                {t("therapistBridge.reviewDisclaimer")}
              </button>
            </GlassCard>
          )}

          {/* Main UI (post-disclaimer) */}
          {disclaimerAccepted && !briefData && (
            <GlassCard className="p-7 mb-6" delay={0.05}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#111]/5 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[#111]/60" />
                </div>
                <div className="flex-1">
                  <h2 className="font-instrument text-[24px] mb-2">
                    {t("therapistBridge.generateTitle")}
                  </h2>
                  <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-4">
                    {t("therapistBridge.generateDescription")}
                  </p>
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="bg-[#111] text-white rounded-full px-5 py-2.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors disabled:opacity-50"
                  >
                    {generating ? t("general.loading") : t("therapistBridge.generateButton")}
                  </button>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Preview with redaction */}
          {briefData && (
            <>
              <GlassCard className="p-7 mb-4" delay={0.05}>
                <h2 className="font-instrument text-[24px] mb-4">
                  {t("therapistBridge.previewTitle")}
                </h2>

                {/* Themes */}
                <div className="mb-4">
                  <p className="font-barlow font-medium text-[11px] tracking-[0.15em] uppercase text-[#111]/50 mb-2">
                    {t("therapistBridge.themes")}
                  </p>
                  <ul className="space-y-1">
                    {briefData.themes.map((theme, i) => (
                      <li key={i} className="font-barlow text-[13px] text-[#111]/70">
                        &bull; {theme}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Distortions */}
                <div className="mb-4">
                  <p className="font-barlow font-medium text-[11px] tracking-[0.15em] uppercase text-[#111]/50 mb-2">
                    {t("therapistBridge.distortions")}
                  </p>
                  <ul className="space-y-1">
                    {briefData.distortions.map((d, i) => (
                      <li key={i} className="font-barlow text-[13px] text-[#111]/70">
                        &bull; {d}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Representative entries with redaction */}
                <div className="mb-4">
                  <p className="font-barlow font-medium text-[11px] tracking-[0.15em] uppercase text-[#111]/50 mb-2">
                    {t("therapistBridge.entries")}
                  </p>
                  <p className="font-barlow text-[12px] text-[#111]/50 mb-3">
                    {t("therapistBridge.redactHint")}
                  </p>
                  {briefData.representative_entries.map((entry) => (
                    <div
                      key={entry.journal_id}
                      className="flex items-start gap-3 mb-3 p-3 rounded-xl bg-[#111]/[0.02] border border-[#111]/5"
                    >
                      <button
                        onClick={() => toggleRedact(entry.journal_id)}
                        className="mt-0.5 shrink-0 text-[#111]/60 hover:text-[#111] transition-colors"
                        aria-label={
                          redactedIds.has(entry.journal_id)
                            ? t("therapistBridge.include")
                            : t("therapistBridge.redact")
                        }
                      >
                        {redactedIds.has(entry.journal_id) ? (
                          <Square className="w-4 h-4" />
                        ) : (
                          <CheckSquare className="w-4 h-4" />
                        )}
                      </button>
                      <div className={redactedIds.has(entry.journal_id) ? "opacity-40 line-through" : ""}>
                        <p className="font-barlow text-[12px] text-[#111]/50">
                          {entry.date.slice(0, 10)} &mdash; {entry.reason}
                        </p>
                        <p className="font-barlow text-[13px] text-[#111]/70">{entry.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary preview */}
                <div className="mb-4">
                  <p className="font-barlow font-medium text-[11px] tracking-[0.15em] uppercase text-[#111]/50 mb-2">
                    {t("therapistBridge.summary")}
                  </p>
                  <p className="font-barlow text-[13px] text-[#111]/70 leading-relaxed">
                    {briefData.summary.slice(0, 300)}...
                  </p>
                </div>
              </GlassCard>

              {/* Actions */}
              <GlassCard className="p-5 mb-4 flex flex-wrap gap-3 items-center" delay={0.1}>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 bg-[#111] text-white rounded-full px-5 py-2.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {downloading ? t("general.loading") : t("therapistBridge.downloadPDF")}
                </button>
                <button
                  onClick={() => setReminderOpen(!reminderOpen)}
                  className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-black/10 text-[#111] rounded-full px-5 py-2.5 font-barlow font-medium text-[13px] hover:bg-white transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  {t("therapistBridge.setReminder")}
                </button>
                <button
                  onClick={() => {
                    setBriefData(null);
                    setRedactedIds(new Set());
                  }}
                  className="font-barlow text-[13px] text-[#111]/60 hover:text-[#111] px-3 py-2 transition-colors"
                >
                  {t("therapistBridge.regenerate")}
                </button>
              </GlassCard>

              {/* Reminder scheduling */}
              {reminderOpen && (
                <GlassCard className="p-5 mb-4" delay={0.12}>
                  <p className="font-barlow text-[13px] text-[#111]/70 mb-3">
                    {t("therapistBridge.reminderDescription")}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <select
                      value={reminderHours}
                      onChange={(e) => setReminderHours(Number(e.target.value))}
                      className="rounded-lg border border-black/10 px-3 py-2 font-barlow text-[13px] bg-white"
                    >
                      <option value={1}>1 hour</option>
                      <option value={4}>4 hours</option>
                      <option value={24}>1 day</option>
                      <option value={72}>3 days</option>
                      <option value={168}>7 days</option>
                    </select>
                    <button
                      onClick={handleSetReminder}
                      className="bg-[#111] text-white rounded-full px-4 py-2 font-barlow font-medium text-[13px] hover:bg-black transition-colors"
                    >
                      {t("therapistBridge.confirmReminder")}
                    </button>
                  </div>
                </GlassCard>
              )}
            </>
          )}
        </PremiumGate>

        {/* Disclaimer Modal */}
        <DisclaimerModal
          open={disclaimerModalOpen}
          onClose={() => setDisclaimerModalOpen(false)}
          onAccepted={() => {
            setDisclaimerModalOpen(false);
            setDisclaimerAccepted(true);
          }}
          featureKey={FEATURE_KEY}
          disclaimerVersion={DISCLAIMER_VERSION}
          title={t("therapistBridge.disclaimerTitle")}
          body={t("therapistBridge.disclaimerBody")}
          acknowledgmentText={t("therapistBridge.disclaimerAck")}
        />
      </div>
    </AppShell>
  );
};

export default TherapistBridge;
