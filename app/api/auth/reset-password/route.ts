import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword, isValidPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, otp, new_password, confirm_password, isAdmin } = await req.json()

    if (!email || !otp || !new_password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const pwCheck = isValidPassword(new_password)
    if (!pwCheck.valid) return NextResponse.json({ error: pwCheck.message }, { status: 400 })
    if (new_password !== confirm_password) return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })

    const supabase = createServiceClient()
    const table = isAdmin ? 'admins' : 'users'

    const { data: record } = await supabase
      .from(table)
      .select('id, otp_code, otp_expires_at')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (!record) return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    if (record.otp_code !== otp) return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 })

    const now = new Date()
    const expiry = new Date(record.otp_expires_at)
    if (now > expiry) return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 })

    const password_hash = await hashPassword(new_password)

    await supabase
      .from(table)
      .update({ password_hash, otp_code: null, otp_expires_at: null })
      .eq('id', record.id)

    return NextResponse.json({ success: true, message: 'Password reset successfully!' })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
