/**
 * Hook for E2EE Private Mode: manages encryption state, key lifecycle,
 * and on-device LLM availability.
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  deriveKey,
  encrypt,
  decrypt,
  generateSalt,
  storeKeyInIDB,
  getKeyFromIDB,
  clearKeyFromIDB,
} from "@/lib/e2ee";
import { isOnDeviceLLMAvailable } from "@/lib/on-device-llm";

export interface UseE2EEReturn {
  isE2EE: boolean;
  loading: boolean;
  isLLMAvailable: boolean;
  enable: (passphrase: string) => Promise<void>;
  disable: () => Promise<void>;
  encryptEntry: (content: string) => Promise<string>;
  decryptEntry: (ciphertext: string) => Promise<string>;
}

export function useE2EE(): UseE2EEReturn {
  const { user } = useAuth();
  const [isE2EE, setIsE2EE] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLLMAvailable, setIsLLMAvailable] = useState(false);

  // Load E2EE status from profile
  useEffect(() => {
    if (!user) {
      setIsE2EE(false);
      setLoading(false);
      return;
    }

    const loadStatus = async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("e2ee_enabled")
          .eq("id", user.id)
          .maybeSingle();
        setIsE2EE(!!data?.e2ee_enabled);
      } catch (e) {
        console.error("[E2EE] Failed to load status:", e);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [user]);

  // Check on-device LLM availability
  useEffect(() => {
    isOnDeviceLLMAvailable().then(setIsLLMAvailable).catch(() => setIsLLMAvailable(false));
  }, []);

  const enable = useCallback(
    async (passphrase: string) => {
      if (!user) throw new Error("Not authenticated");

      const salt = await generateSalt(user.id);
      const key = await deriveKey(passphrase, salt);

      // Store key in IndexedDB
      await storeKeyInIDB(key);

      // Encode salt for storage
      const saltHex = Array.from(salt)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          e2ee_enabled: true,
          e2ee_kdf_salt: saltHex,
          e2ee_passphrase_set_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      setIsE2EE(true);
    },
    [user]
  );

  const disable = useCallback(async () => {
    if (!user) throw new Error("Not authenticated");

    await clearKeyFromIDB();

    const { error } = await supabase
      .from("profiles")
      .update({
        e2ee_enabled: false,
        e2ee_kdf_salt: null,
        e2ee_passphrase_set_at: null,
      })
      .eq("id", user.id);

    if (error) throw error;
    setIsE2EE(false);
  }, [user]);

  const encryptEntry = useCallback(async (content: string): Promise<string> => {
    const key = await getKeyFromIDB();
    if (!key) throw new Error("Encryption key not available. Please re-enter your passphrase.");
    return encrypt(content, key);
  }, []);

  const decryptEntry = useCallback(async (ciphertext: string): Promise<string> => {
    const key = await getKeyFromIDB();
    if (!key) throw new Error("Decryption key not available. Please re-enter your passphrase.");
    return decrypt(ciphertext, key);
  }, []);

  return {
    isE2EE,
    loading,
    isLLMAvailable,
    enable,
    disable,
    encryptEntry,
    decryptEntry,
  };
}

export default useE2EE;
