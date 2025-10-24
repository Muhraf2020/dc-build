// lib/supabase.ts
// Use the “edge” build of supabase-js.  This avoids importing Node core
// modules that are unavailable in Cloudflare’s workerd runtime:contentReference[oaicite:0]{index=0}.
import { createClient } from '@supabase/supabase-js/edge';

/**
 * Create a Supabase client.  On Cloudflare the credentials are injected through
 * the `process.env` polyfill when `nodejs_compat` is enabled, or can be passed
 * via the `env` parameter in a worker handler:contentReference[oaicite:1]{index=1}.
 */
export function createSupabaseClient(
  supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase credentials are missing.  Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Cloudflare.'
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}
