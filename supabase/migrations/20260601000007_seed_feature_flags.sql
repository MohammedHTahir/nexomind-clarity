-- Seed all feature flags for development (enabled=true, rollout_percent=100).
-- In production, scale back rollout_percent as needed for gradual rollout.

INSERT INTO public.feature_flags (key, enabled, rollout_percent, min_tier, config)
VALUES
  ('reflection_mode', true, 100, 'free', '{}'),
  ('pattern_interrupt', true, 100, 'free', '{}'),
  ('voice_entry', true, 100, 'premium', '{}'),
  ('sunday_letter', true, 100, 'premium', '{}'),
  ('e2ee_mode', true, 100, 'premium_plus', '{}'),
  ('wearable_integrations', true, 100, 'premium', '{}'),
  ('living_mindmap', true, 100, 'premium', '{}'),
  ('therapist_bridge', true, 100, 'premium', '{}'),
  ('crisis_detection', true, 100, 'premium', '{}'),
  ('mentor_personas', true, 100, 'premium', '{}')
ON CONFLICT (key) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  rollout_percent = EXCLUDED.rollout_percent,
  min_tier = EXCLUDED.min_tier,
  config = EXCLUDED.config,
  updated_at = now();
