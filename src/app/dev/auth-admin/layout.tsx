import { requireDevAdminSession } from '@/lib/auth/dev-admin'

export default async function DevAuthAdminLayout({ children }: { children: React.ReactNode }) {
  await requireDevAdminSession()
  return children
}
