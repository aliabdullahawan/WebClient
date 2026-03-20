import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyPassword, isValidEmail } from '@/lib/auth'
import { cookies } from 'next/headers'

function dbErrCode(err: unknown): string { return (err as any)?.code ?? '' }
function dbErrMsg(err: unknown): string { return (err as any)?.message ?? String(err) }

export async function POST(req: NextRequest) {
  try {
    const { email, password, isAdmin } = await req.json()

    if (!email?.trim() || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    if (!isValidEmail(email)) return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })

    const supabase = createServiceClient()

    if (isAdmin) {
      const { data: admin, error } = await supabase
        .from('admins').select('id, email, full_name, password_hash')
        .eq('email', email.toLowerCase().trim()).single()

      if (dbErrCode(error) === '42P01') return NextResponse.json({ error: 'DB tables missing. Run DATABASE.sql and FIX_AUTH_NOW.sql in Supabase SQL Editor.' }, { status: 500 })
      if (dbErrCode(error) === 'PGRST116' || !admin) return NextResponse.json({ error: 'Admin not found. Visit: /api/admin/setup-password?secret=CM_SETUP_2024' }, { status: 401 })
      if (error) return NextResponse.json({ error: `DB error [${dbErrCode(error)}]: ${dbErrMsg(error)}` }, { status: 500 })

      const valid = verifyPassword(password, admin.password_hash)
      if (!valid) return NextResponse.json({ error: 'Wrong password. Visit /api/admin/setup-password?secret=CM_SETUP_2024 to reset.' }, { status: 401 })

      const cookieStore = await cookies()
      cookieStore.set('admin_session', JSON.stringify({
        id: admin.id, email: admin.email, name: admin.full_name, role: 'admin', loginAt: Date.now()
      }), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' })

      return NextResponse.json({ success: true, user: { id: admin.id, email: admin.email, name: admin.full_name, role: 'admin' } })

    } else {
      const { data: user, error } = await supabase
        .from('users').select('id, email, full_name, password_hash, is_blocked, avatar_id')
        .eq('email', email.toLowerCase().trim()).single()

      if (dbErrCode(error) === '42P01') return NextResponse.json({ error: 'DB tables missing. Run DATABASE.sql in Supabase SQL Editor.' }, { status: 500 })
      if (dbErrCode(error) === 'PGRST116' || !user) return NextResponse.json({ error: 'No account found with this email. Please sign up first.' }, { status: 401 })
      if (error) return NextResponse.json({ error: `DB error [${dbErrCode(error)}]: ${dbErrMsg(error)}` }, { status: 500 })

      if (user.is_blocked) return NextResponse.json({ error: 'Account blocked. Contact support.' }, { status: 403 })
      if (!user.password_hash) return NextResponse.json({ error: 'This account uses Google Sign-In.' }, { status: 400 })

      const valid = verifyPassword(password, user.password_hash)
      if (!valid) return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })

      const cookieStore = await cookies()
      cookieStore.set('user_session', JSON.stringify({
        id: user.id, email: user.email, name: user.full_name, avatar_id: user.avatar_id, role: 'user', loginAt: Date.now()
      }), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' })

      return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.full_name, role: 'user' } })
    }
  } catch (err) {
    console.error('[login] crash:', err)
    return NextResponse.json({ error: `Server crash: ${String(err)}` }, { status: 500 })
  }
}
