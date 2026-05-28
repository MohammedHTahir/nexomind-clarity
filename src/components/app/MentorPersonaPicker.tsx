import { motion } from "framer-motion";
import { Lock, Check, User } from "lucide-react";
import { useFeatureFlag } from "@/lib/feature-flags";
import { useMentorPersona } from "@/hooks/useMentorPersona";
import { t } from "@/lib/i18n";

const ease = [0.16, 1, 0.3, 1] as const;

const MentorPersonaPicker = () => {
  const enabled = useFeatureFlag("mentor_personas");
  const {
    activePersona,
    personas,
    setActivePersona,
    isYouMentorEligible,
    youMentorProgress,
    isSwitching,
    rateLimitMessage,
  } = useMentorPersona();

  if (!enabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="mb-5"
    >
      <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
        {t("persona.pickerTitle")}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* None option */}
        <button
          onClick={() => setActivePersona(null)}
          disabled={isSwitching}
          className={`flex-shrink-0 rounded-xl px-4 py-2.5 border transition-all text-left ${
            activePersona === null
              ? "bg-[#111] text-white border-[#111]"
              : "bg-white/60 text-[#111] border-black/5 hover:bg-white/90"
          }`}
        >
          <span className="font-barlow font-medium text-[12px]">{t("persona.none")}</span>
        </button>

        {personas.map((p) => {
          const isActive = activePersona === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setActivePersona(p.key)}
              disabled={isSwitching}
              className={`flex-shrink-0 rounded-xl px-4 py-2.5 border transition-all text-left min-w-[120px] ${
                isActive
                  ? "bg-[#111] text-white border-[#111]"
                  : "bg-white/60 text-[#111] border-black/5 hover:bg-white/90"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isActive && <Check className="w-3 h-3" strokeWidth={2.5} />}
                <span className="font-barlow font-medium text-[12px]">{p.name}</span>
              </div>
              <div className="flex gap-1 mt-1">
                {p.compatible_modes.map((m) => (
                  <span
                    key={m}
                    className={`font-barlow text-[9px] rounded-full px-1.5 py-0.5 ${
                      isActive ? "bg-white/20 text-white/80" : "bg-[#111]/5 text-[#111]/50"
                    }`}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </button>
          );
        })}

        {/* You-Mentor card */}
        <button
          onClick={() => isYouMentorEligible && setActivePersona("you_mentor")}
          disabled={isSwitching || !isYouMentorEligible}
          className={`flex-shrink-0 rounded-xl px-4 py-2.5 border transition-all text-left min-w-[140px] ${
            activePersona === "you_mentor"
              ? "bg-[#111] text-white border-[#111]"
              : isYouMentorEligible
              ? "bg-white/60 text-[#111] border-black/5 hover:bg-white/90"
              : "bg-white/40 text-[#111]/40 border-black/5 cursor-not-allowed"
          }`}
        >
          <div className="flex items-center gap-1.5">
            {!isYouMentorEligible ? (
              <Lock className="w-3 h-3" strokeWidth={2} />
            ) : activePersona === "you_mentor" ? (
              <Check className="w-3 h-3" strokeWidth={2.5} />
            ) : (
              <User className="w-3 h-3" strokeWidth={2} />
            )}
            <span className="font-barlow font-medium text-[12px]">{t("persona.youMentor")}</span>
          </div>
          {!isYouMentorEligible && (
            <div className="mt-1.5">
              <div className="h-1 w-full bg-[#111]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#111]/40 rounded-full transition-all"
                  style={{ width: `${(youMentorProgress / 30) * 100}%` }}
                />
              </div>
              <span className="font-barlow text-[9px] text-[#111]/40 mt-0.5 block">
                {t("persona.youMentorProgress", { current: youMentorProgress, total: 30 })}
              </span>
            </div>
          )}
        </button>
      </div>

      {rateLimitMessage && (
        <p className="font-barlow text-[11px] text-amber-700 mt-2">{rateLimitMessage}</p>
      )}
    </motion.div>
  );
};

export default MentorPersonaPicker;
