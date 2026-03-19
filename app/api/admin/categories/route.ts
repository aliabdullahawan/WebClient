import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin, isNextResponse } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const supabase = createServiceClient()
  let query = supabase.from('categories').select('id, name, description, image_mime, is_active, created_at')
  if (q) query = query.ilike('name', `%${q}%`)
  query = query.order('name')
  const { data } = await query
  return NextResponse.json({ categories: data || [] })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { name, description, image } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const supabase = createServiceClient()
  const { data: existing } = await supabase.from('categories').select('id').eq('name', name.trim()).single()
  if (existing) return NextResponse.json({ error: 'Category already exists' }, { status: 409 })
  const insertData: Record<string, unknown> = { name: name.trim(), description: description?.trim() || null }
  if (image?.data) { insertData.image_data = image.data; insertData.image_mime = image.mime || 'image/jpeg' }
  const { data, error } = await supabase.from('categories').insert(insertData).select().single()
  if (error) return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  return NextResponse.json({ success: true, category: data })
}
