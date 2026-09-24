import { createClient } from '@supabase/supabase-js';

// Ambil dari Supabase Dashboard > Project Settings > API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Dipakai di sisi client (browser) - untuk admin dashboard
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Dipakai di sisi server (API routes) - pakai service_role key, LEBIH BERKUASA,
// jangan pernah expose ke browser/frontend
export function getSupabaseAdmin() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}