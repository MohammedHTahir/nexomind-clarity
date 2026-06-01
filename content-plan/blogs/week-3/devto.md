---
title: "Building a Pattern Recognition Layer for Human Thought"
published: true
description: "Using embeddings and semantic clustering to detect recurring cognitive patterns across unstructured journal entries."
tags: ai, machinelearning, building, mentalhealth
canonical_url: https://medium.com/@YOUR_HANDLE/you-cant-see-your-own-patterns-PLACEHOLDER
---

# Building a Pattern Recognition Layer for Human Thought

Here's the technical challenge I've been working on: detecting recurring cognitive patterns across unstructured journal entries.

Not keyword matching. Not sentiment analysis. Actual pattern detection - the same underlying theme appearing across entries that a user frames as "completely different problems."

This is the core of NexoMind's pattern system. I want to share the approach, what works, what doesn't, and where the hard problems actually are.

---

## The problem definition

Users journal about their day. Each entry seems unique to them. But over 30-50 entries, patterns emerge that the user can't see from inside:

- Same emotional trigger firing in different life contexts
- Same avoidance behavior with different rationalizations each time
- Same core fear wearing different surface-level stories

A therapist catches these because they sit outside the system and have memory across sessions. "You've mentioned feeling overlooked three times this month."

The engineering challenge: build that outside-observer function programmatically.

---

## Single-entry analysis (the easy part)

Each entry gets analyzed individually for:

```typescript
interface EntryAnalysis {
  triggers: string[]           // what activated the thought
  loopType: LoopType           // replay, spiral, fork, etc.
  distortions: string[]        // CBT taxonomy: catastrophizing, mind-reading, etc.
  emotionalContent: string[]   // core emotions identified
  themes: string[]             // abstracted topics (work, relationships, identity)
  clarityScore: number         // 0-1, how resolved vs looping
}
```

This is relatively straightforward with a good prompt. Gemini handles it well with the right system prompt composition. The output is structured JSON, validated against the schema.

Single-entry analysis catches obvious loops (replay loop is usually identifiable within one writing session). But the patterns that matter most - the recurring ones - require cross-entry analysis.

---

## Cross-entry pattern detection (the hard part)

This is where it gets interesting. The system needs to identify that "i'm stressed about missing the deadline" and "everyone at the gym seems further along" and "i should have started learning this years ago" are all expressions of one pattern: "i'm falling behind."

### Approach: Semantic embedding + clustering

Each entry (or more precisely, each analyzed theme) gets embedded into vector space. Entries are then clustered not by surface language but by semantic proximity.

The pipeline:

```
entry.themes → embeddings → cosine similarity matrix → 
threshold clustering → frequency counting → surfacing logic
```

**Threshold:** cosine similarity >= 0.85 for two themes to be considered "same pattern." This was calibrated empirically - 0.80 pulled in too many false positives, 0.90 missed legitimate variations.

**Deduplication:** when extracting entities for the MindMap visualization, we extract up to 50 candidates per analysis and dedup at 0.85 cosine. This catches "falling behind" / "not fast enough" / "behind schedule" as one node.

### What gets surfaced

A pattern hits the surfacing threshold when:
- Same semantic cluster appears in 3+ entries within a rolling window
- The cluster represents 15%+ of total entries in the time period
- The user hasn't already been shown this pattern in the last 7 days

The surfacing message: "This theme appeared in X% of your entries this month."

---

## The three pattern types that matter

### 1. Same trigger, different context

Detection: entries with different situational content (work vs. personal vs. social) but semantically similar trigger classifications. The trigger embedding clusters even though the context embeddings diverge.

Example pattern detected: "feeling unseen" appearing across entries about work meetings, friendships, and family - all framed as separate problems by the user.

### 2. Same emotion, different story

Detection: emotional content embeddings cluster tightly while theme embeddings vary widely. The feeling stays constant, the story attached to it rotates.

This is harder to detect because the user genuinely believes each story IS the cause. "I'm anxious because of the deadline" feels different from "I'm anxious about money" from inside. From outside, the anxiety is the constant and the stories are interchangeable.

### 3. Same avoidance, different rationalization

Detection: entries that mention wanting to do something followed by a justification for not doing it. Across entries, the "want to do" clusters (same type of uncomfortable action) while the justification varies.

This one required fine-tuning the prompt to specifically extract "intended action" and "stated reason for not acting" as separate fields.

---

## What doesn't work

**Pure keyword matching.** "Behind" shows up in too many unrelated contexts. Semantic similarity handles this but keywords don't.

**Session-level only analysis.** The interesting patterns are invisible within any single entry. The system MUST maintain cross-entry memory.

**Short time windows.** Patterns need at least 20-30 entries to become statistically meaningful. Surfacing after 5 entries produces too many false positives.

**Aggressive surfacing.** Early version surfaced every detected pattern immediately. Users felt overwhelmed and surveilled. Current approach: wait for confidence threshold, surface gently, and don't re-surface the same pattern within 7 days.

---

## The personal finding that validated the approach

6 weeks of journaling. Pattern dashboard showed: 80% of my "anxious" entries contained the theme "not being fast enough."

I thought I was stressed about different things each time - work, fitness, a side project. All separate problems in my head.

One pattern. Named clearly. More useful than solving each surface problem individually.

That's the moment the approach proved itself. Not the AI accuracy. The user impact of seeing something clearly that was invisible from inside.

---

## Open questions I'm still working on

1. **Timing:** When should you surface a pattern? During the loop (immediate but interrupting) or after (delayed but reflective)?

2. **Confidence vs. coverage:** Higher threshold = fewer false positives but more missed patterns. Lower threshold = more noise. Currently at 0.85 cosine. Might need per-user calibration.

3. **Pattern decay:** How long does a pattern stay "active"? If someone hasn't triggered it in 30 days, is it resolved or dormant?

4. **Nested patterns:** Some patterns contain other patterns. "Falling behind" might be a sub-pattern of "not enough." How deep to go?

5. **Privacy constraint:** With E2EE, cross-entry analysis has to happen client-side for encrypted users. That limits model size and compute. On-device LLM handles basic analysis but clustering across 100+ entries on-device is a performance challenge.

---

Interested in feedback from anyone working on similar problems - whether in mental health, personal analytics, or semantic search over personal data.

[NexoMind](https://nexomind.ai)
