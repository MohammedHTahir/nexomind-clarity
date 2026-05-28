-- Phase 2: Voice-First Thought Dump + Sunday Letters schema

-- Voice columns on journal_analysis
ALTER TABLE journal_analysis
  ADD COLUMN voice_pace_wpm numeric,
  ADD COLUMN voice_hesitation_ratio numeric,
  ADD COLUMN voice_tonal_variability_hz numeric,
  ADD COLUMN is_voice_entry boolean NOT NULL DEFAULT false;

-- Sunday letters table
CREATE TABLE sunday_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  week_starts_on date NOT NULL,
  body text NOT NULL,
  generated_at timestamptz DEFAULT now(),
  read_at timestamptz,
  UNIQUE(user_id, week_starts_on)
);

ALTER TABLE sunday_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sunday letters"
  ON sunday_letters FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own sunday letters"
  ON sunday_letters FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert sunday letters"
  ON sunday_letters FOR INSERT
  WITH CHECK (true);

-- Sunday letter profile columns
ALTER TABLE profiles
  ADD COLUMN sunday_letter_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN sunday_letter_time time NOT NULL DEFAULT '09:00',
  ADD COLUMN sunday_letter_email_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN sunday_letter_push_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN timezone text NOT NULL DEFAULT 'UTC';
