import path from 'node:path'
import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'prisma/config'

// Prisma CLI does not read .env.local automatically, so we align it with the
// app's local workflow before schema env() values are resolved.
loadEnv({ path: path.resolve(process.cwd(), '.env') })
loadEnv({ path: path.resolve(process.cwd(), '.env.local'), override: true })

export default defineConfig({
  schema: 'prisma/schema.prisma',
})
