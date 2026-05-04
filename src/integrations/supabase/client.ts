import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// These env vars are defined in vite.config.ts which maps from NEXT_PUBLIC_SUPABASE_* or SUPABASE_*
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

console.log('[v0] Supabase URL:', SUPABASE_URL ? 'Set' : 'NOT SET');
console.log('[v0] Supabase Anon Key:', SUPABASE_ANON_KEY ? 'Set' : 'NOT SET');

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});
