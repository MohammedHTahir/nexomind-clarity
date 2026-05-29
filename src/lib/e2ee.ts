/**
 * End-to-End Encryption (E2EE) utilities for NexoMind Private Mode.
 * Uses WebCrypto API for PBKDF2 key derivation and AES-256-GCM encryption.
 */

const PBKDF2_ITERATIONS = 600_000;
const AES_KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const IDB_DB_NAME = "nexomind-e2ee";
const IDB_STORE_NAME = "keys";
const IDB_KEY_ID = "session-key";

// --- Helpers ---

function isWebCryptoAvailable(): boolean {
  try {
    return (
      typeof globalThis !== "undefined" &&
      typeof globalThis.crypto !== "undefined" &&
      typeof globalThis.crypto.subtle !== "undefined"
    );
  } catch {
    return false;
  }
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// --- Key Derivation ---

/**
 * Generate a salt from the user ID (first 16 bytes of SHA-256 hash).
 */
export async function generateSalt(userId: string): Promise<Uint8Array> {
  if (!isWebCryptoAvailable()) {
    throw new Error("WebCrypto API is not available in this environment");
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(userId);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash).slice(0, SALT_LENGTH);
}

/**
 * Derive a CryptoKey from a passphrase using PBKDF2 with HMAC-SHA-256.
 * Returns an AES-256-GCM key.
 */
export async function deriveKey(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  if (!isWebCryptoAvailable()) {
    throw new Error("WebCrypto API is not available in this environment");
  }
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );
}

// --- Encrypt / Decrypt ---

/**
 * Encrypt plaintext using AES-256-GCM.
 * Returns base64url-encoded string: IV (12 bytes) || ciphertext || tag (16 bytes).
 */
export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  if (!isWebCryptoAvailable()) {
    throw new Error("WebCrypto API is not available in this environment");
  }
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = encoder.encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  // Combine IV + ciphertext (which includes the 16-byte auth tag in WebCrypto)
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);

  return base64urlEncode(combined.buffer);
}

/**
 * Decrypt a base64url-encoded ciphertext (IV || ciphertext || tag) using AES-256-GCM.
 */
export async function decrypt(ciphertextB64: string, key: CryptoKey): Promise<string> {
  if (!isWebCryptoAvailable()) {
    throw new Error("WebCrypto API is not available in this environment");
  }
  const combined = base64urlDecode(ciphertextB64);
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// --- Passphrase Validation ---

/**
 * Validate that the passphrase meets minimum requirements (>= 12 characters).
 */
export function validatePassphrase(passphrase: string): {
  valid: boolean;
  error?: string;
} {
  if (!passphrase || passphrase.length < 12) {
    return { valid: false, error: "Passphrase must be at least 12 characters" };
  }
  return { valid: true };
}

// --- IndexedDB Key Storage ---

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }
    const request = indexedDB.open(IDB_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Store the derived key in IndexedDB for the current session.
 */
export async function storeKeyInIDB(key: CryptoKey): Promise<void> {
  try {
    const db = await openIDB();
    const exported = await crypto.subtle.exportKey("raw", key);
    const tx = db.transaction(IDB_STORE_NAME, "readwrite");
    const store = tx.objectStore(IDB_STORE_NAME);
    store.put(exported, IDB_KEY_ID);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (e) {
    console.warn("[E2EE] Failed to store key in IndexedDB:", e);
  }
}

/**
 * Retrieve the stored key from IndexedDB.
 */
export async function getKeyFromIDB(): Promise<CryptoKey | null> {
  try {
    if (!isWebCryptoAvailable()) return null;
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE_NAME, "readonly");
    const store = tx.objectStore(IDB_STORE_NAME);
    const request = store.get(IDB_KEY_ID);
    const rawKey = await new Promise<ArrayBuffer | undefined>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as ArrayBuffer | undefined);
      request.onerror = () => reject(request.error);
    });
    db.close();
    if (!rawKey) return null;
    return crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM", length: AES_KEY_LENGTH },
      true,
      ["encrypt", "decrypt"]
    );
  } catch {
    return null;
  }
}

/**
 * Remove the stored key from IndexedDB.
 * Should be called on auth sign-out to prevent key persistence beyond the user session.
 */
export async function clearKeyFromIDB(): Promise<void> {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE_NAME, "readwrite");
    const store = tx.objectStore(IDB_STORE_NAME);
    store.delete(IDB_KEY_ID);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Silently fail - best effort cleanup
  }
}

/**
 * Clear the E2EE key from IndexedDB. Exported for use in auth sign-out flows
 * to ensure the encryption key does not outlive the user session.
 */
export const clearStoredKey = clearKeyFromIDB;
