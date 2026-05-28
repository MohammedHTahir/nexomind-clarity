-- Phase 4: Wearable + Calendar Integration and Living MindMap Upgrade

-- user_integrations table for OAuth token storage
-- TODO: The _enc suffix on access_token_enc/refresh_token_enc implies encryption-at-rest
-- but no application-layer encryption is currently applied. Tokens are stored as plaintext
-- and protected only by RLS + service-role access control. When deployed to production,
-- add pgsodium column encryption (ALTER COLUMN ... USING pgsodium.encrypt_column(...))
-- or implement application-layer encryption/decryption in fetch-context-signals.
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('apple_health', 'oura', 'google_fit', 'google_calendar', 'apple_calendar')),
  access_token_enc text,
  refresh_token_enc text,
  token_expires_at timestamptz,
  scopes jsonb DEFAULT '[]'::jsonb,
  calendar_mask_titles boolean DEFAULT true,
  connected_at timestamptz DEFAULT now(),
  UNIQUE (user_id, provider)
);

-- RLS for user_integrations
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own integrations"
  ON public.user_integrations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own integrations"
  ON public.user_integrations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own integrations"
  ON public.user_integrations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own integrations"
  ON public.user_integrations FOR DELETE
  USING (user_id = auth.uid());

-- Add context_signals column to journal_analysis
ALTER TABLE public.journal_analysis ADD COLUMN IF NOT EXISTS context_signals jsonb;

-- Add last_seen_at to mind_nodes
ALTER TABLE public.mind_nodes ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now();

-- Performance index for mind_nodes lookups
CREATE INDEX IF NOT EXISTS idx_mind_nodes_user_lastseen
  ON public.mind_nodes (user_id, last_seen_at DESC);
