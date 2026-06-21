
REVOKE EXECUTE ON FUNCTION public.notify_admin_signup() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.notify_admin_signup() TO service_role;
