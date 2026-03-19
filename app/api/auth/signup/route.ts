import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword, isValidEmail, isValidPassword } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, password, confirm_password, phone, address } = await req.json()

    if (!full_name?.trim()) return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    if (!isValidEmail(email)) return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    if (!password) return NextResponse.json({ error: 'Password is required' }, { status: 400 })

    const pwCheck = isValidPassword(password)
    if (!pwCheck.valid) return NextResponse.json({ error: pwCheck.message }, { status: 400 })
    if (confirm_password && password !== confirm_password) return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })

    const supabase = createServiceClient()

    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('users').select('id').eq('email', email.toLowerCase().trim()).single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[signup] check error:', checkError.message, checkError.code)
      if (checkError.code === '42P01') return NextResponse.json({ error: 'Database not set up. Please run DATABASE.sql in Supabase first.' }, { status: 500 })
      return NextResponse.json({ error: 'Database error: ' + checkError.message }, { status: 500 })
    }

    if (existing) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })

    const password_hash = hashPassword(password)

    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
        password_hash,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        email_verified: false,
      })
      .select('id, email, full_name, avatar_id')
      .single()

    if (insertError || !user) {
      console.error('[signup] insert error:', insertError?.message, insertError?.code)
      return NextResponse.json({ error: 'Failed to create account: ' + (insertError?.message || 'unknown error') }, { status: 500 })
    }

    const cookieStore = await cookies()
    cookieStore.set('user_session', JSON.stringify({
      id: user.id, email: user.email, name: user.full_name, avatar_id: user.avatar_id, role: 'user', loginAt: Date.now()
    }), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' })

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.full_name } })
  } catch (err) {
    console.error('[signup] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error: ' + String(err) }, { status: 500 })
  }
}
