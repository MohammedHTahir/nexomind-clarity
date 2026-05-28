import { describe, it, expect } from "vitest";
import {
  deriveKey,
  encrypt,
  decrypt,
  validatePassphrase,
  generateSalt,
} from "@/lib/e2ee";

describe("e2ee", () => {
  describe("deriveKey determinism", () => {
    it("same passphrase and salt produce the same key bytes", async () => {
      const salt = new Uint8Array(16).fill(42);
      const passphrase = "my-secure-passphrase-123";

      const key1 = await deriveKey(passphrase, salt);
      const key2 = await deriveKey(passphrase, salt);

      const raw1 = await crypto.subtle.exportKey("raw", key1);
      const raw2 = await crypto.subtle.exportKey("raw", key2);

      expect(new Uint8Array(raw1)).toEqual(new Uint8Array(raw2));
    });

    it("different passphrases produce different keys", async () => {
      const salt = new Uint8Array(16).fill(42);

      const key1 = await deriveKey("passphrase-one-12", salt);
      const key2 = await deriveKey("passphrase-two-12", salt);

      const raw1 = await crypto.subtle.exportKey("raw", key1);
      const raw2 = await crypto.subtle.exportKey("raw", key2);

      expect(new Uint8Array(raw1)).not.toEqual(new Uint8Array(raw2));
    });
  });

  describe("encrypt/decrypt round-trip", () => {
    it("encrypts and decrypts a short string", async () => {
      const salt = new Uint8Array(16).fill(7);
      const key = await deriveKey("test-passphrase!", salt);
      const plaintext = "Hello, world!";

      const ciphertext = await encrypt(plaintext, key);
      const decrypted = await decrypt(ciphertext, key);

      expect(decrypted).toBe(plaintext);
    });

    it("encrypts and decrypts a long string", async () => {
      const salt = new Uint8Array(16).fill(9);
      const key = await deriveKey("another-secure-pass", salt);
      const plaintext = "A".repeat(10000);

      const ciphertext = await encrypt(plaintext, key);
      const decrypted = await decrypt(ciphertext, key);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe("different IV per encrypt call", () => {
    it("encrypting the same text twice produces different ciphertexts", async () => {
      const salt = new Uint8Array(16).fill(3);
      const key = await deriveKey("deterministic-key!", salt);
      const plaintext = "same text same text";

      const ct1 = await encrypt(plaintext, key);
      const ct2 = await encrypt(plaintext, key);

      expect(ct1).not.toBe(ct2);
    });
  });

  describe("validatePassphrase", () => {
    it("rejects passphrase shorter than 12 characters", () => {
      expect(validatePassphrase("short")).toEqual({
        valid: false,
        error: "Passphrase must be at least 12 characters",
      });
    });

    it("rejects empty passphrase", () => {
      expect(validatePassphrase("")).toEqual({
        valid: false,
        error: "Passphrase must be at least 12 characters",
      });
    });

    it("accepts passphrase with exactly 12 characters", () => {
      expect(validatePassphrase("123456789012")).toEqual({ valid: true });
    });

    it("accepts passphrase longer than 12 characters", () => {
      expect(validatePassphrase("this is a long passphrase")).toEqual({
        valid: true,
      });
    });
  });

  describe("generateSalt", () => {
    it("produces consistent output for the same userId", async () => {
      const salt1 = await generateSalt("user-abc-123");
      const salt2 = await generateSalt("user-abc-123");
      expect(salt1).toEqual(salt2);
    });

    it("produces different output for different userIds", async () => {
      const salt1 = await generateSalt("user-abc-123");
      const salt2 = await generateSalt("user-xyz-789");
      expect(salt1).not.toEqual(salt2);
    });

    it("returns 16 bytes", async () => {
      const salt = await generateSalt("some-user");
      expect(salt.length).toBe(16);
    });
  });
});
