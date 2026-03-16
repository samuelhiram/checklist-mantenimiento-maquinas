// Used by routes: core authenticated views such as /machines, /checklists and /executions.
// Purpose: provide previous/next navigation from the centralized view registry.

'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthState } from '@/components/ui/AuthProvider'
import { getAdjacentViews } from '../views'
import { TrackedLink } from './TrackedLink'

export function ViewCycleNav({ currentHref }: { currentHref: string }) {
  const { user } = useAuthState()
  const permissions = user?.permissions ?? null
  const { previous, next } = getAdjacentViews(currentHref, permissions)

  if (!previous || !next) {
    return null
  }

  return (
    <nav className="flex flex-col gap-3 pt-2 animate-in-delay-3 sm:flex-row">
      <TrackedLink
        href={previous.href}
        trackingLabel={`Navegando a ${previous.label}`}
        className="card-hover flex flex-1 items-center justify-between gap-4 p-4"
      >
        <div className="flex items-center gap-3">
          <ChevronLeft className="h-4 w-4 text-slate-500" />
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Anterior</p>
            <p className="text-sm font-semibold text-slate-200">{previous.label}</p>
          </div>
        </div>
      </TrackedLink>
      <TrackedLink
        href={next.href}
        trackingLabel={`Navegando a ${next.label}`}
        className="card-hover flex flex-1 items-center justify-between gap-4 p-4"
      >
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Siguiente</p>
          <p className="text-sm font-semibold text-slate-200">{next.label}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-500" />
      </TrackedLink>
    </nav>
  )
}
