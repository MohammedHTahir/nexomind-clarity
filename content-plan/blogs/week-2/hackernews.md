# Hacker News Post - Week 2

---

## Title

Show HN: NexoMind - AI journaling that reflects patterns, not advice

## Body

I built a journaling tool where the AI response is deliberately shorter than the user's input. You write what's on your mind, it returns 4 lines: trigger, loop type, cognitive distortion, one-line reframe.

Key design constraint: output must be shorter than input. Always compression, never generation.

Why: early version had 300-word responses. Users rated it 4.2/5 but returned every 4.3 days. Cut to 4 lines. Return rate doubled. People wanted precision, not explanation.

Stack: React + Vite, Supabase (auth + postgres + edge functions), Gemini for analysis, E2E encryption (PBKDF2 + AES-256-GCM), optional on-device LLM via Chrome Prompt API.

Privacy architecture: entries are E2E encrypted at Premium+ tier. Server-side analysis runs in isolated edge functions that process and discard. We architecturally cannot read entries or train on them.

Pattern detection: single-entry analysis names the loop type. Cross-entry analysis (embeddings + semantic clustering) surfaces recurring themes over time. "This trigger appeared in 70% of your anxious entries this month."

Current focus: calibrating when to surface a pattern vs. letting the user discover it naturally. Too eager = annoying. Too passive = user never sees the connection.

https://nexomind.ai

Interested in feedback on the output-shorter-than-input constraint. Has anyone seen similar findings in other AI tools where less output = better engagement?

---

## Notes

- This is the "proper" Show HN. More technical, product-focused.
- Be ready to discuss: why not just use a plain text file, privacy tradeoffs, how E2EE works with AI analysis, business model without data monetization
- If someone asks about pricing: transparent. Free tier with limited analysis. Premium for full pattern detection. Premium+ for E2EE + on-device processing.
- Don't get defensive about "just use a journal." Acknowledge it works for some people. This is for people who want the pattern surfacing across entries.
- Technical skeptics are welcome. Engage honestly about limitations.
