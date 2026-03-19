import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createServiceClient()
    const { data } = await supabase.from('avatars').select('image_data, image_mime').eq('id', id).single()
    if (!data?.image_data) return new NextResponse(null, { status: 404 })
    const buffer = Buffer.isBuffer(data.image_data) ? data.image_data : Buffer.from(data.image_data as string, 'base64')
    return new NextResponse(buffer, {
      headers: { 'Content-Type': data.image_mime || 'image/png', 'Cache-Control': 'public, max-age=86400' },
    })
  } catch { return new NextResponse(null, { status: 500 }) }
}
