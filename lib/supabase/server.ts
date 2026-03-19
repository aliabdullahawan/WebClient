import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// These must be in .env.local — hardcoded fallback for dev only
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ppsulgueckychgazdjbr.supabase.co'
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwc3VsZ3VlY2t5Y2hnYXpkamJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzIyMzUsImV4cCI6MjA4ODUwODIzNX0.0ThqHJ9UOpG0-B4LhUPc76HihW-qu5qssFdDmaFDIRo'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwc3VsZ3VlY2t5Y2hnYXpkamJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkzMjIzNSwiZXhwIjoyMDg4NTA4MjM1fQ.yavMX5tBARx9oVm72JYx5f1v9LeSnL0diH53uNIwrlA'

export function createServiceClient() {
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export function createBrowserClient() {
  return createSupabaseClient(url, anonKey)
}

// Alias
export const createAnonClient = createBrowserClient
