// Used by routes: development login screens and the authenticated app shell.
// Purpose: provide fast access to protected routes with or without an active app session.

'use client'

import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { useAsyncUi } from '@/components/feedback/AsyncUiProvider'
import type { AuthenticatedProfile, UserRole } from '@/types'
import { hasPermission } from '@/lib/auth/permission-profiles'
import { isActiveNavigationPath } from '../path-matching'
import { ROUTE_PATHS } from '../routes'
import { APP_VIEWS } from '../views'
import { TrackedLink } from './TrackedLink'

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'admin',
  supervisor: 'supervisor',
  operator: 'operator',
}

export function ProtectedRoutesMenu({ profile }: { profile?: AuthenticatedProfile | null }) {
  const pathname = usePathname()
  const { isNavigating, pendingHref, lastNavigation } = useAsyncUi()
  const roleLabel = profile ? ROLE_LABELS[profile.role] : 'sin sesion'

  return (
    <div className="border-b border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Dev Fast Access</p>
          <p className="text-xs text-slate-400">
            Entorno development activo. Contexto actual:{' '}
            <span className="font-mono text-slate-200">{profile?.permission_profile_name || roleLabel}</span>
          </p>
          <p className="mt-1 flex min-h-[18px] items-center gap-1.5 text-[11px] text-slate-500">
            {isNavigating ? (
              <span className="flex items-center gap-2 animate-pulse text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span>
                  Navegando a <span className="font-mono text-slate-300">{pendingHref}</span>
                </span>
              </span>
            ) : lastNavigation ? (
              <span>
                Ultima navegacion: <span className="font-mono text-cyan-200">{lastNavigation.durationMs}ms</span> hacia{' '}
                <span className="font-mono text-slate-300">{lastNavigation.href}</span>
              </span>
            ) : (
              <span>Sin mediciones aun.</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {APP_VIEWS.map(view => {
            const hasAccess = hasPermission(profile?.permissions, view.requiredPermission)
            const isActive = isActiveNavigationPath(pathname, view.href)
            const shouldTrackNavigation = Boolean(profile && hasAccess)

            return (
              <TrackedLink
                key={view.href}
                href={view.href}
                trackNavigation={shouldTrackNavigation}
                trackingLabel={`Navegando a ${view.label}`}
                pendingClassName="ring-1 ring-cyan-400/30"
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors',
                  isActive
                    ? 'bg-cyan-400/10 text-cyan-200'
                    : profile && hasAccess
                      ? 'bg-surface-200 text-slate-300 hover:text-cyan-200'
                      : profile
                        ? 'bg-amber-500/10 text-amber-300'
                        : 'bg-surface-200/90 text-slate-300 hover:text-cyan-200'
                )}
                title={
                  profile
                    ? hasAccess
                      ? view.description
                      : `Acceso restringido para ${profile.permission_profile_name}`
                    : `${view.description} Requiere login.`
                }
              >
                {view.label}
                {profile && !hasAccess ? ' (bloqueada)' : null}
              </TrackedLink>
            )
          })}
          <TrackedLink
            href={ROUTE_PATHS.dev.authAdmin}
            trackNavigation={pathname !== ROUTE_PATHS.dev.login}
            trackingLabel="Navegando a Dev auth"
            pendingClassName="ring-1 ring-violet-400/30"
            className="inline-flex items-center gap-1.5 rounded-md bg-violet-500/10 px-2.5 py-1.5 text-xs text-violet-200 transition-colors hover:bg-violet-500/20"
            title="Acceso tecnico para gestionar usuarios de prueba"
          >
            Dev auth
          </TrackedLink>
        </div>
      </div>
    </div>
  )
}
