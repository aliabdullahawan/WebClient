import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function getUserId() {
  const cookieStore = await cookies()
  const s = cookieStore.get('user_session')
  if (!s) return null
  try { return JSON.parse(s.value).id } catch { return null }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const product_id = searchParams.get('product_id')
  if (!product_id) return NextResponse.json({ reviews: [] })
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, admin_reply, admin_replied_at, created_at, users(full_name)')
    .eq('product_id', product_id)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) return NextResponse.json({ reviews: [], error: error.message })
  return NextResponse.json({ reviews: data || [] })
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Sign in to leave a review' }, { status: 401 })
  const { product_id, rating, comment } = await req.json()
  if (!product_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating (1-5) and product required' }, { status: 400 })
  }
  const supabase = createServiceClient()
  const { data: existing } = await supabase.from('reviews').select('id').eq('user_id', userId).eq('product_id', product_id).single()
  if (existing) return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 })
  const { data, error } = await supabase
    .from('reviews')
    .insert({ user_id: userId, product_id, rating, comment: comment?.trim() || null })
    .select('id, rating, comment, created_at')
    .single()
  if (error) return NextResponse.json({ error: 'Failed to submit: ' + error.message }, { status: 500 })
  return NextResponse.json({ success: true, review: data })
}
