
-- Pattern Interrupts: detect when users spiral and proactively interrupt with calm pushes

-- User notification preferences (one row per user)
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id uuid PRIMARY KEY,
  pattern_interrupts_enabled boolean NOT NULL DEFAULT true,
  email_for_interrupts text,
  timezone text NOT NULL DEFAULT 'UTC',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "np_select_own" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "np_insert_own" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "np_update_own" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "np_delete_own" ON public.notification_preferences FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER np_set_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Detected patterns
CREATE TABLE IF NOT EXISTS public.user_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pattern_type text NOT NULL DEFAULT 'time_of_week',
  day_of_week smallint NOT NULL,
  hour_of_day smallint NOT NULL,
  theme_node_id uuid,
  theme_label text,
  sample_size integer NOT NULL DEFAULT 0,
  confidence numeric NOT NULL DEFAULT 0,
  last_fired_at timestamptz,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, pattern_type, day_of_week, hour_of_day)
);
ALTER TABLE public.user_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "up_select_own" ON public.user_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "up_insert_own" ON public.user_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "up_update_own" ON public.user_patterns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "up_delete_own" ON public.user_patterns FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS user_patterns_user_idx ON public.user_patterns(user_id);
CREATE INDEX IF NOT EXISTS user_patterns_dow_hour_idx ON public.user_patterns(day_of_week, hour_of_day);
