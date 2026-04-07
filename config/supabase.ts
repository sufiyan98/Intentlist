/**
 * Supabase Client Configuration
 * Phase 2: Remote database with Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '@/config';

// ============================================
// Supabase Client
// ============================================

const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using local-only mode.');
}

/**
 * Supabase client instance
 * Use this for all Supabase operations
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : null;

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = !!supabase;

/**
 * Get the Supabase client or throw if not configured
 */
export function getSupabaseOrThrow(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase is not configured. Check .env file.');
  }
  return supabase;
}
