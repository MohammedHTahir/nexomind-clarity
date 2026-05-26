import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/push-config";

type PushState = {
  supported: boolean;
  permission: NotificationPermission | "unknown";
  subscribed: boolean;
  loading: boolean;
  /** iOS-specific: PWA must be installed to home screen for push to work (iOS 16.4+). */
  needsInstallOnIOS: boolean;
};

const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !(window as unknown as { MSStream?: unknown }).MSStream;

const isStandalone = () =>
  (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
  window.matchMedia?.("(display-mode: standalone)").matches === true;

export function usePushNotifications() {
  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  const [state, setState] = useState<PushState>({
    supported,
    permission: supported ? Notification.permission : "unknown",
    subscribed: false,
    loading: true,
    needsInstallOnIOS: supported && isIOS() && !isStandalone(),
  });

  // Detect current subscription state
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supported) {
        setState((s) => ({ ...s, loading: false }));
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (cancelled) return;
        setState((s) => ({
          ...s,
          subscribed: !!sub,
          permission: Notification.permission,
          loading: false,
        }));
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported) throw new Error("Push not supported on this device.");
    setState((s) => ({ ...s, loading: true }));
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState((s) => ({ ...s, permission, loading: false }));
        throw new Error("Permission denied");
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const json = sub.toJSON();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not signed in");

      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: userId,
          endpoint: sub.endpoint,
          p256dh: json.keys?.p256dh ?? "",
          auth: json.keys?.auth ?? "",
          user_agent: navigator.userAgent,
        },
        { onConflict: "endpoint" },
      );
      if (error) throw error;

      setState((s) => ({ ...s, subscribed: true, permission, loading: false }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      throw e;
    }
  }, [supported]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    setState((s) => ({ ...s, loading: true }));
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint);
        await sub.unsubscribe();
      }
      setState((s) => ({ ...s, subscribed: false, loading: false }));
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [supported]);

  return { ...state, subscribe, unsubscribe };
}
