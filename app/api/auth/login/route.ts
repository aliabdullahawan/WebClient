import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyPassword, isValidEmail } from '@/lib/auth'
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
      const { data: admin, error: dbError } = await supabase
        .from('admins')
        .select('id, email, full_name, password_hash')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (dbError) {
        console.error('Admin DB error:', dbError.message, dbError.code)
        // If table doesn't exist or RLS issue
        if (dbError.code === '42P01') {
          return NextResponse.json({ error: 'Database not set up yet. Please run DATABASE.sql in Supabase.' }, { status: 500 })
        }
        return NextResponse.json({ error: 'Admin account not found. Check email or run setup.' }, { status: 401 })
      }

      if (!admin) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      if (!admin.password_hash) {
        return NextResponse.json({ error: 'Admin password not set. Visit /api/admin/setup-password?secret=CM_SETUP_2024' }, { status: 500 })
      }

      const valid = await verifyPassword(password, admin.password_hash)
      if (!valid) {
        // Try if password_hash starts with $2a$ (pgcrypto) vs $2b$ (bcryptjs)
        console.error('Password verify failed for admin:', email, 'hash prefix:', admin.password_hash?.substring(0, 7))
        return NextResponse.json({ error: 'Invalid email or password. If DB was just set up, visit: /api/admin/setup-password?secret=CM_SETUP_2024' }, { status: 401 })
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
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })

      return NextResponse.json({ success: true, user: { id: admin.id, email: admin.email, name: admin.full_name, role: 'admin' } })

    } else {
      // User login
      const { data: user, error: dbError } = await supabase
        .from('users')
        .select('id, email, full_name, password_hash, is_blocked, avatar_id')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (dbError) {
        console.error('User DB error:', dbError.message)
        return NextResponse.json({ error: 'Account not found. Please sign up first.' }, { status: 401 })
      }

      if (!user) {
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
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })

      return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.full_name, role: 'user' } })
    }
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
