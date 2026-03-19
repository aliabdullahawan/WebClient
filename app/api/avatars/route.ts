import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('avatars').select('id, name, image_mime').order('name')
    return NextResponse.json({ avatars: data || [] })
  } catch {
    return NextResponse.json({ avatars: [] })
  }
}
