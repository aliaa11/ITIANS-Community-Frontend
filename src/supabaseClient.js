import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const token = localStorage.getItem('access-token');

if (token) {
  supabase.auth.setSession({
    access_token: token,
  }).catch(console.error);
}


