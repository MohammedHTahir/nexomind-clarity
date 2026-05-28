-- Phase 6: Mentor Personas + Progressive You-Mentor

-- Table: mentor_personas (curated + custom personas)
CREATE TABLE IF NOT EXISTS public.mentor_personas (
  key text PRIMARY KEY,
  name text NOT NULL,
  voice_block text NOT NULL,
  compatible_modes text[] NOT NULL DEFAULT '{companion,challenger}',
  is_curated boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0
);

ALTER TABLE public.mentor_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mentor_personas"
  ON public.mentor_personas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage mentor_personas"
  ON public.mentor_personas FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Alter profiles for persona support
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_mentor_persona text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS default_mentor_persona text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS you_mentor_profile jsonb;

-- Table: user_persona_switches (rate limiting + audit)
CREATE TABLE IF NOT EXISTS public.user_persona_switches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  persona_key text NOT NULL,
  switched_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_persona_switches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own persona switches"
  ON public.user_persona_switches FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own persona switches"
  ON public.user_persona_switches FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Seed 5 curated personas
INSERT INTO public.mentor_personas (key, name, voice_block, compatible_modes, is_curated, display_order) VALUES
  ('stoic', 'Stoic Sage', 'Respond with measured composure. Reference timeless principles. Use short, declarative sentences. Favor duty and acceptance over complaint. Channel Marcus Aurelius and Epictetus.', '{companion,challenger}', true, 1),
  ('cbt', 'CBT Therapist', 'Use structured Socratic questioning. Reference cognitive behavioral concepts by name. Guide the user to examine evidence. Be warm but precise. Use ''What evidence supports...'' framing.', '{companion,challenger}', true, 2),
  ('no_bs', 'No-BS Friend', 'Be direct and informal. Cut through noise. Use colloquial language. Call out avoidance patterns. Short sentences. No sugarcoating but always on their side.', '{companion,challenger}', true, 3),
  ('coach', 'Journaling Coach', 'Be warm and process-focused. Celebrate the act of writing. Ask curiosity-driven questions. Reference journaling as a practice. Encourage depth and specificity.', '{companion}', true, 4),
  ('future_self', 'Future Self', 'Speak from compassionate hindsight. Use temporal perspective (''Looking back from here...''). Reference growth and change. Be gentle but wise. Offer reassurance from experience.', '{companion}', true, 5)
ON CONFLICT (key) DO NOTHING;
