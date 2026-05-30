/// <reference lib="webworker" />
/* eslint-disable @typescript-eslint/no-explicit-any */

// Custom service worker for NexoMind PWA with real offline support.
//
// Strategy:
// - Precache the built app shell (__WB_MANIFEST) on install so the app is
//   fully usable offline once it has been opened online at least once.
// - Navigations: NetworkFirst with a short timeout, falling back to the
//   cached index.html shell (SPA — the client router takes over from there).
// - Same-origin static assets (JS/CSS/fonts/images): CacheFirst so the app
//   boots instantly and works offline.
// - Cross-origin GETs: StaleWhileRevalidate (best-effort).
// - API calls / non-GET: always go to network (no caching).

type ManifestEntry = { url: string; revision: string | null };
declare const self: ServiceWorkerGlobalScope & Record<string, unknown>;

const VERSION = "v3";
const PRECACHE = `nexomind-precache-${VERSION}`;
const RUNTIME = `nexomind-runtime-${VERSION}`;
const HTML_CACHE = `nexomind-html-${VERSION}`;

const manifest = (self.__WB_MANIFEST as ManifestEntry[]) || [];
(self as any)["__WB_MF_ENTRIES"] = manifest;

// Build a versioned URL list from the injected manifest.
const PRECACHE_URLS = Array.from(
  new Set<string>([
    "/",
    "/index.html",
    "/manifest.webmanifest",
    "/favicon.png",
    "/icon-192.png",
    "/icon-512.png",
    ...manifest.map((e) =>
      e.revision ? `${e.url}?__wb=${e.revision}` : e.url,
    ),
  ]),
);

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      // Cache one-by-one so a single 404 doesn't kill the whole install.
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const req = new Request(url, { cache: "reload" });
            const res = await fetch(req);
            if (res.ok || res.type === "opaque") {
              // Store under the un-versioned URL so future requests match.
              const storeUrl = url.split("?__wb=")[0];
              await cache.put(storeUrl, res.clone());
            }
          } catch {
            /* ignore individual asset failures */
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (k) =>
              k.startsWith("nexomind-") &&
              ![PRECACHE, RUNTIME, HTML_CACHE].includes(k),
          )
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

// ---------- Fetch routing ----------

function isSameOrigin(url: URL) {
  return url.origin === self.location.origin;
}

function isStaticAsset(url: URL) {
  return /\.(?:js|mjs|css|woff2?|ttf|otf|png|jpg|jpeg|webp|gif|svg|ico)$/i.test(
    url.pathname,
  );
}

async function networkFirstNavigation(req: Request): Promise<Response> {
  const cache = await caches.open(HTML_CACHE);
  try {
    const fresh = await fetch(req);
    if (fresh.ok) cache.put("/", fresh.clone()).catch(() => {});
    return fresh;
  } catch {
    const precache = await caches.open(PRECACHE);
    const cachedIndex =
      (await cache.match("/")) ||
      (await precache.match("/index.html")) ||
      (await precache.match("/"));
    if (cachedIndex) return cachedIndex;
    return new Response(
      "<!doctype html><meta charset=utf-8><title>Offline</title><body style='font-family:system-ui;padding:40px;text-align:center;color:#333'>You're offline and the app shell isn't cached yet. Open NexoMind once online to enable offline use.</body>",
      { headers: { "Content-Type": "text/html" }, status: 503 },
    );
  }
}

async function cacheFirst(req: Request): Promise<Response> {
  const cache = await caches.open(RUNTIME);
  const cached =
    (await caches.match(req, { ignoreSearch: false })) ||
    (await caches.match(req, { ignoreSearch: true }));
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok || res.type === "opaque") {
      cache.put(req, res.clone()).catch(() => {});
    }
    return res;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(req: Request): Promise<Response> {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res.ok || res.type === "opaque") {
        cache.put(req, res.clone()).catch(() => {});
      }
      return res;
    })
    .catch(() => undefined);
  return cached || (await network) || new Response("", { status: 504 });
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Never intercept Supabase / API / auth callbacks — they need fresh network.
  if (
    url.hostname.endsWith(".supabase.co") ||
    url.pathname.startsWith("/~oauth") ||
    url.pathname.startsWith("/auth/")
  ) {
    return;
  }

  // SPA navigations
  if (req.mode === "navigate") {
    event.respondWith(networkFirstNavigation(req));
    return;
  }

  if (isSameOrigin(url)) {
    if (isStaticAsset(url)) {
      event.respondWith(cacheFirst(req));
      return;
    }
    // Other same-origin GETs — try cache, then network.
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Cross-origin (fonts, CDN images, etc.)
  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(req));
  }
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
