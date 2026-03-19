import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  const s = cookieStore.get('user_session')
  if (!s) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const userId = JSON.parse(s.value).id
  const supabase = createServiceClient()
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
  return NextResponse.json({ success: true })
}
