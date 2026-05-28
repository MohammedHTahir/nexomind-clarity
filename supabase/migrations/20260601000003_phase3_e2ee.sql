-- Phase 3: E2EE Private Mode schema changes

-- Profiles: E2EE settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS e2ee_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS e2ee_kdf_salt text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS e2ee_passphrase_set_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS e2ee_sync_fields jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Journals: encrypted content support
ALTER TABLE journals ADD COLUMN IF NOT EXISTS is_encrypted boolean NOT NULL DEFAULT false;
ALTER TABLE journals ADD COLUMN IF NOT EXISTS ciphertext text;
ALTER TABLE journals ALTER COLUMN content DROP NOT NULL;

-- Journal analysis: encrypted flag
ALTER TABLE journal_analysis ADD COLUMN IF NOT EXISTS is_encrypted boolean NOT NULL DEFAULT false;
