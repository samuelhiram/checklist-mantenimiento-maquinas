import { requireAdminViewAccess } from '@/lib/auth/authorization-guards'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminViewAccess()

  return children
}
