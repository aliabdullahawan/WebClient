import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createServiceClient()
    const { data: product, error } = await supabase
      .from('products')
      .select(`id, name, description, price, category_id, tags, is_featured, show_on_hero, is_active, average_rating, review_count, created_at,
        categories(id, name),
        product_images(id, image_mime, order_index, is_primary)`)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    // Get active discount
    const { data: discount } = await supabase
      .from('v_products_with_discounts')
      .select('discount_id, discount_code, discount_percentage, discounted_price, discount_end_date')
      .eq('id', id)
      .not('discount_id', 'is', null)
      .single()

    // Get reviews (latest 10)
    const { data: reviews } = await supabase
      .from('reviews')
      .select('id, rating, comment, admin_reply, admin_replied_at, created_at, users(full_name, avatar_id)')
      .eq('product_id', id)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      product: {
        ...product,
        category_name: (product as any).categories?.name,
        images: (product as any).product_images?.sort((a: any, b: any) => {
          if (a.is_primary) return -1
          if (b.is_primary) return 1
          return a.order_index - b.order_index
        }),
        discount,
      },
      reviews: reviews || [],
    })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
