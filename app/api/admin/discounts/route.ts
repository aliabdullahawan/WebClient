import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin, isNextResponse } from '@/lib/adminAuth'

export async function GET() {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('v_active_discounts')
    .select('*')
    .order('created_at', { ascending: false })
  // Also get expired/inactive
  const { data: all } = await supabase
    .from('discounts')
    .select('*, products(name), categories(name)')
    .order('created_at', { ascending: false })
    .limit(50)
  return NextResponse.json({
    discounts: (all || []).map((d: any) => ({
      ...d, product_name: d.products?.name, category_name: d.categories?.name,
    }))
  })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const body = await req.json()
  const { code, description, percentage, scope, product_id, category_id, start_date, end_date, max_usage } = body
  if (!code?.trim() || !percentage || !scope) return NextResponse.json({ error: 'Code, percentage and scope required' }, { status: 400 })
  const supabase = createServiceClient()
  const { data: existing } = await supabase.from('discounts').select('id').eq('code', code.toUpperCase().trim()).single()
  if (existing) return NextResponse.json({ error: 'Discount code already exists' }, { status: 409 })
  const { data, error } = await supabase.from('discounts').insert({
    code: code.toUpperCase().trim(), description: description?.trim() || null,
    percentage: parseFloat(percentage), scope,
    product_id: scope === 'product' ? product_id : null,
    category_id: scope === 'category' ? category_id : null,
    start_date: start_date || new Date().toISOString(),
    end_date: end_date || null,
    max_usage: max_usage ? parseInt(max_usage) : null,
    is_active: true,
  }).select().single()
  if (error) return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 })
  return NextResponse.json({ success: true, discount: data })
}
