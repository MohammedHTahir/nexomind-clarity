DROP POLICY IF EXISTS "Users can only access their own subscription channels" ON realtime.messages;

CREATE POLICY "Users can only access their own subscription channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() LIKE 'subscriptions:%'
  AND realtime.topic() LIKE ('subscriptions:' || auth.uid()::text || ':%')
);