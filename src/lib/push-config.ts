// VAPID public key — safe to ship in client code.
// Paired with VAPID_PRIVATE_KEY stored as a backend secret.
export const VAPID_PUBLIC_KEY =
  "BP_rHfzOTJI2WXwGhHnhYz-NslV7DwDQdCx26e92pc99qGpH8U1KbR-Gy1nracbVNRvnO6dshEK_0aIOG-og9T4";

/** Convert a URL-safe base64 VAPID key into the Uint8Array PushManager.subscribe expects. */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}
