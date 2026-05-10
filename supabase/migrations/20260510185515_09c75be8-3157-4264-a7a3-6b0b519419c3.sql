CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can submit a contact form
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(name)) > 0 AND length(name) <= 100
  AND length(trim(email)) > 0 AND length(email) <= 255 AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(trim(message)) >= 5 AND length(message) <= 2000
);

-- No public read/update/delete — submissions are only visible via service role.
