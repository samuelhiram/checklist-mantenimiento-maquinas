// Used by routes: authenticated shell across /dashboard, /machines, /checklists, /executions, /findings, /admin
// Purpose: render navigation from the centralized view registry instead of per-component constants.

'use client'

import { startTransition, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { Activity, ChevronRight, LogOut } from 'lucide-react'
import { AsyncButton } from '@/components/feedback/AsyncButton'
import { useAuth } from '@/components/ui/AuthProvider'
import { useAsyncAction } from '@/hooks/useAsyncAction'
import { AUTH_TIMINGS } from '@/lib/auth/config'
import { APP_VIEW_ICONS } from '@/features/navigation/view-icons'
import { isActiveNavigationPath } from '@/features/navigation/path-matching'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { getVisibleAppViews } from '@/features/navigation/views'
import { TrackedLink } from '@/features/navigation/components/TrackedLink'

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { auth, clearAuth } = useAuth()
  const { user, org } = auth
  const logoutAction = useAsyncAction({ label: 'Cerrando sesion' })

  const roleColor: Record<string, string> = {
    admin: 'text-rose-400',
    supervisor: 'text-amber-400',
    operator: 'text-emerald-400',
  }

  const roleLabel: Record<string, string> = {
    admin: 'Administrador',
    supervisor: 'Supervisor',
    operator: 'Operador',
  }

  const visibleNav = getVisibleAppViews(user?.permissions ?? null)
  const userId = user?.id ?? null
  const userInitials = user?.full_name
    ? user.full_name.split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase()
    : '--'

  useEffect(() => {
    if (!userId) {
      return
    }

    const touchSession = () => fetch(ROUTE_PATHS.api.authSession, {
      method: 'GET',
      cache: 'no-store',
    }).catch(() => null)

    void touchSession()
    const intervalId = window.setInterval(() => {
      void touchSession()
    }, AUTH_TIMINGS.touchThrottleMs)

    return () => window.clearInterval(intervalId)
  }, [userId])

  const handleLogout = async () => {
    await logoutAction.run(async () => {
      await fetch(ROUTE_PATHS.api.authLogout, { method: 'POST' }).catch(() => null)
      clearAuth()
      startTransition(() => {
        router.replace(ROUTE_PATHS.auth.login)
        router.refresh()
      })
    })
  }

  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-shrink-0 flex-col border-r border-surface-300 bg-surface-50">
      <div className="border-b border-surface-300 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-400 bg-surface-200 shadow-glow-cyan">
            <Activity className="h-4 w-4 text-accent-cyan" />
          </div>
          <div>
            <p className="font-display text-base font-bold leading-none tracking-wide text-white">MAQUINACHECK</p>
            <p className="mt-0.5 max-w-[130px] truncate text-xs text-slate-500">{org?.name}</p>
          </div>
        </div>
        <div className="accent-line mt-4 h-px rounded" />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {visibleNav.map(item => {
          const Icon = APP_VIEW_ICONS[item.icon]
          const active = isActiveNavigationPath(pathname, item.href)

          return (
            <TrackedLink
              key={item.href}
              href={item.href}
              trackingLabel={`Navegando a ${item.label}`}
              pendingClassName="ring-1 ring-cyan-400/30"
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-accent-cyan/10 text-accent-cyan'
                  : 'text-slate-400 hover:bg-surface-200 hover:text-slate-200'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active ? <ChevronRight className="h-3 w-3 opacity-60" /> : null}
            </TrackedLink>
          )
        })}
      </nav>

      <div className="border-t border-surface-300 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-surface-100 px-3 py-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-400 text-xs font-bold text-white">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-200">{user?.full_name}</p>
            <p className={clsx('text-xs font-medium', roleColor[user?.role || 'operator'])}>
              {user?.permission_profile_name || roleLabel[user?.role || 'operator']}
            </p>
          </div>
        </div>
        <AsyncButton
          onClick={handleLogout}
          loading={logoutAction.isLoading}
          loadingLabel="Cerrando sesion..."
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition-all hover:bg-rose-500/10 hover:text-rose-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          Cerrar Sesion
        </AsyncButton>
      </div>
    </aside>
  )
}
