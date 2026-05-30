CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
DECLARE
  v_url text := 'https://ltwnshkruuotjdcqikgf.supabase.co/functions/v1/';
  r record;
BEGIN
  FOR r IN SELECT jobid FROM cron.job WHERE jobname IN
    ('weekly-sunday-letter','daily-compute-patterns','daily-fire-pattern-interrupts')
  LOOP
    PERFORM cron.unschedule(r.jobid);
  END LOOP;

  PERFORM cron.schedule('weekly-sunday-letter', '0 8 * * 0',
    format($q$ SELECT net.http_post(url := %L, headers := jsonb_build_object('Content-Type','application/json'), body := '{}'::jsonb); $q$,
      v_url || 'generate-sunday-letter'));

  PERFORM cron.schedule('daily-compute-patterns', '15 3 * * *',
    format($q$ SELECT net.http_post(url := %L, headers := jsonb_build_object('Content-Type','application/json'), body := '{}'::jsonb); $q$,
      v_url || 'compute-patterns'));

  PERFORM cron.schedule('daily-fire-pattern-interrupts', '0 14 * * *',
    format($q$ SELECT net.http_post(url := %L, headers := jsonb_build_object('Content-Type','application/json'), body := '{}'::jsonb); $q$,
      v_url || 'fire-pattern-interrupts'));
END $$;