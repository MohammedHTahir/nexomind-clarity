ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_key;
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_unique;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_env_unique UNIQUE (user_id, environment);