/**
 * E2EE settings card for the Settings page.
 * Shows locked state for non-premium_plus, enable button, or active disclosure.
 */

import { useState } from "react";
import { Lock, ShieldCheck, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import GlassCard from "@/components/app/GlassCard";
import E2EEActivationModal from "@/components/app/E2EEActivationModal";
import { useSubscription } from "@/hooks/useSubscription";
import { useE2EE } from "@/hooks/useE2EE";
import { useFeatureFlag } from "@/lib/feature-flags";
import { t } from "@/lib/i18n";

interface E2EECardProps {
  delay?: number;
}

const E2EECard = ({ delay = 0 }: E2EECardProps) => {
  const { tier } = useSubscription();
  const { isE2EE, isLLMAvailable, enable } = useE2EE();
  const e2eeFlag = useFeatureFlag("e2ee_mode");
  const [modalOpen, setModalOpen] = useState(false);

  if (!e2eeFlag) return null;

  // Locked state: not premium_plus
  if (tier !== "premium_plus") {
    return (
      <GlassCard className="p-7 mb-4" delay={delay}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#111]/5 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-[#111]/40" />
          </div>
          <div className="flex-1">
            <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
              ( {t("e2ee.title")} )
            </p>
            <h2 className="font-instrument text-[24px] mb-2">{t("e2ee.lockedTitle")}</h2>
            <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-4">
              {t("e2ee.lockedDescription")}
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 bg-[#111] text-white rounded-full px-5 py-2.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors"
            >
              {t("e2ee.upgrade")}
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Enabled state
  if (isE2EE) {
    return (
      <GlassCard className="p-7 mb-4" delay={delay}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex-1">
            <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
              ( {t("e2ee.title")} )
            </p>
            <h2 className="font-instrument text-[24px] mb-2">{t("e2ee.enabledTitle")}</h2>
            <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-4">
              {t("e2ee.disclosure")}
            </p>
            <div className="bg-[#111]/5 rounded-xl p-4 mb-3">
              <p className="font-barlow text-[12px] text-[#111]/50 uppercase tracking-wider mb-2">
                {t("e2ee.cryptoDetails")}
              </p>
              <ul className="space-y-1.5 font-barlow text-[13px] text-[#111]/70">
                <li>AES-256-GCM encryption</li>
                <li>PBKDF2-HMAC-SHA-256 (600,000 iterations)</li>
                <li>Key derived locally, never transmitted</li>
              </ul>
            </div>
            <div className="bg-[#111]/5 rounded-xl p-4">
              <p className="font-barlow text-[12px] text-[#111]/50 uppercase tracking-wider mb-2">
                {t("e2ee.llmStatus")}
              </p>
              <p className="font-barlow text-[13px] text-[#111]/70">
                {isLLMAvailable ? t("e2ee.llmAvailable") : t("e2ee.llmUnavailable")}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Ready to enable state (premium_plus but not yet enabled)
  return (
    <>
      <GlassCard className="p-7 mb-4" delay={delay}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#111]/5 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-[#111]/60" />
          </div>
          <div className="flex-1">
            <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
              ( {t("e2ee.title")} )
            </p>
            <h2 className="font-instrument text-[24px] mb-2">{t("e2ee.readyTitle")}</h2>
            <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-4">
              {t("e2ee.readyDescription")}
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-[#111] text-white rounded-full px-5 py-2.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors"
            >
              {t("e2ee.enableButton")}
            </button>
          </div>
        </div>
      </GlassCard>
      <E2EEActivationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onActivate={enable}
      />
    </>
  );
};

export default E2EECard;
