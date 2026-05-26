# PWA + Mobile Welcome + Push Notifications

## What you'll get

1. **Installable PWA** — users can add NexoMind to home screen on iPhone/Android. Works offline-friendly (network-first for HTML, so no stale-content traps).
2. **Mobile-app feel** — when launched as installed PWA (not in browser), users land on a dedicated **Welcome screen** with "Sign in" / "Create account" buttons instead of the marketing landing page. Already-signed-in users go straight to `/app`.
3. **Install button** — a floating "Install app" button on the website that triggers the browser install prompt (Android/desktop Chrome). iOS gets a small instruction sheet ("Tap Share → Add to Home Screen") since iOS Safari has no programmatic install.
4. **Push notifications** — opt-in toggle inside Settings. Subscribes the device, stores the subscription in the database, and exposes a send-push edge function you can call from anywhere (e.g. pattern interrupts, daily reminders).

## How it works (technical)

### PWA shell
- Install `vite-plugin-pwa` configured with `injectManifest` so we ship a **custom service worker** at `src/sw.ts` that includes both Workbox caching and `push` / `notificationclick` handlers.
- `devOptions.enabled: false` and registration guarded against iframes + `lovableproject.com` hosts (per Lovable PWA rules — service workers in the editor preview cause stale content).
- `navigateFallbackDenylist` excludes `/~oauth`. HTML uses `NetworkFirst`.
- Add `manifest.webmanifest` with `display: "standalone"`, `start_url: "/?source=pwa"`, theme color `#1a1a2a`, background `#F3F4ED`, icons (192, 512, maskable 512). Icons generated fresh from the NexoMind mark.
- iOS meta tags in `index.html` (`apple-mobile-web-app-capable`, status-bar style, apple-touch-icon).

### Standalone detection & routing
- New `useIsStandalone()` hook: checks `matchMedia('(display-mode: standalone)')` + iOS `navigator.standalone`.
- `Index.tsx` (the `/` route): if standalone → `<Navigate to="/welcome" />` for guests, `<Navigate to="/app" />` for signed-in. Browser users keep seeing the marketing page.
- New `/welcome` route + `pages/MobileWelcome.tsx` — full-bleed page with NexoMind wordmark, one-line tagline, "Create account" (primary) and "Sign in" buttons. Auth pages get a small "← Back" that returns to `/welcome` when launched from standalone.

### Install button
- `components/InstallPWA.tsx` listens for `beforeinstallprompt`, stores the event, exposes a button.
- Detects iOS Safari → shows a `Sheet` with "Tap **Share** then **Add to Home Screen**" plus a small SVG hint.
- Auto-hides when already installed (`display-mode: standalone` or `appinstalled` event fired).
- Placed in the Hero section and Navbar (icon-only on mobile).

### Push notifications
- **DB**: `push_subscriptions` table — `user_id`, `endpoint` (unique), `p256dh`, `auth`, `user_agent`. RLS so users only see/manage their own.
- **Secrets**: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mailto). I'll generate the VAPID keypair and store them automatically — no action from you.
- **Client**: `VITE_VAPID_PUBLIC_KEY` env (publishable) for subscription. `usePushNotifications()` hook handles permission → `serviceWorker.pushManager.subscribe` → upsert into DB.
- **UI**: new "Notifications" card in `/app/settings` with an enable/disable toggle. Disabled / unsupported state messaged clearly (iOS requires iOS 16.4+ AND installed-to-home-screen).
- **Service worker**: handles `push` events (renders title/body/icon/url) and `notificationclick` (focuses or opens the URL).
- **Edge function** `send-push-notification`: takes `{ user_id, title, body, url? }`, fetches that user's subscriptions, sends via `web-push` (npm specifier in Deno), prunes dead `410/404` endpoints.

## Files to create
- `src/sw.ts` (custom service worker)
- `src/hooks/useIsStandalone.ts`
- `src/hooks/usePushNotifications.ts`
- `src/pages/MobileWelcome.tsx`
- `src/components/InstallPWA.tsx`
- `src/components/app/NotificationsCard.tsx`
- `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png` (generated)
- `supabase/functions/send-push-notification/index.ts`
- DB migration: `push_subscriptions` table + RLS

## Files to edit
- `vite.config.ts` — add VitePWA plugin
- `index.html` — apple PWA meta tags
- `src/main.tsx` — guarded SW registration
- `src/App.tsx` — add `/welcome` route, hand `/` over to a wrapper that checks standalone
- `src/pages/app/Settings.tsx` — mount the notifications card
- `src/components/Hero.tsx` + `src/components/Navbar.tsx` — install button

## Things to know
- **Preview limitation**: the install prompt and push notifications **will not work inside the Lovable editor preview** — only on the published site (`nexomind.ai`). I'll guard the SW registration so the preview stays clean.
- **iOS push**: only works on iOS 16.4+ and only after the user installs the PWA to home screen. The Notifications card detects this and shows the right message.
- I'll generate VAPID keys and add them as secrets automatically; you don't need to provide anything.

## After the build
- Publish, then test on your phone: visit `nexomind.ai` → tap "Install app" (Android) or Share → Add to Home Screen (iOS). Open from home screen → you'll see the Welcome screen.
- To send a push later, call the `send-push-notification` function with a `user_id` and message.

Shall I build it?
