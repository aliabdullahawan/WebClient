import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const userSession = cookieStore.get('user_session')
  const adminSession = cookieStore.get('admin_session')

  if (adminSession) {
    try {
      const session = JSON.parse(adminSession.value)
      return NextResponse.json({ authenticated: true, user: session })
    } catch {}
  }

  if (userSession) {
    try {
      const session = JSON.parse(userSession.value)
      return NextResponse.json({ authenticated: true, user: session })
    } catch {}
  }

  return NextResponse.json({ authenticated: false })
}
