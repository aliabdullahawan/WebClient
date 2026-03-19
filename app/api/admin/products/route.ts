import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin, isNextResponse } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''

  const supabase = createServiceClient()
  let query = supabase
    .from('products')
    .select('id, name, price, category_id, is_featured, show_on_hero, is_active, average_rating, review_count, created_at, categories(name), product_images(id, is_primary)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (q) query = query.ilike('name', `%${q}%`)
  if (category) query = query.eq('category_id', category)
  query = query.range((page - 1) * limit, page * limit - 1)

  const { data, count } = await query
  const products = (data || []).map((p: any) => ({
    ...p,
    category_name: p.categories?.name,
    primary_image_id: p.product_images?.find((i: any) => i.is_primary)?.id || p.product_images?.[0]?.id,
  }))
  return NextResponse.json({ products, total: count || 0 })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const body = await req.json()
  const { name, description, price, category_id, tags, is_featured, show_on_hero, images } = body

  if (!name?.trim() || !price) return NextResponse.json({ error: 'Name and price required' }, { status: 400 })
  const supabase = createServiceClient()

  const { data: product, error } = await supabase
    .from('products')
    .insert({ name: name.trim(), description: description?.trim(), price: parseFloat(price), category_id: category_id || null, tags: tags || [], is_featured: !!is_featured, show_on_hero: !!show_on_hero })
    .select().single()

  if (error) return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })

  // Insert images
  if (images?.length) {
    const imgRows = images.map((img: any, i: number) => ({
      product_id: product.id,
      image_data: img.data,
      image_mime: img.mime || 'image/jpeg',
      order_index: i,
      is_primary: i === 0,
    }))
    await supabase.from('product_images').insert(imgRows)
  }

  return NextResponse.json({ success: true, product })
}
