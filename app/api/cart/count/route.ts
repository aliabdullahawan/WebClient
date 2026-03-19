import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('user_session')
  if (!session) return NextResponse.json({ count: 0 })
  try {
    const userId = JSON.parse(session.value).id
    const supabase = createServiceClient()
    const { count } = await supabase.from('cart').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    return NextResponse.json({ count: count || 0 })
  } catch { return NextResponse.json({ count: 0 }) }
}
