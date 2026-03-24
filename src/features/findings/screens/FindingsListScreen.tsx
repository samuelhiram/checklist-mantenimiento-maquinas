// Route: /findings
// Access: operator | supervisor | admin
// Purpose: render the findings listing while keeping the route entrypoint thin.

'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { AlertTriangle, Calendar, CheckCircle2, Cpu, Search } from 'lucide-react'
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
import { getDemoMachineById, getDemoProfileById, listDemoFindings } from '@/lib/demo/queries'
import type { FindingStatus } from '@/types'

const findingStatusConfig: Record<FindingStatus, { label: string; className: string }> = {
  open: {
    label: 'Abierto',
    className: 'inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400',
  },
  in_progress: {
    label: 'En proceso',
    className: 'inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400',
  },
  resolved: {
    label: 'Resuelto',
    className: 'inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400',
  },
  closed: { label: 'Cerrado', className: 'status-inactive' },
}

export function FindingsListScreen() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | FindingStatus>('all')
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')
  const findings = listDemoFindings()

  const filtered = findings.filter(finding => {
    const machine = getDemoMachineById(finding.machine_id)
    const normalizedSearch = search.toLowerCase()
    const matchesSearch =
      !search ||
      finding.title.toLowerCase().includes(normalizedSearch) ||
      machine?.name.toLowerCase().includes(normalizedSearch)
    const matchesStatus = filterStatus === 'all' || finding.status === filterStatus
    const matchesSeverity = filterSeverity === 'all' || finding.severity === filterSeverity

    return Boolean(matchesSearch && matchesStatus && matchesSeverity)
  })

  const counts = {
    open: findings.filter(finding => finding.status === 'open').length,
    inProgress: findings.filter(finding => finding.status === 'in_progress').length,
    resolved: findings.filter(finding => finding.status === 'resolved').length,
    critical: findings.filter(finding => finding.severity === 'critical').length,
  }

  return (
    <ScreenPage>
      <ScreenHeader
        size="lg"
        title="Hallazgos y No Conformidades"
        description={`${findings.length} hallazgos registrados`}
        icon={AlertTriangle}
        accentClassName="text-amber-400"
      />

      <ScreenStatsGrid
        columnsClassName="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
        items={[
          { label: 'Abiertos', value: counts.open, tone: 'red' },
          { label: 'En proceso', value: counts.inProgress, tone: 'amber' },
          { label: 'Resueltos', value: counts.resolved, tone: 'emerald' },
          { label: 'Criticos', value: counts.critical, tone: 'rose' },
        ]}
      />

      <ScreenToolbar>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar hallazgo..."
            className="input pl-9"
          />
        </div>
        <select value={filterStatus} onChange={event => setFilterStatus(event.target.value as 'all' | FindingStatus)} className="input w-auto text-sm">
          <option value="all">Todos los estados</option>
          <option value="open">Abierto</option>
          <option value="in_progress">En proceso</option>
          <option value="resolved">Resuelto</option>
          <option value="closed">Cerrado</option>
        </select>
        <select
          value={filterSeverity}
          onChange={event => setFilterSeverity(event.target.value as 'all' | 'critical' | 'high' | 'medium' | 'low')}
          className="input w-auto text-sm"
        >
          <option value="all">Toda severidad</option>
          <option value="critical">Critico</option>
          <option value="high">Alto</option>
          <option value="medium">Medio</option>
          <option value="low">Bajo</option>
        </select>
      </ScreenToolbar>

      <div className="space-y-3">
        {filtered.map((finding, index) => {
          const machine = getDemoMachineById(finding.machine_id)
          const reporter = finding.reported_by ? getDemoProfileById(finding.reported_by) : undefined

          return (
            <div
              key={finding.id}
              className="card group p-5 transition-all hover:border-surface-500 animate-in"
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={clsx(
                    'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
                    finding.severity === 'critical'
                      ? 'bg-red-500/15'
                      : finding.severity === 'high'
                        ? 'bg-amber-500/15'
                        : 'bg-surface-300'
                  )}
                >
                  <AlertTriangle
                    className={clsx(
                      'h-4.5 w-4.5',
                      finding.severity === 'critical'
                        ? 'text-red-400'
                        : finding.severity === 'high'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white">{finding.title}</span>
                    <PriorityBadge level={finding.severity} />
                    <StateBadge value={finding.status} config={findingStatusConfig} />
                  </div>
                  {finding.description ? (
                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">{finding.description}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    {machine ? (
                      <span className="flex items-center gap-1">
                        <Cpu className="h-3 w-3" />
                        {machine.name}
                      </span>
                    ) : null}
                    {reporter ? <span>Reportado por: {reporter.full_name}</span> : null}
                    <span className="ml-auto flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(finding.created_at), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No se encontraron hallazgos"
            description="Todo esta en orden con los filtros actuales."
          />
        ) : null}
      </div>

      <ViewCycleNav currentHref={ROUTE_PATHS.findings.list} />
    </ScreenPage>
  )
}
