import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import GlassCard from "@/components/app/GlassCard";
import { useFeatureFlag } from "@/lib/feature-flags";
import { useMentorPersona } from "@/hooks/useMentorPersona";
import { t } from "@/lib/i18n";

interface MentorPersonaCardProps {
  delay?: number;
}

const MentorPersonaCard = ({ delay = 0 }: MentorPersonaCardProps) => {
  const enabled = useFeatureFlag("mentor_personas");
  const { activePersona, personas } = useMentorPersona();

  if (!enabled) return null;

  const activeName = activePersona === "you_mentor"
    ? t("persona.youMentor")
    : personas.find((p) => p.key === activePersona)?.name ?? t("persona.none");

  return (
    <GlassCard className="p-7 mb-4" delay={delay}>
      <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
        ( {t("persona.settingsKicker")} )
      </p>
      <h2 className="font-instrument text-[26px] mb-1">{t("persona.settingsTitle")}</h2>
      <p className="font-barlow text-[14px] text-[#111]/65 leading-relaxed mb-4">
        {t("persona.settingsDescription")}
      </p>
      <div className="flex items-center justify-between">
        <span className="font-barlow text-[13px] text-[#111]/70">
          {t("persona.currentPersona")}: <strong>{activeName}</strong>
        </span>
        <Link
          to="/app/mentor-profile"
          className="flex items-center gap-1.5 font-barlow font-medium text-[13px] text-[#111]/70 hover:text-[#111] transition-colors"
        >
          {t("persona.manageProfile")}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </GlassCard>
  );
};

export default MentorPersonaCard;
