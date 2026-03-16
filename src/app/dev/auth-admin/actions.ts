'use server'

import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { isPermissionProfileId } from '@/types'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/crypto'
import { requireDevAdminSession } from '@/lib/auth/dev-admin'
import { resolveLegacyRoleFromPermissionProfileId } from '@/lib/auth/permission-profiles'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { ensureDevOrganization } from './dev-organization'

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function createAuthUserAction(formData: FormData) {
  await requireDevAdminSession()

  const email = getString(formData, 'email').toLowerCase()
  const password = getString(formData, 'password')
  const fullName = getString(formData, 'fullName')
  const role = getString(formData, 'role')
  const permissionProfileId = getString(formData, 'permissionProfileId')
  const orgId = getString(formData, 'orgId')
  const department = getString(formData, 'department')
  const resolvedRole = isPermissionProfileId(permissionProfileId)
    ? resolveLegacyRoleFromPermissionProfileId(permissionProfileId)
    : role === 'admin' || role === 'supervisor' || role === 'operator'
      ? role
      : 'operator'

  if (!email || !password || !fullName) {
    throw new Error('Faltan campos requeridos')
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const defaultOrganization = await ensureDevOrganization(tx)

    const profile = await tx.profile.create({
      data: {
        orgId: orgId || defaultOrganization.id,
        fullName,
        permissionProfileId: isPermissionProfileId(permissionProfileId) ? permissionProfileId : undefined,
        role: resolvedRole,
        department: department || null,
        isActive: true,
      },
    })

    await tx.authIdentity.create({
      data: {
        profileId: profile.id,
        email,
        passwordHash: await hashPassword(password),
        passwordUpdatedAt: new Date(),
      },
    })
  })

  revalidatePath(ROUTE_PATHS.dev.authAdmin)
}

export async function updateAuthIdentityAction(formData: FormData) {
  await requireDevAdminSession()

  const identityId = getString(formData, 'identityId')
  const status = getString(formData, 'status')
  const password = getString(formData, 'password')
  const fullName = getString(formData, 'fullName')
  const department = getString(formData, 'department')
  const role = getString(formData, 'role')
  const permissionProfileId = getString(formData, 'permissionProfileId')
  const resolvedRole = isPermissionProfileId(permissionProfileId)
    ? resolveLegacyRoleFromPermissionProfileId(permissionProfileId)
    : role === 'admin' || role === 'supervisor' || role === 'operator'
      ? role
      : undefined

  if (!identityId) {
    throw new Error('Identity invalida')
  }

  const data: {
    status?: 'active' | 'disabled' | 'locked'
    failedAttempts?: number
    lockedUntil?: Date | null
    passwordHash?: string
    passwordUpdatedAt?: Date
  } = {}

  if (status === 'active' || status === 'disabled' || status === 'locked') {
    data.status = status
    if (status !== 'locked') {
      data.failedAttempts = 0
      data.lockedUntil = null
    }
  }

  if (password) {
    data.passwordHash = await hashPassword(password)
    data.passwordUpdatedAt = new Date()
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.authIdentity.update({
      where: { id: identityId },
      data,
    })

    const identity = await tx.authIdentity.findUnique({
      where: { id: identityId },
      select: { profileId: true },
    })

    if (!identity) {
      throw new Error('Identity no encontrada')
    }

    await tx.profile.update({
      where: { id: identity.profileId },
      data: {
        fullName: fullName || undefined,
        department: department || null,
        permissionProfileId: isPermissionProfileId(permissionProfileId) ? permissionProfileId : undefined,
        role: resolvedRole,
      },
    })
  })

  revalidatePath(ROUTE_PATHS.dev.authAdmin)
}

export async function deleteAuthUserAction(formData: FormData) {
  await requireDevAdminSession()

  const profileId = getString(formData, 'profileId')
  if (!profileId) {
    throw new Error('Perfil invalido')
  }

  await prisma.profile.delete({
    where: { id: profileId },
  })

  revalidatePath(ROUTE_PATHS.dev.authAdmin)
}
