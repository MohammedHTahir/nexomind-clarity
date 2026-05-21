# Flagship AI Features: Mind Map + Pattern Interrupts

Two compounding features that turn NexoMind from "AI journal" into "the only app that shows you the architecture of your own mind."

---

## Feature 1 — Mind Map of You

A living graph of the user's psyche, built silently from every entry.

**What the user sees:**
- New `/app/mind-map` page in the authenticated app
- An interactive force-directed graph (react-force-graph-2d)
- **Nodes** color-coded by type: themes (blue), emotions (amber), people (rose), distortions (violet), triggers (teal)
- **Node size** = frequency. **Edge thickness** = co-occurrence strength
- Tap a node → side panel shows: definition the AI inferred, trend sparkline (last 30 days), the 3 most recent entries that fed it, one AI-generated reframe
- Empty state: "Write 3 entries and your mind map appears."

**How it works (technical):**
- New tables:
  - `mind_nodes` (user_id, type, label, frequency, last_seen_at, embedding vector(1536), metadata jsonb)
  - `mind_edges` (user_id, source_id, target_id, weight, last_co_occurred_at)
- After each `analyze-journal` run, a new edge function `update-mind-map` is fired (non-blocking):
  1. Extracts structured entities from the analysis (themes, people, emotions, distortions, triggers) via Gemini tool-calling
  2. For each entity, embeds it and does cosine-similarity match against existing user nodes (threshold 0.82) — merges if matched, creates if new
  3. Increments edges between all entities that co-occur in the same entry
  4. Updates `last_seen_at` and frequency counters
- pgvector extension enabled for similarity merging (prevents "anxious" and "anxiety" becoming 2 nodes)
- Graph data fetched via `/get-mind-map` edge function returning pruned graph (top N nodes by frequency)

---

## Feature 2 — Pattern Interrupts

The AI learns *when* and *why* the user spirals, then proactively reaches out.

**What the user sees:**
- New section in Settings: "Pattern Interrupts" with toggle + permission to send notifications/emails
- After ~2 weeks of data: a "Patterns we noticed" card on dashboard
  - "You overthink Sunday evenings, usually about *work validation*"
  - "Your loops peak around 11pm — 6 of the last 10 entries"
- A calm, single message arrives at the predicted time (email first; web push if granted):
  > "Last 4 Sundays this loop started around 8pm. Want to write it out before it grips?" → CTA opens the journal pre-filled with the recurring theme

**How it works (technical):**
- New table `user_patterns` (user_id, pattern_type, day_of_week, hour_of_day, theme_node_id, confidence, sample_size, last_fired_at)
- Daily cron edge function `compute-patterns`:
  - Pulls user's entries from last 30 days
  - Aggregates by day-of-week × hour-of-day buckets
  - For buckets with ≥3 entries and confidence ≥ 0.6, writes a pattern
  - Links pattern to dominant theme node from mind map
- Hourly cron edge function `fire-pattern-interrupts`:
  - Finds patterns matching current DOW + hour (-15 min window)
  - Skip if user already journaled today, or pattern fired in last 5 days, or user disabled
  - Sends transactional email via existing email infrastructure
- Uses existing `pg_cron` + `pg_net` already wired in the project

---

## Build Order (phased — each phase ships independently)

**Phase 1 — Mind Map foundation** (this session)
- DB migration: enable pgvector, create `mind_nodes` + `mind_edges`, RLS policies
- Edge function `update-mind-map` (called from `analyze-journal` after analysis insert)
- Edge function `get-mind-map`
- New page `/app/mind-map` with react-force-graph-2d + node detail panel
- Nav link in AppShell
- Backfill button in Settings ("Build my mind map from past entries")

**Phase 2 — Pattern Interrupts** (next session)
- DB migration: `user_patterns` table, user notification preferences
- Edge functions `compute-patterns` (daily) + `fire-pattern-interrupts` (hourly)
- Dashboard "Patterns we noticed" card
- Settings panel toggle + preview of pending interrupts
- New transactional email template "pattern-interrupt"

---

## Out of scope for now
- Web push notifications (email-only for v1 of Pattern Interrupts)
- Sharing mind map screenshots (premium teaser for later)
- 3D graph view (2D ships first; 3D as polish)

---

## Confirm before I start
1. **Free vs Premium gating**: Mind Map is the killer feature — gate it behind Premium ($9.99/mo) to drive conversion? Or free for first 30 days then locked?
2. **Backfill**: Run mind map generation on existing entries automatically, or only on new entries going forward?

If no preference, I'll default to: **Mind Map free up to 20 nodes, unlimited for Premium** + **auto-backfill on first visit**. Reply "go" and I'll start Phase 1.