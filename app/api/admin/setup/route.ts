import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/auth'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const passwordHash = await hashPassword('Admin@123')

    const { data, error } = await supabase
      .from('admins')
      .upsert({ email: 'amnamubeen516@gmail.com', password_hash: passwordHash, full_name: 'Amna Mubeen' }, { onConflict: 'email' })
      .select('id, email, full_name').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, message: 'Admin seeded. Login with Admin@123', admin: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
