import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin, isNextResponse } from '@/lib/adminAuth'
import { hashPassword, verifyPassword } from '@/lib/auth'

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth

  const { full_name, current_password, new_password } = await req.json()
  const supabase = createServiceClient()
  const updates: Record<string, string> = {}

  if (full_name?.trim()) updates.full_name = full_name.trim()

  if (new_password) {
    if (!current_password) return NextResponse.json({ error: 'Current password required to change password' }, { status: 400 })
    const { data: admin } = await supabase.from('admins').select('password_hash').eq('id', auth.adminId).single()
    if (!admin || !verifyPassword(current_password, admin.password_hash)) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }
    updates.password_hash = hashPassword(new_password)
  }

  if (!Object.keys(updates).length) return NextResponse.json({ success: true })

  const { error } = await supabase.from('admins').update(updates).eq('id', auth.adminId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
