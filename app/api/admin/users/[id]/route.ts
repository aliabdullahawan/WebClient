import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin, isNextResponse } from '@/lib/adminAuth'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { id } = await params
  const supabase = createServiceClient()
  const { data: user } = await supabase.from('v_user_stats').select('*').eq('id', id).single()
  const { data: orders } = await supabase.from('orders').select('*, order_items(product_name, quantity, price_at_order)').eq('user_id', id).order('created_at', { ascending: false }).limit(20)
  return NextResponse.json({ user, orders: orders || [] })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { id } = await params
  const { is_blocked, message } = await req.json()
  const supabase = createServiceClient()
  if (is_blocked !== undefined) await supabase.from('users').update({ is_blocked }).eq('id', id)
  if (message) {
    await supabase.from('notifications').insert({
      user_id: id, type: 'admin_message',
      title: 'Message from Crochet Masterpiece 🌸',
      message,
    })
  }
  return NextResponse.json({ success: true })
}
