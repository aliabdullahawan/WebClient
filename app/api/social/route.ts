import { NextResponse } from 'next/server'
import { createServiceClient, createAnonClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createAnonClient()
    const { data: links } = await supabase.from('social_links').select('*')
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const { data: settings } = await supabase.from('site_settings').select('*')
    const settingsMap = Object.fromEntries((settings || []).map((s: any) => [s.key, s.value]))
    return NextResponse.json({ links: links || [], userCount: userCount || 0, settings: settingsMap })
  } catch {
    return NextResponse.json({ links: [], userCount: 0, settings: {} })
  }
}
