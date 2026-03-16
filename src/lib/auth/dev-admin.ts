import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { DEV_ADMIN_COOKIE_NAME } from './config'

const DEV_ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 12
type DevAdminFailureReason = 'invalid_credentials'

function getEnv(name: 'DEV_ADMIN_EMAIL' | 'DEV_ADMIN_PASSWORD' | 'DEV_ADMIN_SESSION_SECRET') {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env: ${name}`)
  }
  return value
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

function signValue(value: string) {
  return createHmac('sha256', getEnv('DEV_ADMIN_SESSION_SECRET')).update(value).digest('base64url')
}

function encodeSession(expiresAt: number) {
  const payload = String(expiresAt)
  return `${payload}.${signValue(payload)}`
}

function decodeSession(value: string) {
  const [payload, signature] = value.split('.')
  if (!payload || !signature) {
    return null
  }

  const expected = signValue(payload)
  if (!safeCompare(signature, expected)) {
    return null
  }

  const expiresAt = Number(payload)
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return null
  }

  return { expiresAt }
}

export function validateDevAdminCredentials(email: string, password: string) {
  return safeCompare(email.trim().toLowerCase(), getEnv('DEV_ADMIN_EMAIL').trim().toLowerCase()) &&
    safeCompare(password, getEnv('DEV_ADMIN_PASSWORD'))
}

export function getDevAdminFailureMessage(reason: DevAdminFailureReason) {
  if (reason === 'invalid_credentials') {
    return 'Credenciales invalidas'
  }

  return 'No fue posible acceder'
}

export async function createDevAdminSession() {
  const expiresAt = Date.now() + DEV_ADMIN_SESSION_TTL_MS
  const cookieStore = await cookies()
  cookieStore.set(DEV_ADMIN_COOKIE_NAME, encodeSession(expiresAt), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(expiresAt),
  })
}

export async function establishDevAdminSession(email: string, password: string) {
  if (!validateDevAdminCredentials(email, password)) {
    return { ok: false as const, reason: 'invalid_credentials' as const }
  }

  await createDevAdminSession()
  return { ok: true as const }
}

export async function clearDevAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(DEV_ADMIN_COOKIE_NAME)
}

export async function hasDevAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(DEV_ADMIN_COOKIE_NAME)?.value
  if (!token) {
    return false
  }

  return !!decodeSession(token)
}

export async function requireDevAdminSession() {
  const isValid = await hasDevAdminSession()
  if (!isValid) {
    redirect(ROUTE_PATHS.dev.login)
  }
}
