import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const s = cookieStore.get('user_session')
  if (!s) return NextResponse.json({ orders: [] })
  try {
    const userId = JSON.parse(s.value).id
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, status, order_type, total_amount, discounted_amount, created_at, order_items(id, product_name, quantity, price_at_order)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    return NextResponse.json({ orders: data || [] })
  } catch { return NextResponse.json({ orders: [] }) }
}
