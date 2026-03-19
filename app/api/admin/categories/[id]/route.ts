import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin, isNextResponse } from '@/lib/adminAuth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { id } = await params
  const { name, description, image, is_active } = await req.json()
  const supabase = createServiceClient()
  const updates: Record<string, unknown> = {}
  if (name) updates.name = name.trim()
  if (description !== undefined) updates.description = description?.trim() || null
  if (is_active !== undefined) updates.is_active = is_active
  if (image?.data) { updates.image_data = image.data; updates.image_mime = image.mime || 'image/jpeg' }
  await supabase.from('categories').update(updates).eq('id', id)
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { id } = await params
  const supabase = createServiceClient()
  await supabase.from('categories').update({ is_active: false }).eq('id', id)
  return NextResponse.json({ success: true })
}
