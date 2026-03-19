import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('categories')
      .select('id, name, description, image_mime, is_active, created_at')
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(limit)

    // Note: We don't send image_data in list — too large. 
    // Images served via separate /api/categories/image/[id] route
    return NextResponse.json({ categories: data || [] })
  } catch {
    return NextResponse.json({ categories: [] })
  }
}
