-- ============================================================
-- Kiro Competitive Roadmap — Phase 1 through 6 (bundled apply)
-- Mirrors the 7 migration files in supabase/migrations/2026060100000{1..7}*.sql
-- Adds GRANT statements per project rules.
-- ============================================================

-- ---------- PHASE 1: Cross-cutting infrastructure ----------

CREATE TABLE IF NOT EXISTS public.feature_flags (
  key text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  rollout_percent integer NOT NULL DEFAULT 0 CHECK (rollout_percent >= 0 AND rollout_percent <= 100),
  min_tier text NOT NULL DEFAULT 'free' CHECK (min_tier IN ('free', 'premium', 'premium_plus')),
  config jsonb DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.feature_flags TO authenticated;
GRANT ALL ON public.feature_flags TO service_role;

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read feature flags" ON public.feature_flags;
CREATE POLICY "Authenticated users can read feature flags"
  ON public.feature_flags FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Service role can insert feature flags" ON public.feature_flags;
CREATE POLICY "Service role can insert feature flags"
  ON public.feature_flags FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update feature flags" ON public.feature_flags;
CREATE POLICY "Service role can update feature flags"
  ON public.feature_flags FOR UPDATE TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can delete feature flags" ON public.feature_flags;
CREATE POLICY "Service role can delete feature flags"
  ON public.feature_flags FOR DELETE TO service_role USING (true);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reflection_mode text NOT NULL DEFAULT 'companion'
  CHECK (reflection_mode IN ('companion', 'challenger'));

ALTER TABLE public.journal_analysis
  ADD COLUMN IF NOT EXISTS reflection_mode text
  CHECK (reflection_mode IN ('companion', 'challenger'));

ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS pattern_interrupt_channel text NOT NULL DEFAULT 'push'
  CHECK (pattern_interrupt_channel IN ('push', 'banner', 'off'));

ALTER TABLE public.user_patterns
  ADD COLUMN IF NOT EXISTS distortion_label text,
  ADD COLUMN IF NOT EXISTS last_distortion_seen_at timestamptz;

CREATE TABLE IF NOT EXISTS public.pattern_interrupt_inbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  distortion_label text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  dismissed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

GRANT SELECT, UPDATE ON public.pattern_interrupt_inbox TO authenticated;
GRANT ALL ON public.pattern_interrupt_inbox TO service_role;

ALTER TABLE public.pattern_interrupt_inbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own pattern interrupts" ON public.pattern_interrupt_inbox;
CREATE POLICY "Users can read own pattern interrupts"
  ON public.pattern_interrupt_inbox FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own pattern interrupts" ON public.pattern_interrupt_inbox;
CREATE POLICY "Users can update own pattern interrupts"
  ON public.pattern_interrupt_inbox FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can insert pattern interrupts" ON public.pattern_interrupt_inbox;
CREATE POLICY "Service role can insert pattern interrupts"
  ON public.pattern_interrupt_inbox FOR INSERT TO service_role WITH CHECK (true);

-- ---------- PHASE 2: Voice + Sunday Letters ----------

ALTER TABLE public.journal_analysis
  ADD COLUMN IF NOT EXISTS voice_pace_wpm numeric,
  ADD COLUMN IF NOT EXISTS voice_hesitation_ratio numeric,
  ADD COLUMN IF NOT EXISTS voice_tonal_variability_hz numeric,
  ADD COLUMN IF NOT EXISTS is_voice_entry boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.sunday_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  week_starts_on date NOT NULL,
  body text NOT NULL,
  generated_at timestamptz DEFAULT now(),
  read_at timestamptz,
  UNIQUE(user_id, week_starts_on)
);

GRANT SELECT, UPDATE ON public.sunday_letters TO authenticated;
GRANT ALL ON public.sunday_letters TO service_role;

ALTER TABLE public.sunday_letters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own sunday letters" ON public.sunday_letters;
CREATE POLICY "Users can read own sunday letters"
  ON public.sunday_letters FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own sunday letters" ON public.sunday_letters;
