import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('v_active_discounts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    return NextResponse.json({ discounts: data || [] })
  } catch {
    return NextResponse.json({ discounts: [] })
  }
}
