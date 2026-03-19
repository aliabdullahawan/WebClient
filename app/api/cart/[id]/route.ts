import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function getUserId() {
  const cookieStore = await cookies()
  const s = cookieStore.get('user_session')
  if (!s) return null
  try { return JSON.parse(s.value).id } catch { return null }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const { id } = await params
  const { quantity } = await req.json()
  const supabase = createServiceClient()
  await supabase.from('cart').update({ quantity }).eq('id', id).eq('user_id', userId)
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const { id } = await params
  const supabase = createServiceClient()
  await supabase.from('cart').delete().eq('id', id).eq('user_id', userId)
  return NextResponse.json({ success: true })
}
