import { useState } from "react";
import { X } from "lucide-react";
import { t } from "@/lib/i18n";

const STORAGE_PREFIX = "nexomind:challenger-dismissed:";

interface ChallengerNoticeProps {
  analysisId: string;
  reflectionMode?: string | null;
}

/**
 * Dismissible alert shown on analysis results when reflection_mode is 'challenger'.
 * Dismissal is stored in sessionStorage keyed by analysis ID.
 */
const ChallengerNotice = ({ analysisId, reflectionMode }: ChallengerNoticeProps) => {
  const storageKey = `${STORAGE_PREFIX}${analysisId}`;
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  });

  if (reflectionMode !== "challenger" || dismissed) return null;

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {}
    setDismissed(true);
  };

  return (
    <div className="flex items-center justify-between gap-3 bg-amber-50/80 border border-amber-200/60 rounded-xl px-4 py-3 mb-4">
      <p className="font-barlow text-[13px] text-amber-900/80">
        {t("challenger.notice")}
      </p>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-amber-700/60 hover:text-amber-900 transition-colors"
        aria-label={t("challenger.notice.dismiss")}
      >
        <X className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
    </div>
  );
};

export default ChallengerNotice;
