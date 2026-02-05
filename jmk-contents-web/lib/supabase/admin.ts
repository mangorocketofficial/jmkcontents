import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from './types'

/**
 * Admin client for server-side operations without cookies
 * Uses service role key with RLS bypass
 * Should ONLY be used in server-side code, never in client code
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
