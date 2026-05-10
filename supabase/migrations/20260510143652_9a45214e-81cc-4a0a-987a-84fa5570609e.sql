-- Email leads / newsletter signups
CREATE TABLE public.email_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'footer',
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX email_leads_email_lower_idx ON public.email_leads (lower(email));

ALTER TABLE public.email_leads ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or authed) can subscribe their email. No SELECT/UPDATE/DELETE
-- policies → table is write-only from the client; reads go through admin.
CREATE POLICY "Anyone can subscribe"
ON public.email_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) BETWEEN 3 AND 320
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);