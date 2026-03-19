import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

// ONE-TIME route to fix admin password hash from pgcrypto format to bcryptjs format
// Call: GET /api/admin/setup-password?secret=CM_SETUP_2024
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== 'CM_SETUP_2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()

    // Generate proper bcryptjs hash for Admin@123
    const hash = await bcrypt.hash('Admin@123', 12)

    // Check if admin exists
    const { data: existing } = await supabase
      .from('admins')
      .select('id, email')
      .eq('email', 'amnamubeen516@gmail.com')
      .single()

    if (existing) {
      // Update password hash to bcryptjs format
      const { error } = await supabase
        .from('admins')
        .update({ password_hash: hash })
        .eq('email', 'amnamubeen516@gmail.com')

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, message: 'Admin password updated. You can now login with Admin@123' })
    } else {
      // Insert admin if doesn't exist
      const { error } = await supabase
        .from('admins')
        .insert({
          email: 'amnamubeen516@gmail.com',
          password_hash: hash,
          full_name: 'Amna Mubeen',
        })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, message: 'Admin account created. Login with Admin@123' })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
