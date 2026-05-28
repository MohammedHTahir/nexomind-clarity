-- Cross-cutting infrastructure for competitive roadmap (Phase 1)

-- 1. Feature Flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  rollout_percent integer NOT NULL DEFAULT 0 CHECK (rollout_percent >= 0 AND rollout_percent <= 100),
  min_tier text NOT NULL DEFAULT 'free' CHECK (min_tier IN ('free', 'premium', 'premium_plus')),
  config jsonb DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read feature flags"
  ON public.feature_flags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert feature flags"
  ON public.feature_flags FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update feature flags"
  ON public.feature_flags FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete feature flags"
  ON public.feature_flags FOR DELETE
  TO service_role
  USING (true);

-- 2. profiles.reflection_mode
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reflection_mode text NOT NULL DEFAULT 'companion'
  CHECK (reflection_mode IN ('companion', 'challenger'));

-- 3. journal_analysis.reflection_mode
ALTER TABLE public.journal_analysis
  ADD COLUMN IF NOT EXISTS reflection_mode text
  CHECK (reflection_mode IN ('companion', 'challenger'));

-- 4. notification_preferences.pattern_interrupt_channel
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS pattern_interrupt_channel text NOT NULL DEFAULT 'push'
  CHECK (pattern_interrupt_channel IN ('push', 'banner', 'off'));

-- 5. user_patterns distortion columns
ALTER TABLE public.user_patterns
  ADD COLUMN IF NOT EXISTS distortion_label text,
  ADD COLUMN IF NOT EXISTS last_distortion_seen_at timestamptz;

-- 6. pattern_interrupt_inbox table
CREATE TABLE IF NOT EXISTS public.pattern_interrupt_inbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  distortion_label text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  dismissed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.pattern_interrupt_inbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own pattern interrupts"
  ON public.pattern_interrupt_inbox FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own pattern interrupts"
  ON public.pattern_interrupt_inbox FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can insert pattern interrupts"
  ON public.pattern_interrupt_inbox FOR INSERT
  TO service_role
  WITH CHECK (true);
