import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const s = cookieStore.get('user_session')
  if (!s) return NextResponse.json({ count: 0 })
  try {
    const userId = JSON.parse(s.value).id
    const supabase = createServiceClient()
    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false)
    return NextResponse.json({ count: count || 0 })
  } catch { return NextResponse.json({ count: 0 }) }
}
