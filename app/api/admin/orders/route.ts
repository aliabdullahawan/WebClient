import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin, isNextResponse } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status') || ''
  const type = searchParams.get('type') || ''
  const supabase = createServiceClient()

  let query = supabase.from('v_orders_summary')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  if (type) query = query.eq('order_type', type)
  query = query.range((page - 1) * limit, page * limit - 1)

  const { data, count } = await query
  return NextResponse.json({ orders: data || [], total: count || 0 })
}