CREATE POLICY "Users can update own sunday letters"
  ON public.sunday_letters FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can insert sunday letters" ON public.sunday_letters;
CREATE POLICY "Service role can insert sunday letters"
  ON public.sunday_letters FOR INSERT TO service_role WITH CHECK (true);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sunday_letter_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sunday_letter_time time NOT NULL DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS sunday_letter_email_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sunday_letter_push_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'UTC';

-- ---------- PHASE 3: E2EE ----------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS e2ee_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS e2ee_kdf_salt text,
  ADD COLUMN IF NOT EXISTS e2ee_passphrase_set_at timestamptz,
  ADD COLUMN IF NOT EXISTS e2ee_sync_fields jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.journals
  ADD COLUMN IF NOT EXISTS is_encrypted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ciphertext text;
ALTER TABLE public.journals ALTER COLUMN content DROP NOT NULL;

ALTER TABLE public.journal_analysis
  ADD COLUMN IF NOT EXISTS is_encrypted boolean NOT NULL DEFAULT false;

-- ---------- PHASE 4: Wearables + MindMap ----------

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

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_integrations TO authenticated;
GRANT ALL ON public.user_integrations TO service_role;

ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own integrations" ON public.user_integrations;
CREATE POLICY "Users can view own integrations"
  ON public.user_integrations FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own integrations" ON public.user_integrations;
CREATE POLICY "Users can insert own integrations"
  ON public.user_integrations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own integrations" ON public.user_integrations;
CREATE POLICY "Users can update own integrations"
  ON public.user_integrations FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own integrations" ON public.user_integrations;
CREATE POLICY "Users can delete own integrations"
  ON public.user_integrations FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER TABLE public.journal_analysis ADD COLUMN IF NOT EXISTS context_signals jsonb;

-- mind_nodes.last_seen_at already exists in current schema; skip.
CREATE INDEX IF NOT EXISTS idx_mind_nodes_user_lastseen
  ON public.mind_nodes (user_id, last_seen_at DESC);

-- ---------- PHASE 5: Clinical & Safety ----------

CREATE TABLE IF NOT EXISTS public.disclaimer_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  feature_key text NOT NULL,
  disclaimer_version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_key, disclaimer_version)
);

GRANT SELECT, INSERT ON public.disclaimer_acceptances TO authenticated;
GRANT ALL ON public.disclaimer_acceptances TO service_role;

ALTER TABLE public.disclaimer_acceptances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own disclaimer acceptances" ON public.disclaimer_acceptances;
CREATE POLICY "Users can view own disclaimer acceptances"
  ON public.disclaimer_acceptances FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own disclaimer acceptances" ON public.disclaimer_acceptances;
CREATE POLICY "Users can insert own disclaimer acceptances"
  ON public.disclaimer_acceptances FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS crisis_detection_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS crisis_detection_locale_approved boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS trusted_contact jsonb;

ALTER TABLE public.journal_analysis
  ADD COLUMN IF NOT EXISTS crisis_signal numeric,
  ADD COLUMN IF NOT EXISTS crisis_signal_threshold_breached boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS public.crisis_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  journal_id uuid REFERENCES public.journals(id) ON DELETE CASCADE,
  signal_score numeric NOT NULL,
  threshold numeric NOT NULL,
  surfaced_at timestamptz NOT NULL DEFAULT now(),
  user_action text CHECK (user_action IN ('called_988', 'called_samaritans', 'contacted_trusted', 'dismissed', 'none')),
  user_action_at timestamptz,
  trusted_notified boolean NOT NULL DEFAULT false
);

GRANT SELECT, UPDATE ON public.crisis_events TO authenticated;
GRANT ALL ON public.crisis_events TO service_role;

ALTER TABLE public.crisis_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own crisis events" ON public.crisis_events;
CREATE POLICY "Users can view own crisis events"
  ON public.crisis_events FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own crisis events" ON public.crisis_events;
