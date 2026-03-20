import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'

// Fixed salt - same every time so the SQL file and this endpoint produce identical hashes
const FIXED_SALT = 'aabbccdd11223344aabbccdd11223344'

function makeAdminHash(password: string): string {
  const hash = createHash('sha256').update(FIXED_SALT + password).digest('hex')
  return `${FIXED_SALT}$${hash}`
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== 'CM_SETUP_2024') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const supabase = createServiceClient()
    const hash = makeAdminHash('Admin@123')

    // Try upsert
    const { data, error } = await supabase
      .from('admins')
      .upsert(
        { email: 'amnamubeen516@gmail.com', password_hash: hash, full_name: 'Amna Mubeen' },
        { onConflict: 'email' }
      )
      .select('id, email')
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        hint: error.code === '42501' ? 'RLS is blocking insert. Run FIX_AUTH_NOW.sql in Supabase SQL Editor.' : 'Check Supabase dashboard',
        sql_fix: `DELETE FROM admins WHERE email = 'amnamubeen516@gmail.com'; INSERT INTO admins (email, password_hash, full_name) VALUES ('amnamubeen516@gmail.com', '${hash}', 'Amna Mubeen');`
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Admin ready. Login at /login?admin=1 with password: Admin@123',
      admin: data,
      hash_stored: hash
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
