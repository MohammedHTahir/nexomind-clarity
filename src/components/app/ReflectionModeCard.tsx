import GlassCard from "@/components/app/GlassCard";
import { useReflectionMode, type ReflectionMode } from "@/hooks/useReflectionMode";
import { FeatureGate } from "@/lib/feature-flags";
import { t } from "@/lib/i18n";

const options: { value: ReflectionMode; labelKey: string; descKey: string }[] = [
  {
    value: "companion",
    labelKey: "settings.reflectionMode.companion",
    descKey: "settings.reflectionMode.companion.description",
  },
  {
    value: "challenger",
    labelKey: "settings.reflectionMode.challenger",
    descKey: "settings.reflectionMode.challenger.description",
  },
];

function ReflectionModeCardInner({ delay = 0.06 }: { delay?: number }) {
  const { mode, setMode, isLoading } = useReflectionMode();

  return (
    <GlassCard className="p-7 mb-4" delay={delay}>
      <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
        ( {t("settings.reflectionMode")} )
      </p>
      <h2 className="font-instrument text-[24px] mb-1">{t("settings.reflectionMode")}</h2>
      <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-5">
        {t("settings.reflectionMode.description")}
      </p>
      <div className="space-y-3">
        {options.map((opt) => {
          const selected = mode === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${
                selected
                  ? "bg-[#111]/5 border-[#111]/20"
                  : "bg-white/50 border-black/5 hover:bg-white/80"
              } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
            >
              <input
                type="radio"
                name="reflection-mode"
                value={opt.value}
                checked={selected}
                onChange={() => setMode(opt.value)}
                className="mt-1 accent-[#111]"
              />
              <div>
                <span className="font-barlow font-medium text-[14px]">{t(opt.labelKey)}</span>
                <p className="font-barlow text-[12px] text-[#111]/55 mt-0.5">
                  {t(opt.descKey)}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </GlassCard>
  );
}

const ReflectionModeCard = ({ delay }: { delay?: number }) => (
  <FeatureGate flag="reflection_mode">
    <ReflectionModeCardInner delay={delay} />
  </FeatureGate>
);

export default ReflectionModeCard;
