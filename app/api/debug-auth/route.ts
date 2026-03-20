import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword, verifyPassword } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('s')
  if (secret !== 'debug123') return NextResponse.json({ error: 'no' }, { status: 401 })

  const results: Record<string, unknown> = {}

  // 1. Test DB connection
  try {
    const sb = createServiceClient()
    const { data, error } = await sb.from('admins').select('id, email, password_hash').limit(5)
    results.admins_query = { data, error: error?.message, code: error?.code }
  } catch (e) { results.admins_query = { exception: String(e) } }

  // 2. Test users table
  try {
    const sb = createServiceClient()
    const { count, error } = await sb.from('users').select('*', { count: 'exact', head: true })
    results.users_count = { count, error: error?.message }
  } catch (e) { results.users_count = { exception: String(e) } }

  // 3. Test hash/verify
  const testHash = hashPassword('Admin@123')
  results.hash_test = {
    hash: testHash,
    verify_correct: verifyPassword('Admin@123', testHash),
    verify_wrong: verifyPassword('wrong', testHash),
  }

  // 4. Try inserting admin
  try {
    const sb = createServiceClient()
    const hash = hashPassword('Admin@123')
    const { data, error } = await sb.from('admins')
      .upsert({ email: 'amnamubeen516@gmail.com', password_hash: hash, full_name: 'Amna Mubeen' }, { onConflict: 'email' })
      .select('id, email')
    results.admin_upsert = { data, error: error?.message, code: error?.code }
  } catch (e) { results.admin_upsert = { exception: String(e) } }

  // 5. Verify the stored hash
  try {
    const sb = createServiceClient()
    const { data } = await sb.from('admins').select('password_hash').eq('email', 'amnamubeen516@gmail.com').single()
    if (data?.password_hash) {
      results.verify_stored = {
        hash_stored: data.password_hash,
        verify_Admin123: verifyPassword('Admin@123', data.password_hash),
      }
    }
  } catch (e) { results.verify_stored = { exception: String(e) } }

  return NextResponse.json(results, { status: 200 })
}
