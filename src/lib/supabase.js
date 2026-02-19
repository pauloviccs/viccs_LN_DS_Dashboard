import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage by default
    persistSession: true,
    // Auto-refresh session before it expires
    autoRefreshToken: true,
    // Detect session from localStorage on page load
    detectSessionInUrl: true,
    // Storage key for session persistence
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Storage key name
    storageKey: 'sb-auth-token'
  }
})
