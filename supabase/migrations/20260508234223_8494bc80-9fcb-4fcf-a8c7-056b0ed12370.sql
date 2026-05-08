REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO service_role;
-- Same hardening for the existing is_premium helper
REVOKE EXECUTE ON FUNCTION public.is_premium(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_premium(uuid) TO service_role;