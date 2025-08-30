import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key_for_demo'
  
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey
  )
}

// Singleton instance for browser usage
let supabase: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!supabase) {
    supabase = createClient()
  }
  return supabase
}