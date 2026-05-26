import { useState } from "react";
import { toast } from "sonner";
import GlassCard from "@/components/app/GlassCard";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const NotificationsCard = ({ delay = 0.1 }: { delay?: number }) => {
  const {
    supported,
    permission,
    subscribed,
    loading,
    needsInstallOnIOS,
    subscribe,
    unsubscribe,
  } = usePushNotifications();
  const [busy, setBusy] = useState(false);

  const handleToggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (subscribed) {
        await unsubscribe();
        toast.success("Push notifications turned off");
      } else {
        await subscribe();
        toast.success("Notifications enabled. You're all set.");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not change notifications";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const renderState = () => {
    if (!supported) {
      return "Your browser doesn't support push notifications.";
    }
    if (needsInstallOnIOS) {
      return "On iPhone, install NexoMind to your home screen first (Safari → Share → Add to Home Screen). Then come back here to enable notifications.";
    }
    if (permission === "denied") {
      return "Notifications are blocked in your browser settings. Enable them for this site, then come back to turn them on here.";
    }
    if (loading) return "Checking…";
    return subscribed
      ? "You'll get gentle reminders to reflect."
      : "Get a quiet nudge when patterns show up in your reflections.";
  };

  const disabled =
    !supported || needsInstallOnIOS || permission === "denied" || loading || busy;

  return (
    <GlassCard className="p-7 mb-4" delay={delay}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
            ( Notifications )
          </p>
          <h2 className="font-instrument text-[26px] mb-1">Push notifications</h2>
          <p className="font-barlow text-[14px] text-[#111]/65 leading-relaxed">
            {renderState()}
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={disabled}
          className={`rounded-full px-5 py-2.5 font-barlow font-medium text-[13px] transition-colors disabled:opacity-50 ${
            subscribed
              ? "bg-white/70 border border-black/10 text-[#111] hover:bg-white"
              : "bg-[#111] text-white hover:bg-black"
          }`}
        >
          {busy ? "…" : subscribed ? "Turn off" : "Enable"}
        </button>
      </div>
    </GlassCard>
  );
};

export default NotificationsCard;
