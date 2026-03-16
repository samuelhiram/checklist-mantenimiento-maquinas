import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const DEV_ORGANIZATION_SLUG = 'dev-org'

type DevDbClient = Prisma.TransactionClient | typeof prisma

export async function ensureDevOrganization(db: DevDbClient = prisma) {
  return db.organization.upsert({
    where: { slug: DEV_ORGANIZATION_SLUG },
    update: {},
    create: {
      name: 'Dev Organization',
      slug: DEV_ORGANIZATION_SLUG,
      plan: 'free',
      settings: {},
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })
}
