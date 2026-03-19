import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function getUserId() {
  const cookieStore = await cookies()
  const s = cookieStore.get('user_session')
  if (!s) return null
  try { return JSON.parse(s.value).id } catch { return null }
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Sign in to leave a review' }, { status: 401 })
  const { product_id, rating, comment } = await req.json()
  if (!product_id || !rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'Invalid review data' }, { status: 400 })
  const supabase = createServiceClient()
  const { data: existing } = await supabase.from('reviews').select('id').eq('user_id', userId).eq('product_id', product_id).single()
  if (existing) return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 })
  const { data, error } = await supabase.from('reviews').insert({ user_id: userId, product_id, rating, comment: comment?.trim() || null }).select().single()
  if (error) return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  return NextResponse.json({ success: true, review: data })
}
