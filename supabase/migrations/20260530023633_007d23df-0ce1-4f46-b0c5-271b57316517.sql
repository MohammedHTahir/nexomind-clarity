-- Secure the cron jobs (sunday letter, compute-patterns, fire-pattern-interrupts)
-- so they pass the service-role key as Bearer Authorization header. The edge
-- functions now reject any request that doesn't present this internal key.
DO $$
DECLARE
  v_url text := 'https://ltwnshkruuotjdcqikgf.supabase.co/functions/v1/';
  v_key text;
  r record;
BEGIN
  -- Reuse the service-role key already stored in vault by the email infra setup.
  SELECT decrypted_secret INTO v_key
    FROM vault.decrypted_secrets
    WHERE name = 'email_queue_service_role_key'
    LIMIT 1;

  IF v_key IS NULL THEN
    RAISE EXCEPTION 'Vault secret email_queue_service_role_key not found. Run the email infra setup first so the service-role key is stored in vault.';
  END IF;

  FOR r IN SELECT jobid FROM cron.job WHERE jobname IN
    ('weekly-sunday-letter','daily-compute-patterns','daily-fire-pattern-interrupts')
  LOOP
    PERFORM cron.unschedule(r.jobid);
  END LOOP;

  PERFORM cron.schedule('weekly-sunday-letter', '0 8 * * 0',
    format($q$ SELECT net.http_post(
      url := %L,
      headers := jsonb_build_object('Content-Type','application/json','Authorization', %L),
      body := '{}'::jsonb
    ); $q$, v_url || 'generate-sunday-letter', 'Bearer ' || v_key));

  PERFORM cron.schedule('daily-compute-patterns', '15 3 * * *',
    format($q$ SELECT net.http_post(
      url := %L,
      headers := jsonb_build_object('Content-Type','application/json','Authorization', %L),
      body := '{}'::jsonb
    ); $q$, v_url || 'compute-patterns', 'Bearer ' || v_key));

  PERFORM cron.schedule('daily-fire-pattern-interrupts', '0 14 * * *',
    format($q$ SELECT net.http_post(
      url := %L,
      headers := jsonb_build_object('Content-Type','application/json','Authorization', %L),
      body := '{}'::jsonb
    ); $q$, v_url || 'fire-pattern-interrupts', 'Bearer ' || v_key));
END $$;