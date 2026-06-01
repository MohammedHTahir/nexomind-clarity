---
title: "Why We Chose E2E Encryption for a Journaling App (And What It Cost Us)"
published: true
description: "Architecture decisions, tradeoffs, and what you can't build when you can't read the data. Our E2EE implementation for NexoMind."
tags: security, privacy, architecture, ai
canonical_url: https://medium.com/@YOUR_HANDLE/your-journal-app-says-its-private-PLACEHOLDER
---

# Why We Chose E2E Encryption for a Journaling App (And What It Cost Us)

We made a decision early in building NexoMind that constrains almost every other technical choice: end-to-end encryption for journal entries.

Not server-side encryption with a company-held key. Client-side encryption where only the user's devices hold the decryption key.

This post covers: why we chose it, how it works, what it cost us in features and engineering complexity, and what we gained.

---

## The product argument for E2EE

A journaling tool only produces value if users write honestly. Users only write honestly if they trust nobody else can read it.

"Trust" in this context isn't about policies or promises. It's about architecture. The question isn't "will you read my entries?" It's "could you, if you chose to?"

If the answer is yes, users self-censor. Even unconsciously. Even slightly. And slightly self-censored input produces significantly worse AI analysis. Because the real patterns - the things actually worth surfacing - live in the part people would normally hold back.

E2EE makes the answer: we cannot. Not "we won't." Cannot.

That changes writing behavior. E2EE users write longer entries (we can see encrypted byte length without reading content). The quality of analysis improves because the input is more honest. Return rate is higher.

Privacy isn't ethics-only here. It's a product quality multiplier.

---

## Implementation: how it works

### Key derivation

```
passphrase (user input, >=12 chars)
    → PBKDF2-HMAC-SHA-256, 600,000 iterations
    → 32-byte derived key
    → salt = first 16 bytes of SHA-256(user_id)
```

We use WebCrypto for all cryptographic operations. No JS crypto libraries. The browser's native implementation is constant-time and hardware-accelerated where available.

### Encryption

```
AES-256-GCM
    → 12-byte random IV per entry
    → output: base64url(IV || ciphertext || auth_tag)
```

Each entry is encrypted independently with a fresh IV. The auth tag prevents tampering. The output is a single base64url string stored in the `ciphertext` column.

### Key storage

The derived key is stored in IndexedDB, wrapped per session. It's never sent to the server. On new device login, the user re-enters their passphrase to derive the key locally.

### Database schema

```sql
ALTER TABLE journals
  ADD COLUMN is_encrypted boolean NOT NULL DEFAULT false,
  ADD COLUMN ciphertext text;
-- content column becomes nullable for E2EE entries
ALTER TABLE journals ALTER COLUMN content DROP NOT NULL;
```

When E2EE is active: `content = NULL`, `ciphertext = encrypted_blob`, `is_encrypted = true`.

---

## What we gave up

### 1. Server-side AI analysis

Our edge function `analyze-journal` returns 403 for E2EE users:

```typescript
if (profile.e2ee_enabled) {
  return new Response(
    JSON.stringify({ 
      error: 'E2EE entries must be analyzed on-device', 
      code: 'E2EE_REQUIRES_CLIENT' 
    }),
    { status: 403 }
  );
}
```

AI analysis for E2EE users happens entirely client-side using on-device LLMs (Chrome Prompt API, Apple Intelligence when available). This limits model size and capability but maintains the zero-server-access guarantee.

### 2. Cross-entry pattern detection at scale

Pattern detection requires reading multiple entries to find themes. For E2EE users, this must happen on the client. Decrypting 100+ entries, computing embeddings, and running similarity clustering on-device is a performance challenge, especially on mobile.

Current approach: decrypt in memory, run lightweight clustering, store only pattern metadata (non-reversible to content), discard plaintext.

### 3. Account recovery

If the user loses their passphrase and all their devices, their entries are gone. We cannot recover them. This is a hard conversation in customer support.

We mitigate with: clear warnings during E2EE activation (3-step modal with irrecoverability acknowledgment), passphrase confirmation step, and a recommendation to store the passphrase in a password manager.

### 4. Debugging and support

When a user reports "my analysis felt off," we can't look at their entry. We see: timestamp, encrypted byte length, analysis metadata (if analysis ran on-device and synced metadata). We cannot reproduce their experience.

### 5. Population-level insights

"What are users journaling about this month?" We don't know. Can't know. Can't build features that require aggregate content knowledge.

### 6. Model training

We cannot fine-tune or improve our AI using user entries. Every improvement comes from general training data and prompt engineering, never from user content.

---

## What we gained

### Trust → honesty → utility feedback loop

- Users trust the system (architecture, not promises)
- Users write honestly (stop self-censoring)
- Analysis is more accurate (honest input = better detection)
- Users find it more useful (real patterns surfaced, not filtered ones)
- Users return more frequently
- Trust deepens

### Breach resilience

If our database gets compromised, attackers get encrypted blobs. Not thoughts. Not fears. Not vulnerability. Just ciphertext that requires a user-held key to decrypt.

### Regulatory simplicity

GDPR, HIPAA-adjacent requirements, data subject access requests - all simpler when you architecturally cannot access the data. "We cannot produce this user's entry content" is a clean legal position.

### Competitive differentiation

Most journaling apps claim "private." We claim "encrypted end-to-end, we cannot read your entries." That's a verifiable architectural claim, not a policy promise.

---

## The activation flow (UX)

E2EE isn't enabled by default. It's a Premium+ feature with a deliberate activation:

1. **Step 1:** Enter passphrase (>=12 chars, validated)
2. **Step 2:** Confirm passphrase (re-type)
3. **Step 3:** Irrecoverability acknowledgment (checkbox: "I understand that if I lose this passphrase, my entries cannot be recovered by anyone, including NexoMind")

This friction is intentional. E2EE has real tradeoffs (no account recovery, on-device analysis only) and users need to understand them before opting in.

---

## Architecture decision: why not E2EE by default?

Two reasons:

1. **On-device analysis is limited.** Server-side analysis with Gemini is significantly more accurate than current on-device LLMs. Free and Premium users benefit from better analysis at the cost of server-side content access (though we still don't train on it or retain it beyond the analysis function execution).

2. **Account recovery matters to most users.** Most people would rather have the option of recovery than absolute encryption. E2EE is for users who've made a deliberate choice that privacy > convenience.

Premium+ tier gives users the choice. Not a forced default.

---

## Lessons for other builders

1. **Decide early.** E2EE affects every feature decision downstream. Adding it later is a migration nightmare.

2. **The tradeoffs are real.** Don't pretend E2EE is free. Be transparent about what you lose.

3. **For thinking tools specifically, privacy = product quality.** This isn't true for all apps. But for anything where honest input is required, trust architecture is product architecture.

4. **Test on-device alternatives before committing.** We got lucky that Chrome Prompt API and on-device LLMs are emerging. Two years ago, E2EE with AI analysis would have been nearly impossible.

5. **The investor conversation will be harder.** Be ready for it. "How do you monetize the data?" "We can't access it." That's a feature, not a bug. But not everyone sees it that way.

---

[NexoMind](https://nexomind.ai) - E2E encrypted journaling with pattern detection. We cannot read your entries. That's by design.
