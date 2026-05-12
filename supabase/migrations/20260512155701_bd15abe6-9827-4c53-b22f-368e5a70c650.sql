-- Restrict Realtime channel subscriptions: a user may only join channels named
-- "subscriptions:<their-uid>:..." preventing eavesdropping on other users' subscription events.
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only access their own subscription channels" ON realtime.messages;

CREATE POLICY "Users can only access their own subscription channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Allow non-"subscriptions:" topics to pass through (other features), and
  -- restrict "subscriptions:<uid>:..." topics to the owning user.
  CASE
    WHEN realtime.topic() LIKE 'subscriptions:%'
      THEN realtime.topic() LIKE ('subscriptions:' || auth.uid()::text || ':%')
    ELSE true
  END
);