CREATE POLICY "Users can update own crisis events"
  ON public.crisis_events FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can insert crisis events" ON public.crisis_events;
CREATE POLICY "Service role can insert crisis events"
  ON public.crisis_events FOR INSERT TO service_role WITH CHECK (true);

-- ---------- PHASE 6: Mentor Personas ----------

CREATE TABLE IF NOT EXISTS public.mentor_personas (
  key text PRIMARY KEY,
  name text NOT NULL,
  voice_block text NOT NULL,
  compatible_modes text[] NOT NULL DEFAULT '{companion,challenger}',
  is_curated boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0
);

GRANT SELECT ON public.mentor_personas TO authenticated;
GRANT ALL ON public.mentor_personas TO service_role;

ALTER TABLE public.mentor_personas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read mentor_personas" ON public.mentor_personas;
CREATE POLICY "Authenticated users can read mentor_personas"
  ON public.mentor_personas FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Service role can manage mentor_personas" ON public.mentor_personas;
CREATE POLICY "Service role can manage mentor_personas"
  ON public.mentor_personas FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_mentor_persona text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS default_mentor_persona text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS you_mentor_profile jsonb;

CREATE TABLE IF NOT EXISTS public.user_persona_switches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  persona_key text NOT NULL,
  switched_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.user_persona_switches TO authenticated;
GRANT ALL ON public.user_persona_switches TO service_role;

ALTER TABLE public.user_persona_switches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own persona switches" ON public.user_persona_switches;
CREATE POLICY "Users can read own persona switches"
  ON public.user_persona_switches FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own persona switches" ON public.user_persona_switches;
CREATE POLICY "Users can insert own persona switches"
  ON public.user_persona_switches FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

INSERT INTO public.mentor_personas (key, name, voice_block, compatible_modes, is_curated, display_order) VALUES
  ('stoic', 'Stoic Sage', 'Respond with measured composure. Reference timeless principles. Use short, declarative sentences. Favor duty and acceptance over complaint. Channel Marcus Aurelius and Epictetus.', '{companion,challenger}', true, 1),
  ('cbt', 'CBT Therapist', 'Use structured Socratic questioning. Reference cognitive behavioral concepts by name. Guide the user to examine evidence. Be warm but precise. Use ''What evidence supports...'' framing.', '{companion,challenger}', true, 2),
  ('no_bs', 'No-BS Friend', 'Be direct and informal. Cut through noise. Use colloquial language. Call out avoidance patterns. Short sentences. No sugarcoating but always on their side.', '{companion,challenger}', true, 3),
  ('coach', 'Journaling Coach', 'Be warm and process-focused. Celebrate the act of writing. Ask curiosity-driven questions. Reference journaling as a practice. Encourage depth and specificity.', '{companion}', true, 4),
  ('future_self', 'Future Self', 'Speak from compassionate hindsight. Use temporal perspective (''Looking back from here...''). Reference growth and change. Be gentle but wise. Offer reassurance from experience.', '{companion}', true, 5)
ON CONFLICT (key) DO NOTHING;

-- ---------- Seed feature flags ----------

INSERT INTO public.feature_flags (key, enabled, rollout_percent, min_tier, config)
VALUES
  ('reflection_mode', true, 100, 'free', '{}'),
  ('pattern_interrupt', true, 100, 'free', '{}'),
  ('voice_entry', true, 100, 'premium', '{}'),
  ('sunday_letter', true, 100, 'premium', '{}'),
  ('e2ee_mode', true, 100, 'premium_plus', '{}'),
  ('wearable_integrations', true, 100, 'premium', '{}'),
  ('living_mindmap', true, 100, 'premium', '{}'),
  ('therapist_bridge', true, 100, 'premium', '{}'),
  ('crisis_detection', true, 100, 'premium', '{}'),
  ('mentor_personas', true, 100, 'premium', '{}')
ON CONFLICT (key) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  rollout_percent = EXCLUDED.rollout_percent,
  min_tier = EXCLUDED.min_tier,
  config = EXCLUDED.config,
  updated_at = now();