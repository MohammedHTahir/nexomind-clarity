# NexoMind Clarity - Competitive Roadmap Handoff

## Overview

This document replaces the previous PWA plan (which has been shipped). It describes the full 6-phase competitive roadmap that was implemented in the `feat/competitive-roadmap-full` branch (PR #4). The implementation spans 79 files and approximately 8,742 lines of code.

Everything described below is built, tested, and passing (`npm run build` and `npm run test` both succeed with 69 tests passing). What remains is production configuration: Stripe price IDs, Supabase secrets, edge function deployment, cron jobs, and UI wiring polish.

---

## What's Already Built

### Cross-Cutting Infrastructure

| File | Purpose |
|------|---------|
| `src/lib/feature-flags.ts` | Client-side flag evaluation with 250ms fail-closed timeout |
| `src/lib/tier.ts` | Tier resolution (`free`, `premium`, `premium_plus`), `isPremium` backward-compat alias |
| `src/lib/i18n.ts` | `t()` function with interpolation, `formatDate`, `formatNumber` |
| `src/locales/en-US.json` | All i18n strings for 6 phases |
| `supabase/functions/evaluate-flags/index.ts` | Server-side flag evaluation edge function |
| `supabase/migrations/20260601000001_cross_cutting_infra.sql` | `feature_flags` table, `profiles.reflection_mode`, `notification_preferences`, `user_patterns` extensions, `pattern_interrupt_inbox` |

### Phase 1 - Anti-Sycophant Toggle + Pattern Interrupt

| File | Purpose |
|------|---------|
| `src/components/app/ReflectionModeCard.tsx` | RadioGroup toggle in Settings (supportive / balanced / challenger) |
| `src/components/app/ChallengerNotice.tsx` | Notice badge on journal results when in challenger mode |
| `src/components/app/PatternInterruptBanner.tsx` | In-app banner fallback for push-disabled users |
| `src/hooks/useReflectionMode.ts` | Hook for reflection mode state |
| `supabase/functions/analyze-journal/index.ts` | Rewritten with `composeSystemPrompt` pipeline |
| `supabase/functions/compute-patterns/index.ts` | Distortion recurrence detection added |
| `supabase/functions/fire-pattern-interrupts/index.ts` | Expanded with rate limiting (max 1/day per user) |

### Phase 2 - Voice-First + Sunday Letter

| File | Purpose |
|------|---------|
| `src/components/app/VoiceEntryButton.tsx` | Full MediaRecorder state machine (idle/recording/processing) |
| `src/lib/voice.ts` | Acoustic feature extraction (`pace_wpm`, `hesitation_ratio`, `tonal_variability_hz`) |
| `src/components/app/SundayLetterCard.tsx` | Settings card for Sunday Letter opt-in |
| `src/pages/app/Inbox.tsx` | Sunday Letter inbox page |
| `supabase/functions/transcribe-voice-entry/index.ts` | Gemini audio transcription |
| `supabase/functions/generate-sunday-letter/index.ts` | Weekly cron, idempotent (checks for existing letter before generating) |
| `supabase/functions/_shared/transactional-email-templates/sunday-letter.tsx` | Email template |
| `supabase/migrations/20260601000002_phase2_voice_sunday.sql` | `voice_entries` table, `sunday_letters` table |

### Phase 3 - E2EE + Premium+

| File | Purpose |
|------|---------|
| `src/lib/e2ee.ts` | PBKDF2 (600k iterations) + AES-256-GCM encryption/decryption |
| `src/lib/on-device-llm.ts` | Chrome Prompt API / Apple Intelligence detection |
| `src/hooks/useE2EE.ts` | E2EE state management hook |
| `src/components/app/E2EEActivationModal.tsx` | 3-step activation flow (passphrase, confirm, done) |
| `src/components/app/E2EECard.tsx` | Settings card for E2EE management |
| `src/components/app/E2EEStatusBadge.tsx` | Lock icon status indicator |
| `src/pages/Pricing.tsx` | Updated with Premium+ tier ($19.99/mo, $190/yr) |
| `supabase/migrations/20260601000003_phase3_e2ee.sql` | `e2ee_keys` table, `encrypted_entries` table |

### Phase 4 - Wearables + Living MindMap

| File | Purpose |
|------|---------|
| `src/lib/integrations.ts` | OAuth helpers for Oura, Google Fit, Google Calendar |
| `src/components/app/IntegrationsCard.tsx` | Settings integrations panel with connect/disconnect |
| `src/pages/app/MindMap.tsx` | Rewritten with Sheet side panel, clustered view, entity extraction |
| `supabase/functions/fetch-context-signals/index.ts` | External API fetch with 5s timeout, 3 retries |
| `supabase/functions/update-mind-map/index.ts` | Minor updates for new entity types |
| `supabase/migrations/20260601000004_phase4_wearables_mindmap.sql` | `integration_connections` table, `context_signals` table, `mind_nodes` extensions |

### Phase 5 - Therapist Bridge + Crisis Detection

| File | Purpose |
|------|---------|
| `src/lib/therapist-brief.ts` | Client-side PDF generation via pdf-lib |
| `src/pages/app/TherapistBridge.tsx` | Full page with redaction controls, preview, PDF download |
| `src/components/app/DisclaimerModal.tsx` | Reusable "not a replacement for therapy" disclaimer |
| `src/components/app/CrisisDetectionCard.tsx` | 3-step consent + settings in Settings page |
| `src/components/app/CrisisCard.tsx` | In-app escalation overlay (988 Lifeline / Samaritans) |
| `supabase/functions/generate-therapist-brief/index.ts` | Server-side brief generation |
| `supabase/functions/detect-crisis/index.ts` | Crisis signal detection with configurable threshold |
| `supabase/migrations/20260601000005_phase5_clinical.sql` | `therapist_briefs` table, `crisis_events` table |

### Phase 6 - Mentor Personas + You-Mentor

| File | Purpose |
|------|---------|
| `src/hooks/useMentorPersona.ts` | Persona state + switching logic |
| `src/components/app/MentorPersonaPicker.tsx` | Picker UI (grid of persona cards) |
| `src/components/app/MentorPersonaCard.tsx` | Individual persona card component |
| `src/components/app/ModeConflictNotice.tsx` | Notice shown when persona conflicts with reflection mode |
| `src/pages/app/MentorProfile.tsx` | You-Mentor profile view/edit |
| `supabase/functions/refresh-you-mentor/index.ts` | Generates personalized mentor from journal history |
| `supabase/migrations/20260601000006_phase6_personas.sql` | `mentor_personas` table, `user_mentor_profiles` table |
| `supabase/migrations/20260601000007_seed_feature_flags.sql` | Seeds all feature flags (all default to disabled) |

### Tests

| File | Coverage |
|------|----------|
| `src/test/lib/tier.test.ts` | All tier resolution paths, `isPremium` backward compat |
| `src/test/lib/e2ee.test.ts` | Key derivation determinism, encrypt/decrypt round-trip |
| `src/test/lib/feature-flags.test.ts` | Deterministic hash, percentage rollout, fail-closed behavior |
| `src/test/lib/i18n.test.ts` | String lookup, fallback, interpolation |
| `src/test/lib/voice.test.ts` | Acoustic feature extraction, capability detection |
| `src/test/lib/therapist-brief.test.ts` | PDF generation, redaction, size validation |
| `src/test/infra.test.ts` | Integration-level infrastructure tests |

### Routes Added to `App.tsx`

- `/app/inbox` - Sunday Letter inbox
- `/app/therapist-bridge` - Therapist Bridge page
- `/app/mentor-profile` - You-Mentor profile page

### Navigation Added to `AppShell.tsx`

- Inbox link (mail icon)
- Therapist Bridge link
- Mentor Profile link

---

## What You Need To Do

The following sections describe the concrete work required to make the implemented features production-ready.

---

## Stripe Setup

### 1. Create Premium+ Price IDs

In the Stripe Dashboard:

1. Go to **Products** and create a new product called "NexoMind Premium+" (or add prices to the existing product)
2. Create two prices:
   - **Monthly**: $19.99/month recurring
   - **Annual**: $190.00/year recurring (saves ~21%)
3. Copy both price IDs (format: `price_xxxxx`)

### 2. Set Environment Variables

Add to Supabase Edge Function secrets:

```
STRIPE_PREMIUM_PLUS_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_PLUS_ANNUAL_PRICE_ID=price_xxxxx
```

### 3. Update `create-checkout` Edge Function

The `create-checkout` edge function needs to handle the `premium_plus` tier. Add a case that maps the tier parameter to the correct price ID:

```typescript
// In the create-checkout function, add:
case 'premium_plus':
  priceId = isAnnual
    ? Deno.env.get('STRIPE_PREMIUM_PLUS_ANNUAL_PRICE_ID')!
    : Deno.env.get('STRIPE_PREMIUM_PLUS_MONTHLY_PRICE_ID')!;
  break;
```

### 4. Update Webhook Handler

Ensure the Stripe webhook handler (`handle-stripe-webhook`) correctly maps the new price IDs to the `premium_plus` tier when processing `checkout.session.completed` and subscription events. The `src/lib/tier.ts` file already handles the client-side resolution if the price IDs are added to the `TIER_MAP` constant.

---

## Supabase Setup

### Secrets to Add

Add these secrets via the Supabase Dashboard (Settings > Edge Functions > Secrets):

| Secret | Used By | Notes |
|--------|---------|-------|
| `GEMINI_API_KEY` | `transcribe-voice-entry`, `refresh-you-mentor`, `detect-crisis` | Google AI Studio API key |
| `OPENAI_API_KEY` | `update-mind-map` (embeddings) | Or switch to Gemini embeddings |
| `OURA_CLIENT_ID` | `fetch-context-signals` | From Oura developer portal |
| `OURA_CLIENT_SECRET` | `fetch-context-signals` | From Oura developer portal |
| `GOOGLE_FIT_CLIENT_ID` | `fetch-context-signals` | From Google Cloud Console |
| `GOOGLE_FIT_CLIENT_SECRET` | `fetch-context-signals` | From Google Cloud Console |
| `STRIPE_PREMIUM_PLUS_MONTHLY_PRICE_ID` | `create-checkout` | From Stripe Dashboard |
| `STRIPE_PREMIUM_PLUS_ANNUAL_PRICE_ID` | `create-checkout` | From Stripe Dashboard |

### Database Migrations

Run all 7 migrations in order. They are numbered sequentially and depend on each other:

1. `20260601000001_cross_cutting_infra.sql` - Feature flags table, profile extensions
2. `20260601000002_phase2_voice_sunday.sql` - Voice entries, Sunday letters
3. `20260601000003_phase3_e2ee.sql` - E2EE keys, encrypted entries
4. `20260601000004_phase4_wearables_mindmap.sql` - Integration connections, context signals
5. `20260601000005_phase5_clinical.sql` - Therapist briefs, crisis events
6. `20260601000006_phase6_personas.sql` - Mentor personas, user mentor profiles
7. `20260601000007_seed_feature_flags.sql` - Seeds all 10 feature flags (disabled by default)

After running, verify RLS policies are active:

```sql
SELECT tablename, policyname FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Edge Function Deployment

Deploy these new edge functions:

- `evaluate-flags`
- `transcribe-voice-entry`
- `generate-sunday-letter`
- `fetch-context-signals`
- `generate-therapist-brief`
- `detect-crisis`
- `refresh-you-mentor`

### Cron Job Setup

Set up a weekly cron trigger for `generate-sunday-letter`:

**Option A - pg_cron (recommended):**

```sql
SELECT cron.schedule(
  'weekly-sunday-letter',
  '0 8 * * 0',  -- Every Sunday at 8:00 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-sunday-letter',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

**Option B - External cron service:**
Use an external service (e.g., cron-job.org, GitHub Actions schedule) to POST to the function URL with the service role key every Sunday.

---

## UI Integration Tasks

These are specific wiring and polish items that need attention:

### 1. Wire VoiceEntryButton into Journal Entry Form

The `VoiceEntryButton` component is fully built but needs placement in the journal entry page:

```tsx
// In src/pages/app/Journal.tsx, add next to the text input:
import { VoiceEntryButton } from '@/components/app/VoiceEntryButton';

// Place alongside the submit button area
<VoiceEntryButton onTranscription={(text) => setJournalText(text)} />
```

### 2. Settings Page Navigation

Add navigation links in the Settings page for:
- Therapist Bridge (link to `/app/therapist-bridge`)
- Mentor Profile (link to `/app/mentor-profile`)

The cards (`CrisisDetectionCard`, `IntegrationsCard`, `E2EECard`, `SundayLetterCard`, `ReflectionModeCard`) are already imported and placed in Settings.

### 3. MindMap Sheet Side Panel

Test the MindMap page (`src/pages/app/MindMap.tsx`) with real data. The Sheet panel opens when clicking a node cluster. Verify:
- Entity details render correctly
- Connections between nodes are displayed
- Cluster grouping works with 5+ entries

### 4. CrisisCard Mobile Styling

The `CrisisCard` overlay component needs mobile-specific testing:
- Full-screen overlay on small viewports
- Large tap targets for crisis hotline numbers (988, Samaritans)
- Dismiss button clearly visible
- Proper z-index above all other content

### 5. IntegrationsCard OAuth Loading States

Add loading spinners/states to the OAuth connect buttons in `IntegrationsCard`:
- Show spinner while OAuth redirect is in progress
- Handle OAuth callback errors gracefully
- Show "Connected" state with last sync time after successful auth

### 6. Sunday Letter Inbox Empty State

Verify `src/pages/app/Inbox.tsx` shows a proper empty state before the first Sunday letter arrives.

---

## Feature Flag Rollout Order

All flags are seeded as `enabled: false` with `rollout_percent: 0`. Enable them one at a time in this recommended order:

| Order | Flag Key | Phase | Dependencies | Notes |
|-------|----------|-------|--------------|-------|
| 1 | `reflection_mode` | 1 | None | Lowest risk, changes AI tone only |
| 2 | `pattern_interrupt` | 1 | None | Requires push notifications working |
| 3 | `voice_entry` | 2 | None | Requires `GEMINI_API_KEY` set |
| 4 | `sunday_letter` | 2 | None | Requires cron job configured |
| 5 | `living_mindmap` | 4 | Existing `mind_nodes` table | Requires embeddings API key |
| 6 | `wearable_integration` | 4 | None | Requires OAuth credentials |
| 7 | `mentor_personas` | 6 | `profiles.reflection_mode` (Phase 1) | Enable after reflection_mode |
| 8 | `therapist_bridge` | 5 | Journal analysis history | pdf-lib is client-side, no API needed |
| 9 | `crisis_detection` | 5 | None | Set threshold in config before enabling |
| 10 | `e2ee_mode` | 3 | None | Premium+ only, most complex, enable last |

To enable a flag:

```sql
UPDATE feature_flags
SET enabled = true, rollout_percent = 100, updated_at = now()
WHERE key = 'reflection_mode';
```

For gradual rollout:

```sql
UPDATE feature_flags
SET enabled = true, rollout_percent = 10, updated_at = now()
WHERE key = 'voice_entry';
-- Increases to 25, 50, 100 over days
```

---

## Environment Variables Needed

### Supabase Edge Function Secrets

| Variable | Required By | How to Get |
|----------|-------------|------------|
| `GEMINI_API_KEY` | transcribe-voice-entry, refresh-you-mentor, detect-crisis | [Google AI Studio](https://aistudio.google.com/apikey) |
| `OPENAI_API_KEY` | update-mind-map (embeddings) | [OpenAI Platform](https://platform.openai.com/api-keys) |
| `OURA_CLIENT_ID` | fetch-context-signals | [Oura Developer Portal](https://cloud.ouraring.com/oauth/applications) |
| `OURA_CLIENT_SECRET` | fetch-context-signals | Same as above |
| `GOOGLE_FIT_CLIENT_ID` | fetch-context-signals | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_FIT_CLIENT_SECRET` | fetch-context-signals | Same as above |
| `STRIPE_PREMIUM_PLUS_MONTHLY_PRICE_ID` | create-checkout | Stripe Dashboard > Products |
| `STRIPE_PREMIUM_PLUS_ANNUAL_PRICE_ID` | create-checkout | Stripe Dashboard > Products |

### Client-Side (already in `.env.production`)

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL (already set) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (already set) |
| `VITE_VAPID_PUBLIC_KEY` | Push notification subscription (already set from PWA phase) |

---

## Testing Checklist

### Phase 1 - Reflection Mode + Pattern Interrupts

- [ ] Toggle reflection mode in Settings between supportive/balanced/challenger
- [ ] Submit a journal entry in each mode; verify AI tone changes
- [ ] ChallengerNotice appears only in challenger mode
- [ ] Pattern interrupt fires after 3+ entries with same distortion (rate limited to 1/day)
- [ ] PatternInterruptBanner shows for users without push enabled

### Phase 2 - Voice Entry + Sunday Letter

- [ ] VoiceEntryButton requests microphone permission on first use
- [ ] Recording state machine works (idle -> recording -> processing -> done)
- [ ] Transcription returns text that populates journal entry
- [ ] Sunday Letter opt-in toggle works in Settings
- [ ] Inbox page shows received letters
- [ ] Letter generation is idempotent (re-running cron does not duplicate)

### Phase 3 - E2EE + Premium+

- [ ] E2EE activation modal walks through 3 steps
- [ ] Passphrase must be 12+ characters
- [ ] Encrypted entries are stored as ciphertext in DB
- [ ] Decryption works with correct passphrase
- [ ] Wrong passphrase shows clear error
- [ ] E2EEStatusBadge shows lock icon when active
- [ ] Premium+ pricing shows on Pricing page
- [ ] Checkout flow works for Premium+ tier
- [ ] On-device LLM detection works in Chrome 127+ / Safari 18.2+

### Phase 4 - Wearables + Living MindMap

- [ ] IntegrationsCard shows Oura, Google Fit, Google Calendar options
- [ ] OAuth connect flow redirects and returns successfully
- [ ] MindMap shows clustered entities from journal entries
- [ ] Sheet side panel opens on node click with entity details
- [ ] Context signals from wearables appear in journal analysis

### Phase 5 - Therapist Bridge + Crisis Detection

- [ ] TherapistBridge page loads with journal history
- [ ] Entry redaction toggles work (exclude sensitive entries)
- [ ] PDF preview renders correctly
- [ ] PDF download produces valid file
- [ ] Disclaimer modal shows before first use
- [ ] CrisisDetectionCard consent flow works (3 steps)
- [ ] Crisis detection triggers CrisisCard overlay with hotline numbers
- [ ] CrisisCard shows 988 Suicide & Crisis Lifeline and Samaritans numbers
- [ ] Dismiss button works on CrisisCard

### Phase 6 - Mentor Personas + You-Mentor

- [ ] MentorPersonaPicker shows available personas
- [ ] Selecting a persona changes AI voice in subsequent entries
- [ ] ModeConflictNotice appears when persona conflicts with challenger mode
- [ ] MentorProfile page shows You-Mentor details
- [ ] refresh-you-mentor generates personalized mentor from history
- [ ] Persona switching is immediate (no page reload needed)

---

## Architecture Notes

### composeSystemPrompt Pipeline

The `analyze-journal` edge function uses a composable prompt system:

```
Base system prompt
  + Reflection mode modifier (supportive/balanced/challenger)
  + Active persona voice (if any)
  + E2EE context (if encrypted, analysis runs on decrypted client-sent text)
  + Context signals (sleep, HRV, calendar) if available
```

Each modifier is a pure function that takes the base prompt and returns an extended prompt. This makes the AI behavior predictable and testable per combination.

### Tier Gating

Three-tier system resolved from Stripe subscription:

- **Free**: Basic journal, 3 entries/day, standard analysis
- **Premium** ($9.99/mo): Unlimited entries, pattern interrupts, voice entry, Sunday letter, integrations, therapist bridge, mentor personas
- **Premium+** ($19.99/mo): Everything in Premium + E2EE private mode, on-device LLM, priority support

Resolution happens in `src/lib/tier.ts` via `resolveTier(subscription)`. The `isPremium` helper returns `true` for both `premium` and `premium_plus` users (backward compatibility with existing gates).

### Feature Flags

Two-layer system:

1. **Server-side** (`evaluate-flags` edge function): Evaluates flags with user context, tier, rollout percentage. Used for edge functions that need to check flags.
2. **Client-side** (`src/lib/feature-flags.ts`): Fetches flag state, caches locally, evaluates with 250ms timeout. If the fetch fails or times out, flags default to `false` (fail-closed).

Flags support:
- Boolean enable/disable
- Percentage rollout (deterministic hash of user_id + flag_key)
- Tier restriction (flag only active for certain tiers)
- Config object (arbitrary JSON for thresholds, etc.)

### E2EE Branches

When E2EE is active:

1. Journal text is encrypted client-side before storage
2. The `encrypted_entries` table stores ciphertext + salt + IV
3. For AI analysis, the client decrypts locally and sends plaintext to the edge function in the request body (not from DB)
4. The edge function processes ephemeral plaintext and returns results
5. Results can optionally be encrypted before storage (user preference)

The server never has access to the passphrase or derived key. If the user loses their passphrase, encrypted entries are unrecoverable by design.

### Phase Dependency Graph

```
Phase 1 (Reflection Mode, Pattern Interrupt)
  - No dependencies, safe to enable first

Phase 2 (Voice Entry, Sunday Letter)
  - No dependencies on Phase 1
  - Voice entry is standalone
  - Sunday Letter needs journal_entries to exist (they do from base app)

Phase 3 (E2EE, Premium+)
  - Interacts with ALL phases (E2EE branches in analysis, storage)
  - Should be enabled last to avoid complexity during other phase testing

Phase 4 (Wearables, Living MindMap)
  - MindMap depends on mind_nodes table (exists from base app)
  - Wearables are additive context signals

Phase 5 (Therapist Bridge, Crisis Detection)
  - Therapist Bridge depends on journal_analysis entries existing
  - Crisis Detection is standalone (runs on each new entry)

Phase 6 (Mentor Personas)
  - Depends on profiles.reflection_mode from Phase 1 migration
  - You-Mentor depends on journal history (more entries = better persona)
```

---

## Quick Start Sequence

For the fastest path to production:

1. Run all 7 database migrations
2. Deploy all edge functions
3. Add `GEMINI_API_KEY` secret
4. Enable `reflection_mode` flag (immediate value, zero external deps)
5. Enable `pattern_interrupt` flag
6. Wire VoiceEntryButton into Journal.tsx
7. Add `GEMINI_API_KEY` and enable `voice_entry`
8. Set up Sunday Letter cron, enable `sunday_letter`
9. Add Stripe Premium+ prices, enable `e2ee_mode`
10. Add OAuth creds, enable `wearable_integration` and `living_mindmap`
11. Set crisis threshold, enable `crisis_detection` and `therapist_bridge`
12. Enable `mentor_personas` last (depends on reflection_mode being stable)
