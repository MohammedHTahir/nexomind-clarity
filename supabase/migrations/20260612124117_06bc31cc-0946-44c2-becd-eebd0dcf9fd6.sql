
-- promo_codes
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  tier text NOT NULL DEFAULT 'premium_plus',
  free_months integer NOT NULL DEFAULT 2,
  expires_at timestamptz NOT NULL,
  max_redemptions integer,
  redemption_count integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_codes TO service_role;

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active codes"
  ON public.promo_codes FOR SELECT
  TO authenticated
  USING (active = true);

CREATE TRIGGER promo_codes_set_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- promo_redemptions
CREATE TABLE public.promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  granted_until timestamptz NOT NULL,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);

GRANT SELECT ON public.promo_redemptions TO authenticated;
GRANT ALL ON public.promo_redemptions TO service_role;

ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own redemptions"
  ON public.promo_redemptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Atomic redemption function (service role only)
CREATE OR REPLACE FUNCTION public.redeem_promo_code(
  _user_id uuid,
  _code text,
  _environment text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code public.promo_codes%ROWTYPE;
  v_granted_until timestamptz;
  v_price_id text;
BEGIN
  SELECT * INTO v_code FROM public.promo_codes
    WHERE code = upper(_code) AND active = true
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_code');
  END IF;

  IF v_code.expires_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'code_expired');
  END IF;

  IF v_code.max_redemptions IS NOT NULL AND v_code.redemption_count >= v_code.max_redemptions THEN
    RETURN jsonb_build_object('ok', false, 'error', 'code_exhausted');
  END IF;

  IF EXISTS (SELECT 1 FROM public.promo_redemptions WHERE user_id = _user_id AND code = v_code.code) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_redeemed');
  END IF;

  v_granted_until := now() + (v_code.free_months || ' months')::interval;

  IF v_code.tier = 'premium_plus' THEN
    v_price_id := 'premium_plus_monthly_49';
  ELSE
    v_price_id := 'premium_monthly';
  END IF;

  INSERT INTO public.promo_redemptions (user_id, code, granted_until, environment)
    VALUES (_user_id, v_code.code, v_granted_until, _environment);

  UPDATE public.promo_codes
    SET redemption_count = redemption_count + 1
    WHERE id = v_code.id;

  INSERT INTO public.subscriptions (
    user_id, status, price_id, current_period_end, environment,
    stripe_subscription_id, cancel_at_period_end
  ) VALUES (
    _user_id, 'trialing', v_price_id, v_granted_until, _environment,
    'promo_' || v_code.code || '_' || _user_id::text, true
  )
  ON CONFLICT (user_id, environment) DO UPDATE
    SET status = 'trialing',
        price_id = v_price_id,
        current_period_end = GREATEST(
          public.subscriptions.current_period_end,
          v_granted_until
        ),
        cancel_at_period_end = true,
        updated_at = now();

  RETURN jsonb_build_object(
    'ok', true,
    'tier', v_code.tier,
    'granted_until', v_granted_until
  );
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_promo_code(uuid, text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_promo_code(uuid, text, text) TO service_role;

-- Seed launch code: LAUNCH2MO, valid 7 days, 2 months Premium+
INSERT INTO public.promo_codes (code, tier, free_months, expires_at)
VALUES ('LAUNCH2MO', 'premium_plus', 2, now() + interval '7 days');
