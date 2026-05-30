import { useEffect, useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import {
  flushQueue,
  getPendingCount,
  isOnline as isOnlineNow,
  subscribeOfflineState,
} from "@/lib/offline";

/**
 * Compact pill shown in-app when the user is offline or has pending entries
 * waiting to sync. Stays out of the way when everything is up to date and online.
 */
const OfflineIndicator = () => {
  const [online, setOnline] = useState(isOnlineNow());
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      if (!mounted) return;
      setOnline(isOnlineNow());
      setPending(await getPendingCount());
    };
    refresh();
    const unsub = subscribeOfflineState(refresh);
    const onOnline = () => refresh();
    const onOffline = () => refresh();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      mounted = false;
      unsub();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (online && pending === 0) return null;

  const onSync = async () => {
    if (!online || syncing) return;
    setSyncing(true);
    try {
      await flushQueue();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center justify-center pt-3">
      <button
        type="button"
        onClick={onSync}
        disabled={!online || syncing}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition hover:text-foreground disabled:cursor-default disabled:hover:text-muted-foreground"
        aria-live="polite"
      >
        {online ? (
          <RefreshCw
            className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`}
            aria-hidden
          />
        ) : (
          <CloudOff className="h-3.5 w-3.5" aria-hidden />
        )}
        <span>
          {online
            ? pending === 1
              ? "1 entry waiting to sync"
              : `${pending} entries waiting to sync`
            : pending > 0
              ? `Offline — ${pending} saved locally`
              : "Offline — your entries will save locally"}
        </span>
      </button>
    </div>
  );
};

export default OfflineIndicator;
