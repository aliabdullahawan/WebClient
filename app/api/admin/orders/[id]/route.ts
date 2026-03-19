import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin, isNextResponse } from '@/lib/adminAuth'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { id } = await params
  const supabase = createServiceClient()
  const { data: order } = await supabase.from('orders')
    .select('*, order_items(*, products(name, price)), users(id, full_name, email, phone, address)')
    .eq('id', id).single()
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ order })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { id } = await params
  const { status, admin_notes, message } = await req.json()
  const supabase = createServiceClient()
  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (admin_notes !== undefined) updates.admin_notes = admin_notes
  await supabase.from('orders').update(updates).eq('id', id)

  // If message provided, send notification to user
  if (message) {
    const { data: order } = await supabase.from('orders').select('user_id').eq('id', id).single()
    if ((order as any)?.user_id) {
      await supabase.from('notifications').insert({
        user_id: (order as any).user_id,
        type: 'admin_message',
        title: 'Message from Crochet Masterpiece 🌸',
        message,
        related_order_id: id,
      })
    }
  }
  return NextResponse.json({ success: true })
}
