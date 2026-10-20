// ============================================================================
// CENTRALIZED SUPABASE CLIENT
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Validates whether Supabase connection parameters are present.
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-ref')
  );
};

// Fallback dummy URL and anon key to prevent runtime instantiation errors if .env is not yet filled
const fallbackUrl = 'https://placeholder-project.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

if (!isSupabaseConfigured()) {
  console.warn(
    '[Supabase] Missing or incomplete VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in your .env file. ' +
    'The application will run in offline prototype mode until Supabase credentials are provided.'
  );
}

/**
 * Shared Supabase Client with full database type definitions.
 */
export const supabase = createClient<Database>(
  isSupabaseConfigured() ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured() ? supabaseAnonKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
