import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { isJsonObject, isOrganizationPlan } from '@/types'
import type { AppPermission, AuthenticatedProfile, JsonObject, Organization, Profile } from '@/types'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { prisma } from '@/lib/prisma'
import { AUTH_COOKIE_NAME, AUTH_LIMITS, AUTH_TIMINGS } from './config'
import { generateSessionToken, hashSessionToken, verifyPassword } from './crypto'
import { hasAnyPermission, hasPermission, resolveEffectivePermissionProfile } from './permission-profiles'

// Query helpers are the source of truth for Prisma result typing in this file.
// We derive app-facing record types from these helpers instead of depending on
// inline Prisma payload utility types inside runtime code.
async function findIdentityForAuthentication(email: string) {
  return prisma.authIdentity.findUnique({
    where: { email },
    include: {
      profile: {
        include: {
          organization: true,
          permissionProfile: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

async function findSessionRecordByTokenHash(sessionTokenHash: string) {
  return prisma.authSession.findUnique({
    where: {
      sessionTokenHash,
    },
    include: {
      identity: {
        include: {
          profile: {
            include: {
              organization: true,
              permissionProfile: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
}

type SessionRecord = NonNullable<Awaited<ReturnType<typeof findSessionRecordByTokenHash>>>

type SessionSubject = {
  sessionId: string
  identityId: string
  profile: AuthenticatedProfile
  org: Organization
}

type AuthFailureReason = 'invalid_credentials' | 'account_disabled' | 'account_locked'
type AuthenticationResult =
  | { ok: false; reason: AuthFailureReason }
  | {
      ok: true
      identityId: string
      profile: AuthenticatedProfile
      org: Organization
    }

type AuthProfileRecord = {
  id: string
  orgId: string | null
  fullName: string | null
  avatarUrl: string | null
  role: Profile['role'] | null
  department: string | null
  badgeNumber: string | null
  isActive: boolean | null
  lastSeenAt: Date | null
  createdAt: Date | null
  updatedAt: Date | null
  permissionProfile:
    | {
        id: string
        name: string
        permissions: Array<{
          permission: {
            id: string
          }
        }>
      }
    | null
}

// Boundary normalization happens here.
// Database values are converted into stable domain values before they reach
// layouts, routes, auth UI hydration, or UI components.
function normalizeJsonObject(value: unknown): JsonObject {
  if (isJsonObject(value)) {
    return value
  }

  return {}
}

function normalizeOrganizationPlan(value: string): Organization['plan'] {
  if (isOrganizationPlan(value)) {
    return value
  }

  return 'free'
}

function toAuthenticatedProfileFromRecord(profile: AuthProfileRecord): AuthenticatedProfile {
  const normalizedRole = profile.role ?? 'operator'
  const permissionProfile = resolveEffectivePermissionProfile({
    permissionProfileId: profile.permissionProfile?.id,
    permissionProfileName: profile.permissionProfile?.name,
    permissions: profile.permissionProfile?.permissions.map(entry => entry.permission.id),
    role: normalizedRole,
  })

  return {
    id: profile.id,
    org_id: profile.orgId ?? '',
    full_name: profile.fullName ?? '',
    avatar_url: profile.avatarUrl ?? undefined,
    role: normalizedRole,
    department: profile.department ?? undefined,
    badge_number: profile.badgeNumber ?? undefined,
    is_active: profile.isActive ?? true,
    last_seen_at: profile.lastSeenAt?.toISOString(),
    created_at: profile.createdAt?.toISOString() ?? new Date(0).toISOString(),
    updated_at: profile.updatedAt?.toISOString() ?? new Date(0).toISOString(),
    permission_profile_id: permissionProfile.id,
    permission_profile_name: permissionProfile.name,
    permissions: [...permissionProfile.permissions],
  }
}

function toOrganizationFromRecord(org: {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  plan: string
  settings: unknown
  createdAt: Date | null
  updatedAt: Date | null
}): Organization {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    logo_url: org.logoUrl ?? undefined,
    plan: normalizeOrganizationPlan(org.plan),
    settings: normalizeJsonObject(org.settings),
    created_at: org.createdAt?.toISOString() ?? new Date(0).toISOString(),
    updated_at: org.updatedAt?.toISOString() ?? new Date(0).toISOString(),
  }
}

function toProfile(session: SessionRecord): AuthenticatedProfile {
  return toAuthenticatedProfileFromRecord(session.identity.profile)
}

function toOrganization(session: SessionRecord): Organization {
  return toOrganizationFromRecord(session.identity.profile.organization!)
}

function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  }
}

async function revokeActiveSessions(identityId: string) {
  await prisma.authSession.updateMany({
    where: {
      identityId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  })
}

export function getAuthFailureMessage(reason: AuthFailureReason) {
  if (reason === 'account_locked') {
    return 'La cuenta esta bloqueada temporalmente'
  }

  if (reason === 'account_disabled') {
    return 'La cuenta esta deshabilitada'
  }

  return 'Credenciales incorrectas'
}

export async function authenticateWithPassword(email: string, password: string): Promise<AuthenticationResult> {
  const identity = await findIdentityForAuthentication(email.trim().toLowerCase())

  if (!identity || !identity.profile?.organization) {
    return { ok: false as const, reason: 'invalid_credentials' as const }
  }

  if (identity.status !== 'active') {
    return { ok: false as const, reason: 'account_disabled' as const }
  }

  if (identity.lockedUntil && identity.lockedUntil > new Date()) {
    return { ok: false as const, reason: 'account_locked' as const }
  }

  const matches = await verifyPassword(password, identity.passwordHash)
  if (!matches) {
    const failedAttempts = identity.failedAttempts + 1

    await prisma.authIdentity.update({
      where: { id: identity.id },
      data: {
        failedAttempts,
        lockedUntil:
          failedAttempts >= AUTH_LIMITS.maxFailedAttempts
            ? new Date(Date.now() + AUTH_LIMITS.lockWindowMs)
            : null,
      },
    })

    return { ok: false as const, reason: 'invalid_credentials' as const }
  }

  await prisma.authIdentity.update({
    where: { id: identity.id },
    data: {
      failedAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  })

  return {
    ok: true as const,
    identityId: identity.id,
    profile: toAuthenticatedProfileFromRecord(identity.profile),
    org: toOrganizationFromRecord(identity.profile.organization),
  }
}

export async function establishPasswordSession(email: string, password: string): Promise<AuthenticationResult> {
  const result = await authenticateWithPassword(email, password)

  if (!result.ok) {
    return result
  }

  await createSession(result.identityId)
  return result
}

export async function createSession(identityId: string) {
  const cookieStore = cookies()
  const requestHeaders = headers()
  const token = generateSessionToken()
  const now = Date.now()
  const expiresAt = new Date(now + AUTH_TIMINGS.absoluteSessionMs)
  const idleExpiresAt = new Date(now + AUTH_TIMINGS.idleSessionMs)

  await revokeActiveSessions(identityId)

  const session = await prisma.authSession.create({
    data: {
      identityId,
      sessionTokenHash: hashSessionToken(token),
      expiresAt,
      idleExpiresAt,
      userAgent: requestHeaders.get('user-agent'),
    },
  })

  cookieStore.set(AUTH_COOKIE_NAME, token, sessionCookieOptions(expiresAt))
  return session.id
}

export async function clearSessionCookie() {
  cookies().delete(AUTH_COOKIE_NAME)
}

export async function revokeCurrentSession() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value
  if (!token) return

  await prisma.authSession.updateMany({
    where: {
      sessionTokenHash: hashSessionToken(token),
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  })

  cookies().delete(AUTH_COOKIE_NAME)
}

async function touchSessionIfNeeded(session: SessionRecord) {
  if (Date.now() - session.lastSeenAt.getTime() < AUTH_TIMINGS.touchThrottleMs) {
    return
  }

  await prisma.authSession.update({
    where: { id: session.id },
    data: {
      lastSeenAt: new Date(),
      idleExpiresAt: new Date(Date.now() + AUTH_TIMINGS.idleSessionMs),
    },
  })

  const token = cookies().get(AUTH_COOKIE_NAME)?.value
  if (token) {
    cookies().set(AUTH_COOKIE_NAME, token, sessionCookieOptions(session.expiresAt))
  }
}

function isSessionRecordUsable(session: SessionRecord | null): session is SessionRecord {
  if (!session) {
    return false
  }

  return !(
    session.revokedAt ||
    session.expiresAt <= new Date() ||
    session.idleExpiresAt <= new Date() ||
    session.identity.status !== 'active' ||
    !session.identity.profile?.organization
  )
}

export async function getCurrentSession(): Promise<SessionSubject | null> {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value
  if (!token) {
    return null
  }

  const session = await findSessionRecordByTokenHash(hashSessionToken(token))

  if (!isSessionRecordUsable(session)) {
    return null
  }

  // Everything returned from here is already normalized to app domain types.
  return {
    sessionId: session.id,
    identityId: session.identityId,
    profile: toProfile(session),
    org: toOrganization(session),
  }
}

export async function getCurrentSessionWithRefresh(): Promise<SessionSubject | null> {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value
  if (!token) {
    return null
  }

  const session = await findSessionRecordByTokenHash(hashSessionToken(token))

  if (!isSessionRecordUsable(session)) {
    await clearSessionCookie()
    return null
  }

  await touchSessionIfNeeded(session)

  return {
    sessionId: session.id,
    identityId: session.identityId,
    profile: toProfile(session),
    org: toOrganization(session),
  }
}

export async function requireSession() {
  const session = await getCurrentSession()
  if (!session) {
    redirect(ROUTE_PATHS.auth.login)
  }
  return session
}

export async function requireRole(roles: Profile['role'][]) {
  const session = await requireSession()
  if (!roles.includes(session.profile.role)) {
    redirect(ROUTE_PATHS.auth.dashboard)
  }
  return session
}

export async function requirePermission(permission: AppPermission) {
  const session = await requireSession()
  if (!hasPermission(session.profile.permissions, permission)) {
    redirect(ROUTE_PATHS.auth.dashboard)
  }
  return session
}

export async function requireAnyPermission(requiredPermissions: AppPermission[]) {
  const session = await requireSession()
  if (!hasAnyPermission(session.profile.permissions, requiredPermissions)) {
    redirect(ROUTE_PATHS.auth.dashboard)
  }
  return session
}
