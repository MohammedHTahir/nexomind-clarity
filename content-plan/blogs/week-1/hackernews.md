# Hacker News Post - Week 1

> **Note:** Only post this if the Week 1 Medium article gets 50+ claps or the topic is trending on HN. Otherwise skip.

---

## Title

Show HN: Mapping cognitive loops from journaling data to reduce overthinking

## Body

I built a journaling tool that detects recurring thought patterns across entries and surfaces them to the user.

**Problem:** People journal but rarely connect patterns across entries. The same cognitive loop (replay, catastrophizing, identity-questioning) appears 10+ times before the person notices it once.

**Approach:** Single-entry analysis identifies loop type and cognitive distortions (standard CBT taxonomy). Cross-entry analysis clusters entries by semantic similarity and surfaces recurring themes when they pass frequency thresholds.

**What it does:** You write what's on your mind. The system returns 4 lines: trigger, loop type, distortion label, one-line reframe. Over time, a pattern dashboard shows "this theme appeared in X% of entries this month."

**Design constraints:**
- E2E encrypted. We cannot read entries.
- AI response must be shorter than user input. Precision over explanation.
- Never claims to be therapy. Explicitly positions as a reflection tool.
- On-device LLM option for users who want zero server-side processing.

**Early finding:** Cutting AI responses from 300 words to 4 lines doubled user return rate. People don't want essays about their thoughts. They want accurate naming.

**Technical:** Gemini for analysis, PBKDF2 + AES-256-GCM for E2EE, embeddings for cross-entry clustering. Supabase + Edge Functions.

https://nexomind.ai

Interested in feedback on the pattern detection heuristics - specifically how to calibrate "this is a pattern" vs "this happened twice."

---

## Notes

- Keep it technical and understated
- No emotional language, no marketing copy
- HN audience will call out anything that feels like a pitch
- Be ready to discuss: privacy architecture, why not just use a notebook, how this differs from Woebot/Wysa, what "pattern detection" actually means technically
- If someone asks about the AI, be honest about limitations (it's pattern matching, not understanding)
- Engage with skeptics respectfully. they're the audience that converts hardest if convinced.
