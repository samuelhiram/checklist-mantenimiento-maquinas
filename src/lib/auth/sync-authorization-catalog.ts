import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@/types'
import { LEGACY_ROLE_PERMISSION_PROFILE, PERMISSION_DEFINITIONS, PERMISSION_PROFILES } from './permission-profiles'

type AuthorizationCatalogClient = Prisma.TransactionClient | typeof prisma

async function upsertPermissions(client: AuthorizationCatalogClient) {
  for (const permission of PERMISSION_DEFINITIONS) {
    await client.permission.upsert({
      where: { id: permission.id },
      update: {
        name: permission.name,
        description: permission.description,
      },
      create: {
        id: permission.id,
        name: permission.name,
        description: permission.description,
      },
    })
  }
}

async function upsertPermissionProfiles(client: AuthorizationCatalogClient) {
  for (const profile of PERMISSION_PROFILES) {
    await client.permissionProfile.upsert({
      where: { id: profile.id },
      update: {
        name: profile.name,
        description: profile.description,
        isSystem: true,
      },
      create: {
        id: profile.id,
        name: profile.name,
        description: profile.description,
        isSystem: true,
      },
    })

    await client.permissionProfilePermission.deleteMany({
      where: {
        profileId: profile.id,
        permissionId: {
          notIn: profile.permissions,
        },
      },
    })

    for (const permissionId of profile.permissions) {
      await client.permissionProfilePermission.upsert({
        where: {
          profileId_permissionId: {
            profileId: profile.id,
            permissionId,
          },
        },
        update: {},
        create: {
          profileId: profile.id,
          permissionId,
        },
      })
    }
  }
}

async function backfillProfileAssignments(client: AuthorizationCatalogClient) {
  for (const role of Object.keys(LEGACY_ROLE_PERMISSION_PROFILE) as UserRole[]) {
    await client.profile.updateMany({
      where: {
        permissionProfileId: null,
        role,
      },
      data: {
        permissionProfileId: LEGACY_ROLE_PERMISSION_PROFILE[role],
      },
    })
  }

  await client.profile.updateMany({
    where: {
      permissionProfileId: null,
      role: null,
    },
    data: {
      permissionProfileId: LEGACY_ROLE_PERMISSION_PROFILE.operator,
    },
  })
}

export async function syncAuthorizationCatalog(client: AuthorizationCatalogClient = prisma) {
  await upsertPermissions(client)
  await upsertPermissionProfiles(client)
  await backfillProfileAssignments(client)
}
