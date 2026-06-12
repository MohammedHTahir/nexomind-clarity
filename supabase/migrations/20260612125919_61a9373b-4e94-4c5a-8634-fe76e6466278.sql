DROP POLICY IF EXISTS "Authenticated users can view active codes" ON public.promo_codes;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.promo_codes FROM authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.promo_codes FROM anon;