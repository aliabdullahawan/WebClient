import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin, isNextResponse } from '@/lib/adminAuth'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { id } = await params
  const supabase = createServiceClient()
  const { data } = await supabase.from('products')
    .select('*, categories(id,name), product_images(id,image_mime,order_index,is_primary)')
    .eq('id', id).single()
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product: { ...data, category_name: (data as any).categories?.name } })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { id } = await params
  const body = await req.json()
  const { name, description, price, category_id, tags, is_featured, show_on_hero, is_active, newImages, removeImageIds } = body
  const supabase = createServiceClient()
  const updates: Record<string, unknown> = {}
  if (name !== undefined) updates.name = name.trim()
  if (description !== undefined) updates.description = description?.trim()
  if (price !== undefined) updates.price = parseFloat(price)
  if (category_id !== undefined) updates.category_id = category_id || null
  if (tags !== undefined) updates.tags = tags
  if (is_featured !== undefined) updates.is_featured = is_featured
  if (show_on_hero !== undefined) updates.show_on_hero = show_on_hero
  if (is_active !== undefined) updates.is_active = is_active

  await supabase.from('products').update(updates).eq('id', id)
  if (removeImageIds?.length) await supabase.from('product_images').delete().in('id', removeImageIds)
  if (newImages?.length) {
    const { data: existing } = await supabase.from('product_images').select('order_index').eq('product_id', id).order('order_index', { ascending: false }).limit(1)
    const nextIdx = ((existing?.[0] as any)?.order_index ?? -1) + 1
    await supabase.from('product_images').insert(newImages.map((img: any, i: number) => ({
      product_id: id, image_data: img.data, image_mime: img.mime || 'image/jpeg', order_index: nextIdx + i, is_primary: false,
    })))
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { id } = await params
  const supabase = createServiceClient()
  await supabase.from('products').update({ is_active: false }).eq('id', id)
  return NextResponse.json({ success: true })
}
