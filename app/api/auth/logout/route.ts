import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const { role } = await req.json().catch(() => ({}))
  
  if (role === 'admin') {
    cookieStore.delete('admin_session')
  } else if (role === 'user') {
    cookieStore.delete('user_session')
  } else {
    // Clear both
    cookieStore.delete('admin_session')
    cookieStore.delete('user_session')
  }
  return NextResponse.json({ success: true })
}
