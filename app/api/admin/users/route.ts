import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin, isNextResponse } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const supabase = createServiceClient()
  let query = supabase.from('v_user_stats').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
  query = query.range((page - 1) * limit, page * limit - 1)
  const { data, count } = await query
  return NextResponse.json({ users: data || [], total: count || 0 })
}
