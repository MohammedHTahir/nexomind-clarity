-- Phase 5: Clinical & Safety schema changes

-- Disclaimer acceptances table
CREATE TABLE IF NOT EXISTS disclaimer_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  feature_key text NOT NULL,
  disclaimer_version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_key, disclaimer_version)
);

ALTER TABLE disclaimer_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own disclaimer acceptances"
  ON disclaimer_acceptances FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own disclaimer acceptances"
  ON disclaimer_acceptances FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Profiles: crisis detection settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS crisis_detection_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS crisis_detection_locale_approved boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trusted_contact jsonb;

-- Journal analysis: crisis signal fields
ALTER TABLE journal_analysis ADD COLUMN IF NOT EXISTS crisis_signal numeric;
ALTER TABLE journal_analysis ADD COLUMN IF NOT EXISTS crisis_signal_threshold_breached boolean DEFAULT false;

-- Crisis events table
CREATE TABLE IF NOT EXISTS crisis_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  journal_id uuid REFERENCES journals(id) ON DELETE CASCADE,
  signal_score numeric NOT NULL,
  threshold numeric NOT NULL,
  surfaced_at timestamptz NOT NULL DEFAULT now(),
  user_action text CHECK (user_action IN ('called_988', 'called_samaritans', 'contacted_trusted', 'dismissed', 'none')),
  user_action_at timestamptz,
  trusted_notified boolean NOT NULL DEFAULT false
);

ALTER TABLE crisis_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crisis events"
  ON crisis_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own crisis events"
  ON crisis_events FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert crisis events"
  ON crisis_events FOR INSERT
  WITH CHECK (true);
