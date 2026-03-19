import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const s = cookieStore.get('user_session')
  if (!s) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const userId = JSON.parse(s.value).id
  const { id } = await params
  const supabase = createServiceClient()
  await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', userId)
  return NextResponse.json({ success: true })
}
