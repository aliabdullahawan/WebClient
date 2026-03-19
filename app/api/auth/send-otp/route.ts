import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendOTPEmail } from '@/lib/brevo'
import { generateOTP, getOTPExpiry } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, purpose, isAdmin } = await req.json()

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    const supabase = createServiceClient()
    const table = isAdmin ? 'admins' : 'users'

    const { data: record } = await supabase
      .from(table)
      .select('id, full_name, email')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (!record) {
      // Don't reveal if email exists for security
      return NextResponse.json({ success: true, message: 'If this email exists, an OTP has been sent.' })
    }

    const otp = generateOTP()
    const expires = getOTPExpiry()

    await supabase
      .from(table)
      .update({ otp_code: otp, otp_expires_at: expires.toISOString() })
      .eq('id', record.id)

    const name = isAdmin ? (record as any).full_name || 'Admin' : (record as any).full_name || 'there'
    await sendOTPEmail(email, name, purpose || 'reset')

    return NextResponse.json({ success: true, message: 'OTP sent to your email.' })
  } catch (err) {
    console.error('Send OTP error:', err)
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 })
  }
}
