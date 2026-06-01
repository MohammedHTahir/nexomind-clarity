# Hacker News Post - Week 4

---

## Title

E2E encrypted journaling with on-device LLM analysis

## Body

Built a journaling app (NexoMind) that offers E2E encryption with a twist: AI analysis still works, but runs entirely on-device for encrypted users.

Architecture:
- Client-side encryption: PBKDF2-HMAC-SHA-256 (600k iterations) for key derivation, AES-256-GCM for entry encryption
- Salt: SHA-256(user_id)[0:16] (deterministic, avoids server-side salt storage)
- Server stores only ciphertext. Content column is NULL for E2EE entries.
- Key never leaves client. Stored in IndexedDB per session.

AI analysis path for E2EE users:
- Server returns 403 if E2EE user requests server-side analysis
- Client decrypts entry locally, runs analysis via Chrome Prompt API (Gemini Nano) or future on-device models
- Analysis metadata (pattern type, distortion label - not content) synced back to server
- Cross-entry pattern detection: decrypt batch client-side, compute similarity, store only cluster metadata

Tradeoffs accepted:
- No account recovery (passphrase loss = data loss, acknowledged via 3-step activation)
- On-device analysis is less capable than server-side Gemini Pro
- Cross-entry clustering degrades past ~100 entries on mobile
- Cannot debug user issues without their content
- Cannot train models on user data (intentional)

Performance numbers for on-device clustering:
- 50 entries: <2s on mid-range mobile
- 100 entries: ~5s
- 200+: needs pagination

Exploring quantized approximate nearest neighbor for better on-device scale.

Question for the community: is PBKDF2 with 600k iterations sufficient for this use case given the salt is deterministic per user? Considered Argon2 but WebCrypto doesn't support it natively and we wanted to avoid WASM dependencies.

https://nexomind.ai

---

## Notes

- Pure technical. Architecture-focused.
- This works on HN because: E2EE + AI is a genuine engineering tension, the crowd likes privacy-first architecture, and the PBKDF2 vs Argon2 question will generate good technical discussion
- Be ready to discuss: why not Argon2id, key rotation strategy, what happens on device loss, threat model (what attacks does this protect against / not protect against)
- Be honest about limitations. "On-device analysis is worse" is fine to admit.
- If someone asks about the business model: "subscription. free tier with server-side analysis. premium+ for E2EE with on-device. we can't monetize data because we can't read it."
- Don't get defensive about crypto choices. If someone suggests improvements, engage constructively.
