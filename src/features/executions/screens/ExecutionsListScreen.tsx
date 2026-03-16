// Route: /executions
// Access: operator | supervisor | admin
// Purpose: render the executions listing while keeping the route entrypoint thin.

'use client'

import { useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { Activity, CheckCircle2, ChevronRight, Clock, Cpu, PlayCircle, Plus, Search, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { PriorityBadge } from '@/components/display/PriorityBadge'
import { StateBadge } from '@/components/display/StateBadge'
import { EmptyState } from '@/components/screen/EmptyState'
import { ScreenHeader } from '@/components/screen/ScreenHeader'
import { ScreenPage } from '@/components/screen/ScreenPage'
import { ScreenStatsGrid } from '@/components/screen/ScreenStatsGrid'
import { ScreenToolbar } from '@/components/screen/ScreenToolbar'
import { ViewCycleNav } from '@/features/navigation/components/ViewCycleNav'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import {
  getDemoChecklistById,
  getDemoMachineById,
  getDemoProfileById,
  listDemoExecutions,
} from '@/lib/demo/queries'
import type { ExecutionStatus } from '@/types'

const executionStatusConfig: Record<
  ExecutionStatus,
  { label: string; className: string; iconClassName: string; surfaceClassName: string; Icon: React.ElementType }
> = {
  completed: {
    label: 'Completado',
    className: 'status-completed',
    iconClassName: 'text-emerald-400',
    surfaceClassName: 'bg-emerald-500/15',
    Icon: CheckCircle2,
  },
  pending: {
    label: 'Pendiente',
    className: 'status-pending',
    iconClassName: 'text-blue-400',
    surfaceClassName: 'bg-surface-300',
    Icon: Clock,
  },
  in_progress: {
    label: 'En progreso',
    className: 'status-in_progress',
    iconClassName: 'text-cyan-400',
    surfaceClassName: 'bg-cyan-500/15',
    Icon: Activity,
  },
  failed: {
    label: 'Fallido',
    className: 'status-failed',
    iconClassName: 'text-red-400',
    surfaceClassName: 'bg-red-500/15',
    Icon: XCircle,
  },
  cancelled: {
    label: 'Cancelado',
    className: 'status-inactive',
    iconClassName: 'text-slate-400',
    surfaceClassName: 'bg-surface-300',
    Icon: XCircle,
  },
}

export function ExecutionsListScreen() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | ExecutionStatus>('all')
  const executions = listDemoExecutions()

  const filtered = executions.filter(execution => {
    const machine = getDemoMachineById(execution.machine_id)
    const checklist = getDemoChecklistById(execution.checklist_id)
    const normalizedSearch = search.toLowerCase()
    const matchesSearch =
      !search ||
      machine?.name.toLowerCase().includes(normalizedSearch) ||
      checklist?.name.toLowerCase().includes(normalizedSearch)
    const matchesStatus = filterStatus === 'all' || execution.status === filterStatus

    return Boolean(matchesSearch && matchesStatus)
  })

  const counts = {
    total: executions.length,
    completed: executions.filter(execution => execution.status === 'completed').length,
    pending: executions.filter(execution => execution.status === 'pending').length,
    inProgress: executions.filter(execution => execution.status === 'in_progress').length,
  }

  return (
    <ScreenPage>
      <ScreenHeader
        title="Ejecuciones"
        description={`${counts.total} ejecuciones registradas`}
        icon={PlayCircle}
        accentClassName="text-cyan-400"
        actions={
          <Link href={ROUTE_PATHS.executions.create} className="btn-primary">
            <Plus className="h-4 w-4" />
            Nueva ejecucion
          </Link>
        }
      />

      <ScreenStatsGrid
        columnsClassName="grid-cols-1 sm:grid-cols-4"
        items={[
          { label: 'Total', value: counts.total, tone: 'neutral' },
          { label: 'Pendientes', value: counts.pending, tone: 'blue' },
          { label: 'En progreso', value: counts.inProgress, tone: 'cyan' },
          { label: 'Completadas', value: counts.completed, tone: 'emerald' },
        ]}
      />

      <ScreenToolbar className="items-start">
        <div className="flex flex-1 flex-wrap gap-2">
          {[
            { key: 'all', label: `Todas (${counts.total})` },
            { key: 'pending', label: `Pendientes (${counts.pending})` },
            { key: 'in_progress', label: `En progreso (${counts.inProgress})` },
            { key: 'completed', label: `Completadas (${counts.completed})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key as 'all' | ExecutionStatus)}
              className={clsx(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                filterStatus === tab.key
                  ? 'border border-accent-cyan/30 bg-accent-cyan/15 text-accent-cyan'
                  : 'border border-surface-300 bg-surface-200 text-slate-400 hover:border-surface-500'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar..."
            className="input pl-9"
          />
        </div>
      </ScreenToolbar>

      <div className="space-y-2">
        {filtered.map((execution, index) => {
          const machine = getDemoMachineById(execution.machine_id)
          const checklist = getDemoChecklistById(execution.checklist_id)
          const assigned = getDemoProfileById(execution.assigned_to || execution.executed_by || '')
          const status = executionStatusConfig[execution.status]
          const StatusIcon = status.Icon

          return (
            <Link
              key={execution.id}
              href={ROUTE_PATHS.executions.detail(execution.id)}
              className="card-hover flex items-center gap-4 p-4 animate-in"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className={clsx('flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl', status.surfaceClassName)}>
                <StatusIcon
                  className={clsx('h-4.5 w-4.5', status.iconClassName, execution.status === 'in_progress' ? 'animate-pulse' : null)}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">{checklist?.name}</span>
                  <PriorityBadge level={execution.priority} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Cpu className="h-3 w-3" />
                    {machine?.name}
                  </span>
                  {assigned ? <span>Asignado: {assigned.full_name}</span> : null}
                </div>
              </div>
              <div className="flex-shrink-0 space-y-1 text-right">
                <div className="flex justify-end">
                  <StateBadge value={execution.status} config={executionStatusConfig} />
                </div>
                {execution.score !== undefined && execution.score !== null ? (
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-300">
                      <div
                        className={clsx(
                          'h-full rounded-full',
                          execution.score >= 90 ? 'bg-emerald-400' : execution.score >= 70 ? 'bg-amber-400' : 'bg-red-400'
                        )}
                        style={{ width: `${execution.score}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-slate-400">{execution.score}%</span>
                  </div>
                ) : null}
                {execution.scheduled_at ? (
                  <p className="text-xs text-slate-600">
                    {formatDistanceToNow(new Date(execution.scheduled_at), { addSuffix: true, locale: es })}
                  </p>
                ) : null}
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-600" />
            </Link>
          )
        })}

        {filtered.length === 0 ? (
          <EmptyState
            icon={PlayCircle}
            title="No se encontraron ejecuciones"
            description="Ajusta el filtro o crea una nueva ejecucion."
          />
        ) : null}
      </div>

      <ViewCycleNav currentHref={ROUTE_PATHS.executions.list} />
    </ScreenPage>
  )
}
