import path from 'node:path'
import { config as loadEnv } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import {
  AUTHORIZATION_PROFILE_CATALOG,
  LEGACY_ROLE_PERMISSION_PROFILE,
  getAuthorizationPermissionEntries,
  getProfileGrantPermissionIds,
} from '../src/lib/auth/authorization-catalog.ts'

loadEnv({ path: path.resolve(process.cwd(), '.env') })
loadEnv({ path: path.resolve(process.cwd(), '.env.local'), override: true })

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})

async function syncAuthorizationCatalog() {
  for (const permission of getAuthorizationPermissionEntries()) {
    await prisma.permission.upsert({
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

  for (const [profileId, profile] of Object.entries(AUTHORIZATION_PROFILE_CATALOG)) {
    const permissionIds = getProfileGrantPermissionIds(profileId)

    await prisma.permissionProfile.upsert({
      where: { id: profileId },
      update: {
        name: profile.name,
        description: profile.description,
        isSystem: true,
      },
      create: {
        id: profileId,
        name: profile.name,
        description: profile.description,
        isSystem: true,
      },
    })

    await prisma.permissionProfilePermission.deleteMany({
      where: {
        profileId,
        permissionId: {
          notIn: permissionIds,
        },
      },
    })

    for (const permissionId of permissionIds) {
      await prisma.permissionProfilePermission.upsert({
        where: {
          profileId_permissionId: {
            profileId,
            permissionId,
          },
        },
        update: {},
        create: {
          profileId,
          permissionId,
        },
      })
    }
  }

  for (const [role, permissionProfileId] of Object.entries(LEGACY_ROLE_PERMISSION_PROFILE)) {
    await prisma.profile.updateMany({
      where: {
        permissionProfileId: null,
        role,
      },
      data: {
        permissionProfileId,
      },
    })
  }

  await prisma.profile.updateMany({
    where: {
      permissionProfileId: null,
      role: null,
    },
    data: {
      permissionProfileId: LEGACY_ROLE_PERMISSION_PROFILE.operator,
    },
  })
}

async function main() {
  await syncAuthorizationCatalog()
  console.log('[authz] Catalog synced successfully.')
}

main()
  .catch(error => {
    console.error('[authz] Catalog sync failed.')
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
