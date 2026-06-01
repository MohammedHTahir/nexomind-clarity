# End-to-End Encryption in a Mental Health App: Architecture Decisions and Tradeoffs

> **Note:** Set canonical_url to the Medium article URL in Hashnode's post settings UI before publishing.

---

this is a technical post about implementing E2EE in a journaling app that also runs AI analysis on entries. the two constraints feel contradictory (encrypt everything vs. analyze everything) and working through that tension shaped most of our architecture.

---

## The constraint

NexoMind analyzes journal entries with AI to detect cognitive patterns, name distortions, and surface recurring themes across entries.

It also needs to be end-to-end encrypted for users who want absolute privacy.

These two requirements conflict directly: AI analysis requires reading the entry. E2EE means the server cannot read the entry.

Resolution: for E2EE users, all analysis happens on-device. The server never sees plaintext.

---

## Cryptographic implementation

### Key derivation

```typescript
// lib/e2ee.ts
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 600_000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}
```

**Choices and rationale:**
- PBKDF2 over Argon2: WebCrypto native support. No WASM dependency. 600k iterations compensates for PBKDF2's lower memory-hardness.
- Salt from `SHA-256(user_id).slice(0, 16)`: deterministic per user, avoids storing separate salt. User ID is UUID, sufficient entropy source.
- AES-256-GCM: authenticated encryption. The tag prevents tampering. 12-byte random IV per encryption operation.

### Encryption/decryption

```typescript
async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );
  
  // Concatenate: IV (12 bytes) || ciphertext+tag
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  return base64url.encode(combined);
}

async function decrypt(encoded: string, key: CryptoKey): Promise<string> {
  const combined = base64url.decode(encoded);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  
  return new TextDecoder().decode(plaintext);
}
```

### Key storage

Derived key stored in IndexedDB, wrapped per session. Never leaves the client. On new device: user re-enters passphrase, key is re-derived locally (deterministic given same passphrase + salt).

---

## Database schema changes

```sql
-- E2EE profile fields
ALTER TABLE profiles
  ADD COLUMN e2ee_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN e2ee_kdf_salt text,
  ADD COLUMN e2ee_passphrase_set_at timestamptz;

-- Journal entries support encrypted storage
ALTER TABLE journals
  ADD COLUMN is_encrypted boolean NOT NULL DEFAULT false,
  ADD COLUMN ciphertext text;
ALTER TABLE journals ALTER COLUMN content DROP NOT NULL;
```

For E2EE entries: `content = NULL`, `is_encrypted = true`, `ciphertext = base64url(iv||ciphertext||tag)`.

The `content` column being NULL is the proof. If we can't access it, it shouldn't exist unencrypted on our server. Period.

---

## The analysis path split

### Non-E2EE users (Free / Premium)

```
User writes entry → plaintext sent to server → 
analyze-journal edge function → Gemini API → 
structured analysis returned → stored alongside entry
```

### E2EE users (Premium+)

```
User writes entry → encrypted on device → ciphertext sent to server →
entry stored (encrypted) → client decrypts locally → 
on-device LLM analysis → analysis metadata synced (no plaintext)
```

The server-side edge function enforces this:

```typescript
// In analyze-journal/index.ts
const { data: profile } = await adminClient
  .from('profiles')
  .select('e2ee_enabled')
  .eq('id', user.id)
  .single();

if (profile.e2ee_enabled) {
  return new Response(
    JSON.stringify({ 
      error: 'E2EE entries must be analyzed on-device',
      code: 'E2EE_REQUIRES_CLIENT'
    }),
    { status: 403, headers: corsHeaders }
  );
}
```

---

## On-device LLM integration

For E2EE users, we probe available on-device AI:

```typescript
// lib/on-device-llm.ts
async function getOnDeviceLLM(): Promise<OnDeviceLLM | null> {
  // Chrome Prompt API
  if (window.ai?.languageModel) {
    const model = await window.ai.languageModel.create();
    return { analyzeEntry: (text, opts) => /* ... */ };
  }
  
  // Apple Intelligence (future)
  // ...
  
  return null;
}
```

Current limitations:
- Chrome Prompt API is Gemini Nano. Good for single-entry analysis. Limited for complex pattern detection.
- Cross-entry clustering must happen client-side. Performance degrades past ~100 entries on mobile.
- If no on-device LLM available, analysis is paused (with clear messaging to user).

---

## Cross-entry pattern detection under E2EE

This is the hardest problem. Pattern detection requires reading multiple entries to find themes.

**Current approach:**

1. Client decrypts all entries in memory (batch)
2. Run lightweight theme extraction per entry (on-device LLM or regex heuristics)
3. Compute embedding similarity (client-side, smaller model)
4. Identify clusters above threshold
5. Store pattern metadata ONLY (theme label + frequency + entry IDs, NOT content)
6. Discard all plaintext from memory

Pattern metadata is non-reversible: knowing "the theme 'feeling behind' appeared in entries 3, 7, 12, 15" doesn't expose what those entries actually say.

**Performance reality:**
- 50 entries: fine on mobile, <2 seconds
- 100 entries: noticeable delay, ~5 seconds on mid-range device
- 200+ entries: needs pagination or background processing

Exploring: approximate nearest neighbor with quantized embeddings for on-device scale.

---

## The 3-step activation UX

E2EE isn't enabled by default. It requires deliberate activation:

**Step 1:** Create passphrase (>=12 characters, validated for minimum complexity)

**Step 2:** Confirm passphrase (re-entry)

**Step 3:** Irrecoverability acknowledgment. Checkbox: "I understand that if I lose this passphrase and all my devices, my entries cannot be recovered by anyone."

This friction is intentional. The tradeoffs (no account recovery, on-device analysis only, limited cross-entry detection) are real and users need informed consent.

---

## What this architecture costs

| Capability | Non-E2EE | E2EE |
|-----------|---------|------|
| Analysis quality | Full Gemini Pro | On-device (Nano) |
| Cross-entry patterns | Server-side, fast | Client-side, limited |
| Account recovery | Yes (support can help) | No (architecturally impossible) |
| Debugging user issues | Can inspect entry | Metadata only |
| Model training | Not done but possible | Impossible |
| Population insights | Theoretically possible | Impossible |

---

## What it gains

- **Breach resilience:** database compromise exposes ciphertext, not thoughts
- **Legal clarity:** cannot comply with content requests because content doesn't exist in readable form
- **Trust signal:** verifiable claim, not policy promise
- **Product quality:** honest input produces better analysis
- **User behavior change:** E2EE users write longer (measured by encrypted byte length), return more frequently

---

## Lessons

1. E2EE affects every downstream decision. Choose it early or prepare for a massive migration.
2. On-device AI is emerging just in time to make E2EE + AI feasible. Two years ago this would have been near-impossible.
3. WebCrypto is sufficient. You don't need external crypto libraries for standard primitives.
4. The UX of communicating irrecoverability is harder than the crypto itself.
5. For mental health tools specifically: privacy isn't a feature. It's what makes the product work.

---

[NexoMind](https://nexomind.ai) - E2E encrypted journaling with on-device AI analysis.
