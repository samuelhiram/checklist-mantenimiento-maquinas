// Used by routes: /machines
// Purpose: render the primary card for machine, process, and service rows in the machines feature.

import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { PriorityBadge } from '@/components/display/PriorityBadge'
import { StateBadge } from '@/components/display/StateBadge'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import type { Machine } from '@/types'
import { MACHINE_STATUS_CONFIG, MACHINE_TYPE_ICON, MACHINE_TYPE_LABEL } from '../config'

export function MachineCard({ machine }: { machine: Machine }) {
  const Icon = MACHINE_TYPE_ICON[machine.type]

  return (
    <Link href={ROUTE_PATHS.machines.detail(machine.id)} className="card-hover flex flex-col gap-4 p-5 group animate-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-surface-400 bg-surface-300 transition-colors group-hover:border-accent-cyan/30">
            <Icon className="h-5 w-5 text-slate-300" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-white transition-colors group-hover:text-accent-cyan">
              {machine.name}
            </p>
            <p className="mt-0.5 font-mono text-xs text-slate-500">{machine.code || '--'}</p>
            <p className="mt-1 text-xs text-slate-500">{MACHINE_TYPE_LABEL[machine.type]}</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
          <StateBadge value={machine.status} config={MACHINE_STATUS_CONFIG} />
          <PriorityBadge level={machine.priority} />
        </div>
      </div>

      {machine.description ? (
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">{machine.description}</p>
      ) : null}

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-slate-600" />
          {machine._checklist_count ?? 0} checklist{(machine._checklist_count ?? 0) !== 1 ? 's' : ''}
        </span>
        {(machine._open_findings ?? 0) > 0 ? (
          <span className="flex items-center gap-1 text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            {machine._open_findings} hallazgo{(machine._open_findings ?? 0) !== 1 ? 's' : ''}
          </span>
        ) : null}
        {machine._last_execution ? (
          <span className="ml-auto flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(machine._last_execution), { addSuffix: true, locale: es })}
          </span>
        ) : null}
      </div>

      {machine.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {machine.tags.slice(0, 3).map(tag => (
            <span key={tag} className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-xs text-slate-400">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  )
}
