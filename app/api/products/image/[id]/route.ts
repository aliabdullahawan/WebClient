import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('product_images')
      .select('image_data, image_mime')
      .eq('id', id)
      .single()

    if (error || !data || !data.image_data) {
      return new NextResponse(null, { status: 404 })
    }

    // image_data is stored as bytea - convert to buffer
    const buffer = Buffer.isBuffer(data.image_data)
      ? data.image_data
      : Buffer.from(data.image_data as string, 'base64')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': data.image_mime || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse(null, { status: 500 })
  }
}
