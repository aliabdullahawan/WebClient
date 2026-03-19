import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function requireAdmin(): Promise<{ adminId: string; email: string } | NextResponse> {
  const cookieStore = await cookies()
  const s = cookieStore.get('admin_session')
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const session = JSON.parse(s.value)
    if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return { adminId: session.id, email: session.email }
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }
}

export function isNextResponse(v: unknown): v is NextResponse {
  return v instanceof NextResponse
}
