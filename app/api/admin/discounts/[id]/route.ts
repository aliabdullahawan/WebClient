import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin, isNextResponse } from '@/lib/adminAuth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { id } = await params
  const body = await req.json()
  const supabase = createServiceClient()
  const updates: Record<string, unknown> = {}
  if (body.is_active !== undefined) updates.is_active = body.is_active
  if (body.end_date !== undefined) updates.end_date = body.end_date || null
  if (body.percentage !== undefined) updates.percentage = parseFloat(body.percentage)
  if (body.description !== undefined) updates.description = body.description?.trim() || null
  await supabase.from('discounts').update(updates).eq('id', id)
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { id } = await params
  const supabase = createServiceClient()
  await supabase.from('discounts').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
