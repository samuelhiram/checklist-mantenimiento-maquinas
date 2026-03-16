import { NextResponse } from 'next/server'
import { establishDevAdminSession, getDevAdminFailureMessage } from '@/lib/auth/dev-admin'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) {
    return NextResponse.json({ error: 'Correo y contrasena requeridos' }, { status: 400 })
  }

  const result = await establishDevAdminSession(email, password)
  if (!result.ok) {
    return NextResponse.json({ error: getDevAdminFailureMessage(result.reason) }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
