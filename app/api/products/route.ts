import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createAnonClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const hero = searchParams.get('hero') === '1'
    const featured = searchParams.get('featured') === '1'
    const limit = parseInt(searchParams.get('limit') || '12')
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const supabase = createAnonClient()
    let query = supabase
      .from('products')
      .select(`
        id, name, description, price, category_id, tags,
        is_featured, show_on_hero, is_active, average_rating, review_count,
        created_at, updated_at,
        categories(id, name),
        product_images(id, image_mime, order_index, is_primary)
      `, { count: 'exact' })
      .eq('is_active', true)

    if (hero) query = query.eq('show_on_hero', true)
    if (featured) query = query.eq('is_featured', true)
    if (search) query = query.ilike('name', `%${search}%`)
    if (category) query = query.eq('category_id', category)
    if (minPrice) query = query.gte('price', parseFloat(minPrice))
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice))

    const validSorts = ['price', 'created_at', 'average_rating', 'name']
    const sortField = validSorts.includes(sort) ? sort : 'created_at'
    query = query.order(sortField, { ascending: order === 'asc' })

    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, count, error } = await query
    if (error) throw error

    const products = (data || []).map((p: any) => ({
      ...p,
      category_name: p.categories?.name,
      primary_image_id: p.product_images?.find((i: any) => i.is_primary)?.id || p.product_images?.[0]?.id,
      image_count: p.product_images?.length || 0,
    }))

    return NextResponse.json({ products, total: count || 0, page, limit })
  } catch (err) {
    console.error('Products API error:', err)
    return NextResponse.json({ products: [], total: 0 })
  }
}
