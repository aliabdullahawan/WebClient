import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== 'CM_SETUP_2024') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const supabase = createServiceClient()
    const hash = hashPassword('Admin@123')

    const { data: existing } = await supabase
      .from('admins').select('id').eq('email', 'amnamubeen516@gmail.com').single()

    if (existing) {
      const { error } = await supabase.from('admins')
        .update({ password_hash: hash }).eq('email', 'amnamubeen516@gmail.com')
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, message: 'Password updated. Login with Admin@123' })
    } else {
      const { error } = await supabase.from('admins').insert({
        email: 'amnamubeen516@gmail.com', password_hash: hash, full_name: 'Amna Mubeen'
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, message: 'Admin created. Login with Admin@123' })
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
