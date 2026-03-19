import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function getUserId() {
  const cookieStore = await cookies()
  const s = cookieStore.get('user_session')
  if (!s) return null
  try { return JSON.parse(s.value).id } catch { return null }
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ items: [] })
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('wishlist')
    .select('id, product_id, created_at, products(id, name, price, average_rating, review_count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  const items = (data || []).map((i: any) => ({ id: i.id, product_id: i.product_id, created_at: i.created_at, product: i.products }))
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const { product_id } = await req.json()
  if (!product_id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
  const supabase = createServiceClient()
  const { data: existing } = await supabase.from('wishlist').select('id').eq('user_id', userId).eq('product_id', product_id).single()
  if (existing) {
    await supabase.from('wishlist').delete().eq('id', existing.id)
    return NextResponse.json({ success: true, action: 'removed' })
  }
  await supabase.from('wishlist').insert({ user_id: userId, product_id })
  return NextResponse.json({ success: true, action: 'added' })
}
