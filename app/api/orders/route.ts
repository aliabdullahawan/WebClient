import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const s = cookieStore.get('user_session')
    const session = s ? JSON.parse(s.value) : null

    const { items, discount_code, shipping_address } = await req.json()
    if (!items?.length) return NextResponse.json({ error: 'No items' }, { status: 400 })

    const supabase = createServiceClient()

    // Fetch prices
    const productIds = items.map((i: any) => i.product_id)
    const { data: products } = await supabase.from('products').select('id, name, price').in('id', productIds)
    const priceMap = Object.fromEntries((products || []).map((p: any) => [p.id, p]))

    let total = 0
    const orderItems = items.map((item: any) => {
      const p = priceMap[item.product_id]
      const price = p?.price || 0
      total += price * item.quantity
      return { product_id: item.product_id, product_name: p?.name || 'Product', quantity: item.quantity, price_at_order: price }
    })

    // Validate discount
    let discountedAmount = null
    let discountPct = null
    if (discount_code) {
      const { data: disc } = await supabase.from('v_active_discounts').select('percentage').eq('code', discount_code.toUpperCase()).single()
      if (disc) {
        discountPct = (disc as any).percentage
        discountedAmount = total * (1 - (disc as any).percentage / 100)
        await supabase.from('discounts').update({ usage_count: supabase.rpc('increment', { x: 1 }) }).eq('code', discount_code.toUpperCase())
      }
    }

    const { data: order, error } = await supabase.from('orders').insert({
      user_id: session?.id || null,
      status: 'pending',
      order_type: 'shop',
      total_amount: total,
      discounted_amount: discountedAmount,
      discount_code: discount_code || null,
      discount_percentage: discountPct,
      shipping_address: shipping_address || null,
    }).select().single()

    if (error || !order) return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })

    await supabase.from('order_items').insert(orderItems.map((i: any) => ({ ...i, order_id: order.id })))

    // Send notification if logged in
    if (session?.id) {
      await supabase.from('notifications').insert({
        user_id: session.id, type: 'order_update',
        title: '🎉 Order Placed Successfully!',
        message: `Your order ${(order as any).order_number} has been received. We'll confirm it shortly!`,
        related_order_id: order.id,
      })
    }

    return NextResponse.json({ success: true, order_number: (order as any).order_number })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
