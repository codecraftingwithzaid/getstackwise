import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client using the service role key. NEVER import this
 * into a client component — the service role key must stay on the server.
 * Returns null when Supabase isn't configured so the app/pipeline can degrade
 * gracefully instead of crashing.
 */
let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn('[supabase] Not configured — set SUPABASE_SERVICE_ROLE_KEY');
    return null;
  }
  _admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}

export const CONTENT_QUEUE_TABLE = 'content_queue';
export const POST_PERFORMANCE_TABLE = 'post_performance';
