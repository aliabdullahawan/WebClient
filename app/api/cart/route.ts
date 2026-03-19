import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('user_session')
  if (!session) return null
  try { return JSON.parse(session.value).id } catch { return null }
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ items: [] })

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('cart')
    .select('id, product_id, quantity, products(id, name, price, average_rating, is_active)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const items = (data || []).map((item: any) => ({
    id: item.id,
    product_id: item.product_id,
    quantity: item.quantity,
    product: item.products,
  }))

  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { product_id, quantity = 1 } = await req.json()
  if (!product_id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })

  const supabase = createServiceClient()

  // Upsert - if exists increase quantity
  const { data: existing } = await supabase
    .from('cart').select('id, quantity').eq('user_id', userId).eq('product_id', product_id).single()

  if (existing) {
    await supabase.from('cart').update({ quantity: existing.quantity + quantity }).eq('id', existing.id)
  } else {
    await supabase.from('cart').insert({ user_id: userId, product_id, quantity })
  }

  return NextResponse.json({ success: true })
}
