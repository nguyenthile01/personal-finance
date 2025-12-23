import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to your .env (see README)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // set a custom storage key if you want
  storage: undefined, // optional custom storage adapter
  auth: {
    persistSession: false,
    detectSessionInUrl: false,
  }
});
export default supabase;