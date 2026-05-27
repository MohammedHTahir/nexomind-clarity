/// <reference lib="webworker" />
/* eslint-disable @typescript-eslint/no-explicit-any */

// Custom service worker for NexoMind PWA.
// - Skips precaching to avoid stale-content traps (we just reference __WB_MANIFEST so
//   vite-plugin-pwa's injectManifest build succeeds).
// - Uses NetworkFirst for HTML navigations so a new deploy is always reachable.
// - Handles Web Push (push + notificationclick).

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

// Reference manifest — required by injectManifest, but we don't precache.
// Assign to a variable so the token survives minification/tree-shaking.
const _manifest = self.__WB_MANIFEST;
void _manifest;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// NetworkFirst for HTML, fallthrough for everything else.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (req.mode !== "navigate") return;

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(req);
        return fresh;
      } catch {
        const cache = await caches.open("nexomind-html");
        const cached = await cache.match("/");
        return (
          cached ||
          new Response(
            "<!doctype html><meta charset=utf-8><title>Offline</title><body style='font-family:system-ui;padding:40px;text-align:center;color:#333'>You're offline. Reopen NexoMind when you're back.</body>",
            { headers: { "Content-Type": "text/html" }, status: 503 },
          )
        );
      }
    })(),
  );
});

// ---------- Web Push ----------

self.addEventListener("push", (event) => {
  let data: any = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    data = { title: "NexoMind", body: event.data?.text() ?? "" };
  }

  const title = data.title || "NexoMind";
  const options: NotificationOptions = {
    body: data.body || "",
    icon: data.icon || "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag,
    data: { url: data.url || "/app" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data as any)?.url || "/app";

  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of all) {
        const c = client as WindowClient;
        if ("focus" in c) {
          try {
            await c.navigate(url);
          } catch {
            /* cross-origin / not allowed */
          }
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    })(),
  );
});

export {};
