import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin, isNextResponse } from '@/lib/adminAuth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { id } = await params
  const { admin_reply, is_visible } = await req.json()
  const supabase = createServiceClient()
  const updates: Record<string, unknown> = {}
  if (admin_reply !== undefined) { updates.admin_reply = admin_reply; updates.admin_replied_at = new Date().toISOString() }
  if (is_visible !== undefined) updates.is_visible = is_visible
  await supabase.from('reviews').update(updates).eq('id', id)
  if (admin_reply) {
    const { data: review } = await supabase.from('reviews').select('user_id, product_id, products(name)').eq('id', id).single()
    if ((review as any)?.user_id) {
      await supabase.from('notifications').insert({
        user_id: (review as any).user_id, type: 'review_reply',
        title: 'Reply to your review 🌸',
        message: `Crochet Masterpiece replied to your review on "${(review as any).products?.name}": ${admin_reply}`,
        related_product_id: (review as any).product_id,
      })
    }
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { id } = await params
  const supabase = createServiceClient()
  await supabase.from('reviews').update({ is_visible: false }).eq('id', id)
  return NextResponse.json({ success: true })
}
