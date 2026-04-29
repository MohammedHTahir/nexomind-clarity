
-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- journals
CREATE TABLE public.journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
CREATE INDEX journals_user_id_created_at_idx ON public.journals(user_id, created_at DESC);

CREATE POLICY "journals_select_own" ON public.journals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "journals_insert_own" ON public.journals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journals_update_own" ON public.journals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "journals_delete_own" ON public.journals FOR DELETE USING (auth.uid() = user_id);

-- journal_analysis
CREATE TABLE public.journal_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL UNIQUE REFERENCES public.journals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary TEXT,
  emotional_state TEXT,
  intensity_score INT,
  clarity_score INT,
  cognitive_patterns JSONB DEFAULT '[]'::jsonb,
  key_thoughts JSONB DEFAULT '[]'::jsonb,
  distortions_or_biases JSONB DEFAULT '[]'::jsonb,
  clarity_insight TEXT,
  suggested_reflection TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.journal_analysis ENABLE ROW LEVEL SECURITY;
CREATE INDEX journal_analysis_user_id_idx ON public.journal_analysis(user_id, created_at DESC);

CREATE POLICY "analysis_select_own" ON public.journal_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "analysis_insert_own" ON public.journal_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "analysis_update_own" ON public.journal_analysis FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "analysis_delete_own" ON public.journal_analysis FOR DELETE USING (auth.uid() = user_id);
