import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword, verifyPassword, isValidEmail } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { email, password, isAdmin } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const supabase = createServiceClient()

    if (isAdmin) {
      // Admin login
      const { data: admin, error } = await supabase
        .from('admins')
        .select('id, email, full_name, password_hash')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (error || !admin) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      const valid = await verifyPassword(password, admin.password_hash)
      if (!valid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      const sessionData = {
        id: admin.id,
        email: admin.email,
        name: admin.full_name,
        role: 'admin',
        loginAt: Date.now(),
      }

      const cookieStore = await cookies()
      cookieStore.set('admin_session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return NextResponse.json({ success: true, user: { id: admin.id, email: admin.email, name: admin.full_name, role: 'admin' } })
    } else {
      // User login
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, full_name, password_hash, is_blocked, avatar_id, google_id')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (error || !user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
      if (user.is_blocked) {
        return NextResponse.json({ error: 'Your account has been blocked. Please contact support.' }, { status: 403 })
      }
      if (!user.password_hash) {
        return NextResponse.json({ error: 'This account uses Google sign-in. Please login with Google.' }, { status: 400 })
      }

      const valid = await verifyPassword(password, user.password_hash)
      if (!valid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      const sessionData = {
        id: user.id,
        email: user.email,
        name: user.full_name,
        avatar_id: user.avatar_id,
        role: 'user',
        loginAt: Date.now(),
      }

      const cookieStore = await cookies()
      cookieStore.set('user_session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })

      return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.full_name, role: 'user' } })
    }
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
