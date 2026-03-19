import { createClient as createSupabaseClient } from '@supabase/supabase-js'
// database types

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export function createBrowserClient() {
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in .env.local')
  return createSupabaseClient(url, anonKey)
}

export function createServiceClient() {
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in .env.local — please check your .env.local file')
  return createSupabaseClient(url, serviceKey || anonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// Alias for backwards compatibility
export const createAnonClient = createBrowserClient
