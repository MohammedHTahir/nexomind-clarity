/**
 * IntegrationsCard for Settings page.
 * Lists connected wearable/calendar providers with Connect/Disconnect.
 * Gated by useFeatureFlag('wearable_integrations') and tier >= premium.
 */

import { useEffect, useState } from "react";
import { Link2, Unlink, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import GlassCard from "@/components/app/GlassCard";
import { useSubscription } from "@/hooks/useSubscription";
import { useFeatureFlag } from "@/lib/feature-flags";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import {
  type IntegrationProvider,
  type Integration,
  PROVIDER_INFO,
  fetchIntegrations,
  disconnectIntegration,
  updateCalendarMaskTitles,
  getAuthUrl,
} from "@/lib/integrations";

interface IntegrationsCardProps {
  delay?: number;
}

const PROVIDERS: IntegrationProvider[] = [
  "oura",
  "google_fit",
  "google_calendar",
  "apple_health",
  "apple_calendar",
];

const IntegrationsCard = ({ delay = 0 }: IntegrationsCardProps) => {
  const { isPremium } = useSubscription();
  const wearableFlag = useFeatureFlag("wearable_integrations");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    if (!wearableFlag || !isPremium) return;
    loadIntegrations();
  }, [wearableFlag, isPremium]);

  const loadIntegrations = async () => {
    try {
      const data = await fetchIntegrations();
      setIntegrations(data);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  if (!wearableFlag) return null;

  // Locked state: not premium
  if (!isPremium) {
    return (
      <GlassCard className="p-7 mb-4" delay={delay}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#111]/5 flex items-center justify-center shrink-0">
            <Link2 className="w-4 h-4 text-[#111]/40" />
          </div>
          <div className="flex-1">
            <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
              ( {t("integrations.title")} )
            </p>
            <h2 className="font-instrument text-[24px] mb-2">{t("integrations.lockedTitle")}</h2>
            <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-4">
              {t("integrations.lockedDescription")}
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 bg-[#111] text-white rounded-full px-5 py-2.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors"
            >
              {t("general.upgrade")}
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </GlassCard>
    );
  }

  const getConnected = (provider: IntegrationProvider) =>
    integrations.find((i) => i.provider === provider);

  const handleConnect = (provider: IntegrationProvider) => {
    const url = getAuthUrl(provider);
    if (url) {
      window.location.href = url;
    }
  };

  const handleDisconnect = async (provider: IntegrationProvider) => {
    setDisconnecting(provider);
    try {
      await disconnectIntegration(provider);
      setIntegrations((prev) => prev.filter((i) => i.provider !== provider));
      toast.success(t("integrations.disconnected"));
    } catch {
      toast.error(t("integrations.disconnectError"));
    } finally {
      setDisconnecting(null);
    }
  };

  const handleToggleMask = async (provider: IntegrationProvider, currentValue: boolean) => {
    const newValue = !currentValue;
    try {
      await updateCalendarMaskTitles(provider, newValue);
      setIntegrations((prev) =>
        prev.map((i) =>
          i.provider === provider ? { ...i, calendar_mask_titles: newValue } : i
        )
      );
      toast.success(t("integrations.maskUpdated"));
    } catch {
      toast.error(t("integrations.maskError"));
    }
  };

  return (
    <GlassCard className="p-7 mb-4" delay={delay}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#111]/5 flex items-center justify-center shrink-0">
          <Link2 className="w-4 h-4 text-[#111]/60" />
        </div>
        <div className="flex-1">
          <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
            ( {t("integrations.title")} )
          </p>
          <h2 className="font-instrument text-[24px] mb-2">{t("integrations.heading")}</h2>
          <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-5">
            {t("integrations.description")}
          </p>

          {loading ? (
            <p className="font-barlow text-[13px] text-[#111]/40 animate-pulse">
              {t("general.loading")}
            </p>
          ) : (
            <div className="space-y-3">
              {PROVIDERS.map((provider) => {
                const info = PROVIDER_INFO[provider];
                const connected = getConnected(provider);
                const isCalendar = provider === "google_calendar" || provider === "apple_calendar";

                return (
                  <div
                    key={provider}
                    className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/60 border border-black/5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-barlow text-[14px] font-medium text-[#111]/85">
                        {info.name}
                        {info.comingSoon && (
                          <span className="ml-2 text-[11px] text-[#111]/40 font-normal">
                            {t("integrations.comingSoon")}
                          </span>
                        )}
                      </p>
                      <p className="font-barlow text-[12px] text-[#111]/50">
                        {info.description}
                      </p>
                      {connected && (
                        <p className="font-barlow text-[11px] text-[#111]/40 mt-0.5">
                          {t("integrations.connectedAt", {
                            date: new Date(connected.connected_at).toLocaleDateString(),
                          })}
                        </p>
                      )}
                      {connected && isCalendar && (
                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={connected.calendar_mask_titles}
                            onChange={() => handleToggleMask(provider, connected.calendar_mask_titles)}
                            className="w-3.5 h-3.5 rounded border-black/20"
                          />
                          <span className="font-barlow text-[12px] text-[#111]/60">
                            {t("integrations.maskTitles")}
                          </span>
                        </label>
                      )}
                    </div>
                    <div>
                      {info.comingSoon ? (
                        <span className="font-barlow text-[12px] text-[#111]/30 px-3 py-1.5">
                          {t("integrations.comingSoon")}
                        </span>
                      ) : connected ? (
                        <button
                          onClick={() => handleDisconnect(provider)}
                          disabled={disconnecting === provider}
                          className="flex items-center gap-1.5 font-barlow text-[12px] text-red-600/80 hover:text-red-700 px-3 py-1.5 rounded-full border border-red-200 hover:border-red-300 transition disabled:opacity-50"
                        >
                          <Unlink className="w-3 h-3" />
                          {disconnecting === provider
                            ? t("integrations.disconnecting")
                            : t("integrations.disconnect")}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnect(provider)}
                          className="font-barlow text-[12px] text-[#111] px-3 py-1.5 rounded-full border border-black/15 hover:bg-black/[0.04] transition"
                        >
                          {t("integrations.connect")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default IntegrationsCard;
