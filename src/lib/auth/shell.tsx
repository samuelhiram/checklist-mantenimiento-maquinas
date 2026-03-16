// Used by routes: authenticated app sections such as /dashboard, /machines and /checklists.
// Purpose: enforce auth once and provide the shared shell plus development-only fast access.

import { ProtectedRoutesMenu } from '@/features/navigation/components/ProtectedRoutesMenu'
import { AppSidebar } from '@/features/shell/components/AppSidebar'
import { requireAnyPermission, requireRole, requireSession } from './session'
import type { AppPermission, UserRole } from '@/types'

export async function AppShell({
  children,
  roles,
  requiredPermissions,
}: {
  children: React.ReactNode
  roles?: UserRole[]
  requiredPermissions?: AppPermission[]
}) {
  const session = requiredPermissions?.length
    ? await requireAnyPermission(requiredPermissions)
    : roles?.length
      ? await requireRole(roles)
      : await requireSession()

  return (
    <div className="flex h-screen overflow-hidden bg-surface-0">
      <AppSidebar />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {process.env.NODE_ENV === 'development' ? <ProtectedRoutesMenu profile={session.profile} /> : null}
        <div className="flex-1 min-h-full">{children}</div>
      </main>
    </div>
  )
}
