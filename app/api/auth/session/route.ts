import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  
  // Check which session we need based on request context
  const url = new URL(req.url)
  const wantAdmin = req.headers.get('x-want-role') === 'admin'
  
  const adminCookie = cookieStore.get('admin_session')
  const userCookie = cookieStore.get('user_session')

  // If on admin routes, prefer admin session
  if (wantAdmin && adminCookie) {
    try { return NextResponse.json({ authenticated: true, user: JSON.parse(adminCookie.value) }) } catch {}
  }

  // Otherwise return whichever is available (admin takes priority)
  if (adminCookie) {
    try { return NextResponse.json({ authenticated: true, user: JSON.parse(adminCookie.value) }) } catch {}
  }
  if (userCookie) {
    try { return NextResponse.json({ authenticated: true, user: JSON.parse(userCookie.value) }) } catch {}
  }

  return NextResponse.json({ authenticated: false })
}
