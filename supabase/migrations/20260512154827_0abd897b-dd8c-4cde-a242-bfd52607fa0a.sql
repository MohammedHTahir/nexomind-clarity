
-- Explicit service-role-only SELECT policies (defense in depth)
CREATE POLICY "Service role can read contact submissions"
ON public.contact_submissions FOR SELECT
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can read email leads"
ON public.email_leads FOR SELECT
USING (auth.role() = 'service_role');

-- Harden SECURITY DEFINER helper functions: pin search_path and restrict EXECUTE
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pg_temp;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pg_temp;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
