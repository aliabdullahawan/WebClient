import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyPassword, isValidEmail } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, isAdmin } = body

    if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    if (!isValidEmail(email)) return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })

    const supabase = createServiceClient()

    if (isAdmin) {
      const { data: admin, error } = await supabase
        .from('admins')
        .select('id, email, full_name, password_hash')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (error) {
        console.error('[admin login] DB error:', error.message, error.code)
        if (error.code === '42P01') return NextResponse.json({ error: 'Database tables not found. Please run DATABASE.sql in Supabase first.' }, { status: 500 })
        if (error.code === 'PGRST116') return NextResponse.json({ error: 'Admin account not found. Please visit /api/admin/setup-password?secret=CM_SETUP_2024 first.' }, { status: 401 })
        return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 })
      }

      if (!admin?.password_hash) return NextResponse.json({ error: 'Admin password not set. Visit /api/admin/setup-password?secret=CM_SETUP_2024' }, { status: 401 })

      const valid = verifyPassword(password, admin.password_hash)
      if (!valid) return NextResponse.json({ error: 'Incorrect password. Make sure you ran the setup endpoint.' }, { status: 401 })

      const cookieStore = await cookies()
      cookieStore.set('admin_session', JSON.stringify({
        id: admin.id, email: admin.email, name: admin.full_name, role: 'admin', loginAt: Date.now()
      }), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' })

      return NextResponse.json({ success: true, user: { id: admin.id, email: admin.email, name: admin.full_name, role: 'admin' } })

    } else {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, full_name, password_hash, is_blocked, avatar_id')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (error) {
        console.error('[user login] DB error:', error.message, error.code)
        if (error.code === '42P01') return NextResponse.json({ error: 'Database tables not found. Please run DATABASE.sql in Supabase.' }, { status: 500 })
        if (error.code === 'PGRST116') return NextResponse.json({ error: 'No account found with this email. Please sign up first.' }, { status: 401 })
        return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 })
      }

      if (!user) return NextResponse.json({ error: 'No account found. Please sign up first.' }, { status: 401 })
      if (user.is_blocked) return NextResponse.json({ error: 'Your account has been blocked. Contact support.' }, { status: 403 })
      if (!user.password_hash) return NextResponse.json({ error: 'This account uses Google sign-in.' }, { status: 400 })

      const valid = verifyPassword(password, user.password_hash)
      if (!valid) return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })

      const cookieStore = await cookies()
      cookieStore.set('user_session', JSON.stringify({
        id: user.id, email: user.email, name: user.full_name, avatar_id: user.avatar_id, role: 'user', loginAt: Date.now()
      }), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' })

      return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.full_name, role: 'user' } })
    }
  } catch (err) {
    console.error('[login] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error: ' + String(err) }, { status: 500 })
  }
}
