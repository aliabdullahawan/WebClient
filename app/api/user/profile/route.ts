import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { hashPassword, isValidPassword } from '@/lib/auth'

async function getSession() {
  const cookieStore = await cookies()
  const s = cookieStore.get('user_session')
  if (!s) return null
  try { return JSON.parse(s.value) } catch { return null }
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, phone, address, avatar_id, email_verified, created_at')
    .eq('id', session.id)
    .single()
  if (error || !data) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json({ user: data })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  
  const body = await req.json()
  const { full_name, phone, address, avatar_id, new_password } = body
  const supabase = createServiceClient()
  const updates: Record<string, unknown> = {}

  if (full_name?.trim()) updates.full_name = full_name.trim()
  if (phone !== undefined) updates.phone = phone?.trim() || null
  if (address !== undefined) updates.address = address?.trim() || null
  if (avatar_id !== undefined) updates.avatar_id = avatar_id || null

  if (new_password) {
    const pwCheck = isValidPassword(new_password)
    if (!pwCheck.valid) return NextResponse.json({ error: pwCheck.message }, { status: 400 })
    updates.password_hash = hashPassword(new_password)
  }

  if (!Object.keys(updates).length) return NextResponse.json({ success: true })

  const { error } = await supabase.from('users').update(updates).eq('id', session.id)
  if (error) return NextResponse.json({ error: 'Failed to update: ' + error.message }, { status: 500 })

  // Update session cookie name
  if (updates.full_name) {
    const cookieStore = await cookies()
    const newSession = { ...session, name: updates.full_name }
    cookieStore.set('user_session', JSON.stringify(newSession), {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/'
    })
  }

  return NextResponse.json({ success: true })
}
