# Premium+ Upgrade Campaign

## What's built

1. **Stripe coupon `UPGRADE10`** — 10% off for 3 months, up to 1000 redemptions. Created idempotently by `admin-setup-promo`.
2. **Landing page** at `/upgrade` — auto-applies the code at Stripe checkout, tracks via GA4.
3. **CSV export** of non-paying users — `admin-export-non-paying` edge function.
4. **Email HTML** — `marketing/emails/upgrade-to-premium-plus.html`, paste-ready for any marketing tool.

## Setup (one-time, ~3 minutes)

### Step 1 — Create the Stripe coupon

Sign in as admin, then in your browser console (or any terminal with your access token):

```js
const { data } = await window.supabase.functions.invoke("admin-setup-promo", {
  body: { code: "UPGRADE10", percentOff: 10, environment: "live" }, // or "sandbox" to test
});
console.log(data);
```

Run it twice if you want both environments. It's idempotent — safe to re-run.

### Step 2 — Export non-paying users

Authenticated GET to:
```
https://ltwnshkruuotjdcqikgf.supabase.co/functions/v1/admin-export-non-paying
```
with header `Authorization: Bearer <your access token>`. Returns a CSV.

Easiest: run from devtools while logged in as admin:
```js
const { data: { session } } = await window.supabase.auth.getSession();
const r = await fetch("https://ltwnshkruuotjdcqikgf.supabase.co/functions/v1/admin-export-non-paying", {
  headers: { Authorization: `Bearer ${session.access_token}` }
});
const blob = await r.blob();
const a = document.createElement("a");
a.href = URL.createObjectURL(blob);
a.download = "non-paying-users.csv";
a.click();
```

### Step 3 — Send via a marketing tool (NOT Lovable Emails)

**Recommended: [Loops](https://loops.so)** (1k contacts free) or **Brevo** (300 emails/day free).

Both are connectable as Lovable connectors if you want server-side sends later — but for a one-off broadcast, just:

1. Sign up, verify a *different subdomain* (e.g. `mail.nexomind.ai` — NOT `notify.nexomind.ai`).
2. Import the CSV.
3. Paste `marketing/emails/upgrade-to-premium-plus.html` as a custom HTML campaign.
4. Set merge tags: `{{first_name}}`, `{{upgrade_url}}`, `{{unsubscribe_url}}`.
5. Set `upgrade_url` to:
   ```
   https://nexomind.ai/upgrade?code=UPGRADE10&utm_source=email&utm_medium=campaign&utm_campaign=premium_plus_upgrade_q3
   ```
6. Send.

### Step 4 — Track results

- **Marketing tool**: opens, clicks, unsubscribes (built-in).
- **GA4**: filter events `cta_click_pricing` and `subscription_started` by `campaign = premium_plus_upgrade_q3`. Lands in your existing analytics.
- **Stripe**: filter promotion code `UPGRADE10` redemptions in the dashboard for revenue attribution.

## Why not send through `notify.nexomind.ai`?

That subdomain handles your transactional mail (signup confirmations, payment receipts, the admin alerts to lloydjack276@gmail.com). Mixing a promotional blast onto it tanks the sender reputation and your real notifications start landing in spam. Keep marketing on a separate subdomain.
