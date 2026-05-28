/**
 * E2EE status badge for the Journal header.
 * Shows a lock icon with "Encrypted" text when E2EE is active.
 */

import { Lock } from "lucide-react";
import { t } from "@/lib/i18n";

const E2EEStatusBadge = () => {
  return (
    <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
      <Lock className="w-3 h-3 text-emerald-700" />
      <span className="font-barlow text-[11px] font-medium text-emerald-700 uppercase tracking-wider">
        {t("e2ee.badge")}
      </span>
    </div>
  );
};

export default E2EEStatusBadge;
