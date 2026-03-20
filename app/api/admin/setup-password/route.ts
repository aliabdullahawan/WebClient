import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'

const SALT = 'aabbccdd11223344aabbccdd11223344'
const HASH = createHash('sha256').update(SALT + 'Admin@123').digest('hex')
const PASSWORD_HASH = `${SALT}$${HASH}`

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== 'CM_SETUP_2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Step 1: Try to delete existing
  await supabase.from('admins').delete().eq('email', 'amnamubeen516@gmail.com')

  // Step 2: Insert fresh
  const { data, error } = await supabase
    .from('admins')
    .insert({ email: 'amnamubeen516@gmail.com', password_hash: PASSWORD_HASH, full_name: 'Amna Mubeen' })
    .select('id, email, full_name')
    .single()

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      fix: error.code === '42501'
        ? 'RLS is blocking. Run this SQL in Supabase: ALTER TABLE admins DISABLE ROW LEVEL SECURITY; ALTER TABLE users DISABLE ROW LEVEL SECURITY;'
        : error.code === '42P01'
        ? 'Table does not exist. Run DATABASE.sql in Supabase SQL Editor first.'
        : 'Unknown error - check Supabase logs',
    }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    admin: data,
    message: 'Done! Now login at /login?admin=1',
    credentials: { email: 'amnamubeen516@gmail.com', password: 'Admin@123' }
  })
}
