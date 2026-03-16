import { PrismaClient } from '@prisma/client'

// Single Prisma client for the Next.js runtime.
// Rule: all database access in the app must import this instance instead of
// creating new PrismaClient objects ad hoc.
declare global {
  var prismaGlobal: PrismaClient | undefined
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}
