import { AlertTriangle } from "lucide-react";
import { useMentorPersona } from "@/hooks/useMentorPersona";
import { t } from "@/lib/i18n";

interface ModeConflictNoticeProps {
  reflectionMode?: string | null;
}

/**
 * Shows a one-line alert when the active persona's compatible_modes
 * doesn't include the current reflection_mode.
 */
const ModeConflictNotice = ({ reflectionMode }: ModeConflictNoticeProps) => {
  const { activePersona, personas } = useMentorPersona();

  if (!activePersona || !reflectionMode) return null;

  // you_mentor is compatible with all modes
  if (activePersona === "you_mentor") return null;

  const persona = personas.find((p) => p.key === activePersona);
  if (!persona) return null;

  const isCompatible = persona.compatible_modes.includes(reflectionMode);
  if (isCompatible) return null;

  return (
    <div className="flex items-center gap-2 bg-orange-50/80 border border-orange-200/60 rounded-xl px-4 py-2.5 mb-4">
      <AlertTriangle className="w-3.5 h-3.5 text-orange-600/70 flex-shrink-0" strokeWidth={2} />
      <p className="font-barlow text-[12px] text-orange-900/80">
        {t("persona.modeConflict")}
      </p>
    </div>
  );
};

export default ModeConflictNotice;
