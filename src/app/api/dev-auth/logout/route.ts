import { NextResponse } from 'next/server'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { clearDevAdminSession } from '@/lib/auth/dev-admin'

export async function POST(request: Request) {
  await clearDevAdminSession()
  return NextResponse.redirect(new URL(ROUTE_PATHS.dev.login, request.url), { status: 303 })
}
