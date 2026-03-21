import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('categories')
      .select('image_data, image_mime')
      .eq('id', id)
      .single()

    if (error || !data?.image_data) return new NextResponse(null, { status: 404 })

    let buffer: Buffer
    const raw = data.image_data as unknown
    if (Buffer.isBuffer(raw)) {
      buffer = raw
    } else if (typeof raw === 'string') {
      const hex = (raw as string).startsWith('\\x') ? (raw as string).slice(2) : raw as string
      buffer = Buffer.from(hex, 'hex')
    } else if (typeof raw === 'object' && raw !== null) {
      buffer = Buffer.from(Object.values(raw as object) as number[])
    } else {
      return new NextResponse(null, { status: 404 })
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': data.image_mime || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse(null, { status: 500 })
  }
}
