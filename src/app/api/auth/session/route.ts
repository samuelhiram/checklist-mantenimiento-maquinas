import { NextResponse } from 'next/server'
import { getCurrentSessionWithRefresh } from '@/lib/auth/session'

export async function GET() {
  const session = await getCurrentSessionWithRefresh()

  if (!session) {
    return NextResponse.json({ authenticated: false })
  }

  return NextResponse.json({
    authenticated: true,
    profile: session.profile,
    org: session.org,
  })
}
