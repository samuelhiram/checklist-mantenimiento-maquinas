import { NextResponse } from 'next/server'
import { establishPasswordSession, getAuthFailureMessage } from '@/lib/auth/session'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) {
    return NextResponse.json({ error: 'Correo y contrasena son requeridos' }, { status: 400 })
  }

  const result = await establishPasswordSession(email, password)

  if (!result.ok) {
    return NextResponse.json({ error: getAuthFailureMessage(result.reason) }, { status: 401 })
  }

  return NextResponse.json({
    profile: result.profile,
    org: result.org,
  })
}
