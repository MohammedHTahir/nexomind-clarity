/**
 * Crisis Detection settings card with 3-step consent flow.
 * Shows trusted contact form when enabled. Locale gate.
 * Gated behind premium + crisis_detection feature flag.
 */

import { useState, useEffect, useCallback } from "react";
import { ShieldAlert, AlertTriangle, Phone, Check } from "lucide-react";
import GlassCard from "@/components/app/GlassCard";
import DisclaimerModal from "@/components/app/DisclaimerModal";
import { useFeatureFlag } from "@/lib/feature-flags";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

const FEATURE_KEY = "crisis_detection";
const DISCLAIMER_VERSION = "1.0";

interface TrustedContact {
  name: string;
  phone: string;
}

interface CrisisDetectionCardProps {
  delay?: number;
}

const CrisisDetectionCard = ({ delay = 0 }: CrisisDetectionCardProps) => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const flagEnabled = useFeatureFlag("crisis_detection");

  const [step, setStep] = useState<"locked" | "disclaimer" | "explanation" | "opt_in" | "enabled">("locked");
  const [disclaimerModalOpen, setDisclaimerModalOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [localeApproved, setLocaleApproved] = useState(false);
  const [trustedContact, setTrustedContact] = useState<TrustedContact>({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("crisis_detection_enabled, crisis_detection_locale_approved, trusted_contact")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      setEnabled(data.crisis_detection_enabled ?? false);
      setLocaleApproved(data.crisis_detection_locale_approved ?? false);
      if (data.trusted_contact) {
        setTrustedContact(data.trusted_contact as unknown as TrustedContact);
      }
      if (data.crisis_detection_enabled) {
        setStep("enabled");
      }
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleDisclaimerAccepted = () => {
    setDisclaimerModalOpen(false);
    setStep("explanation");
  };

  const handleExplanationContinue = () => {
    setStep("opt_in");
  };

  const handleOptIn = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ crisis_detection_enabled: true })
        .eq("id", user.id);
      if (error) throw error;
      setEnabled(true);
      setStep("enabled");
      toast.success(t("crisisDetection.enabled"));
    } catch {
      toast.error(t("general.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ crisis_detection_enabled: false })
        .eq("id", user.id);
      if (error) throw error;
      setEnabled(false);
      setStep("locked");
      toast.success(t("crisisDetection.disabled"));
    } catch {
      toast.error(t("general.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContact = async () => {
    if (!user) return;
    if (trustedContact.name.trim().length === 0) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ trusted_contact: trustedContact as unknown as never })

        .eq("id", user.id);
      if (error) throw error;
      toast.success(t("crisisDetection.contactSaved"));
    } catch {
      toast.error(t("general.error"));
    } finally {
      setSaving(false);
    }
  };

  if (!flagEnabled || !isPremium) return null;

  // Locale gate: disabled when locale not approved
  if (!localeApproved) {
    return (
      <GlassCard className="p-7 mb-4" delay={delay}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#111]/5 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4 text-[#111]/40" />
          </div>
          <div className="flex-1">
            <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
              ( {t("crisisDetection.title")} )
            </p>
            <h2 className="font-instrument text-[24px] mb-2">{t("crisisDetection.localeTitle")}</h2>
            <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed">
              {t("crisisDetection.localeUnavailable")}
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Enabled state
  if (step === "enabled") {
    return (
      <GlassCard className="p-7 mb-4" delay={delay}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex-1">
            <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
              ( {t("crisisDetection.title")} )
            </p>
            <h2 className="font-instrument text-[24px] mb-2">{t("crisisDetection.activeTitle")}</h2>
            <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-4">
              {t("crisisDetection.activeDescription")}
            </p>

            {/* Trusted contact form */}
            <div className="bg-[#111]/[0.03] rounded-xl p-4 mb-4">
              <p className="font-barlow font-medium text-[11px] tracking-[0.15em] uppercase text-[#111]/50 mb-3">
                {t("crisisDetection.trustedContact")}
              </p>
              <div className="space-y-2 mb-3">
                <input
                  type="text"
                  placeholder={t("crisisDetection.contactName")}
                  value={trustedContact.name}
                  onChange={(e) => setTrustedContact((c) => ({ ...c, name: e.target.value }))}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 font-barlow text-[13px] bg-white"
                />
                <input
                  type="tel"
                  placeholder={t("crisisDetection.contactPhone")}
                  value={trustedContact.phone}
                  onChange={(e) => setTrustedContact((c) => ({ ...c, phone: e.target.value }))}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 font-barlow text-[13px] bg-white"
                />
              </div>
              <button
                onClick={handleSaveContact}
                disabled={saving || !trustedContact.name.trim()}
                className="bg-[#111] text-white rounded-full px-4 py-2 font-barlow font-medium text-[12px] hover:bg-black transition-colors disabled:opacity-40"
              >
                {saving ? t("general.loading") : t("general.save")}
              </button>
            </div>

            <button
              onClick={handleDisable}
              disabled={saving}
              className="font-barlow text-[13px] text-[#111]/50 hover:text-[#111] transition-colors"
            >
              {t("crisisDetection.disable")}
            </button>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Step: explanation
  if (step === "explanation") {
    return (
      <GlassCard className="p-7 mb-4" delay={delay}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
          </div>
          <div className="flex-1">
            <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
              ( {t("crisisDetection.title")} )
            </p>
            <h2 className="font-instrument text-[24px] mb-2">{t("crisisDetection.explanationTitle")}</h2>
            <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-4 whitespace-pre-line">
              {t("crisisDetection.explanationBody")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleExplanationContinue}
                className="bg-[#111] text-white rounded-full px-5 py-2.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors"
              >
                {t("crisisDetection.continue")}
              </button>
              <button
                onClick={() => setStep("locked")}
                className="font-barlow text-[13px] text-[#111]/60 hover:text-[#111] px-3 py-2 transition-colors"
              >
                {t("general.cancel")}
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Step: opt-in confirmation
  if (step === "opt_in") {
    return (
      <GlassCard className="p-7 mb-4" delay={delay}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#111]/5 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-[#111]/60" />
          </div>
          <div className="flex-1">
            <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
              ( {t("crisisDetection.title")} )
            </p>
            <h2 className="font-instrument text-[24px] mb-2">{t("crisisDetection.optInTitle")}</h2>
            <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-4">
              {t("crisisDetection.optInBody")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleOptIn}
                disabled={saving}
                className="bg-[#111] text-white rounded-full px-5 py-2.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors disabled:opacity-50"
              >
                {saving ? t("general.loading") : t("crisisDetection.activate")}
              </button>
              <button
                onClick={() => setStep("locked")}
                className="font-barlow text-[13px] text-[#111]/60 hover:text-[#111] px-3 py-2 transition-colors"
              >
                {t("general.cancel")}
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Default: locked/initial state - begin consent flow
  return (
    <>
      <GlassCard className="p-7 mb-4" delay={delay}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#111]/5 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4 text-[#111]/60" />
          </div>
          <div className="flex-1">
            <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
              ( {t("crisisDetection.title")} )
            </p>
            <h2 className="font-instrument text-[24px] mb-2">{t("crisisDetection.setupTitle")}</h2>
            <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-4">
              {t("crisisDetection.setupDescription")}
            </p>
            <button
              onClick={() => setDisclaimerModalOpen(true)}
              className="bg-[#111] text-white rounded-full px-5 py-2.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors"
            >
              {t("crisisDetection.beginSetup")}
            </button>
          </div>
        </div>
      </GlassCard>
      <DisclaimerModal
        open={disclaimerModalOpen}
        onClose={() => setDisclaimerModalOpen(false)}
        onAccepted={handleDisclaimerAccepted}
        featureKey={FEATURE_KEY}
        disclaimerVersion={DISCLAIMER_VERSION}
        title={t("crisisDetection.disclaimerTitle")}
        body={t("crisisDetection.disclaimerBody")}
        acknowledgmentText={t("crisisDetection.disclaimerAck")}
      />
    </>
  );
};

export default CrisisDetectionCard;
