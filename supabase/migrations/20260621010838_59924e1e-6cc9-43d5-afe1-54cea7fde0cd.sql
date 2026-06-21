
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.notify_admin_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  fn_url text;
  service_key text;
BEGIN
  fn_url := 'https://ltwnshkruuotjdcqikgf.supabase.co/functions/v1/send-transactional-email';
  service_key := current_setting('app.settings.service_role_key', true);
  IF service_key IS NULL OR service_key = '' THEN
    -- fallback: read from vault if available
    BEGIN
      SELECT decrypted_secret INTO service_key FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      service_key := NULL;
    END;
  END IF;

  PERFORM net.http_post(
    url := fn_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(service_key, '')
    ),
    body := jsonb_build_object(
      'templateName', 'admin-notification',
      'idempotencyKey', 'admin-signup-' || NEW.id::text,
      'templateData', jsonb_build_object(
        'event', 'signup',
        'email', NEW.email,
        'name', NEW.display_name,
        'userId', NEW.id::text
      )
    )
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- never block signups on notification failure
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_admin_on_profile_insert ON public.profiles;
CREATE TRIGGER notify_admin_on_profile_insert
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_signup();
