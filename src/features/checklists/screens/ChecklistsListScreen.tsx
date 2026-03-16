// Route: /checklists
// Access: operator | supervisor | admin
// Purpose: render the checklists listing while keeping the route entrypoint thin.

'use client'

import { useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { Calendar, ClipboardList, Clock, Cpu, PlayCircle, Plus, Search, Settings } from 'lucide-react'
import { useAuthState } from '@/components/ui/AuthProvider'
import { PriorityBadge } from '@/components/display/PriorityBadge'
import { StateBadge } from '@/components/display/StateBadge'
import { EmptyState } from '@/components/screen/EmptyState'
import { ScreenHeader } from '@/components/screen/ScreenHeader'
import { ScreenPage } from '@/components/screen/ScreenPage'
import { ScreenStatsGrid } from '@/components/screen/ScreenStatsGrid'
import { ScreenToolbar } from '@/components/screen/ScreenToolbar'
import { ViewCycleNav } from '@/features/navigation/components/ViewCycleNav'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { getAppAccessSnapshot } from '@/lib/auth/authorization'
import { listDemoChecklists, listDemoMachines } from '@/lib/demo/queries'
import type { ChecklistStatus, FrequencyType } from '@/types'

const checklistStatusConfig: Record<ChecklistStatus, { label: string; className: string }> = {
  active: { label: 'Activo', className: 'status-active' },
  draft: {
    label: 'Borrador',
    className: 'inline-flex items-center gap-1.5 rounded-full bg-surface-300 px-2 py-0.5 text-xs font-medium text-slate-400',
  },
  archived: { label: 'Archivado', className: 'status-inactive' },
}

const frequencyLabel: Record<FrequencyType, string> = {
  manual: 'Manual',
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  custom: 'Personalizado',
}

const frequencyColor: Record<FrequencyType, string> = {
  manual: 'text-slate-400',
  daily: 'text-cyan-400',
  weekly: 'text-blue-400',
  monthly: 'text-violet-400',
  custom: 'text-emerald-400',
}

export function ChecklistsListScreen() {
  const { user } = useAuthState()
  const access = getAppAccessSnapshot(user)
  const [search, setSearch] = useState('')
  const [filterMachine, setFilterMachine] = useState('all')
  const [filterFreq, setFilterFreq] = useState('all')
  const checklistAccess = access.checklists
  const executionAccess = access.executions
  const checklists = listDemoChecklists()
  const machines = listDemoMachines()

  const filtered = checklists.filter(checklist => {
    const matchesSearch = !search || checklist.name.toLowerCase().includes(search.toLowerCase())
    const matchesMachine = filterMachine === 'all' || checklist.machine_id === filterMachine
    const matchesFrequency = filterFreq === 'all' || checklist.frequency === filterFreq

    return matchesSearch && matchesMachine && matchesFrequency
  })

  const counts = {
    active: checklists.filter(checklist => checklist.status === 'active').length,
    draft: checklists.filter(checklist => checklist.status === 'draft').length,
    manual: checklists.filter(checklist => checklist.frequency === 'manual').length,
  }

  return (
    <ScreenPage>
      <ScreenHeader
        title="Checklists"
        description={`${checklists.length} plantillas configuradas`}
        icon={ClipboardList}
        accentClassName="text-violet-400"
        actions={
          checklistAccess.create ? (
            <Link href={ROUTE_PATHS.checklists.create} className="btn-primary">
              <Plus className="h-4 w-4" />
              Nuevo checklist
            </Link>
          ) : null
        }
      />

      <ScreenStatsGrid
        columnsClassName="grid-cols-1 sm:grid-cols-3"
        items={[
          { label: 'Activos', value: counts.active, tone: 'emerald' },
          { label: 'Borrador', value: counts.draft, tone: 'neutral' },
          { label: 'Frecuencia manual', value: counts.manual, tone: 'cyan' },
        ]}
      />

      <ScreenToolbar>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar checklist..."
            className="input pl-9"
          />
        </div>
        <select value={filterMachine} onChange={event => setFilterMachine(event.target.value)} className="input w-auto text-sm">
          <option value="all">Todas las maquinas</option>
          {machines.map(machine => (
            <option key={machine.id} value={machine.id}>
              {machine.name}
            </option>
          ))}
        </select>
        <select value={filterFreq} onChange={event => setFilterFreq(event.target.value)} className="input w-auto text-sm">
          <option value="all">Toda frecuencia</option>
          <option value="daily">Diario</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensual</option>
          <option value="manual">Manual</option>
        </select>
      </ScreenToolbar>

      <div className="space-y-3">
        {filtered.map((checklist, index) => {
          const machine = machines.find(item => item.id === checklist.machine_id)

          return (
            <div
              key={checklist.id}
              className="card group p-5 transition-all hover:border-surface-500 animate-in"
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white transition-colors group-hover:text-accent-cyan">
                      {checklist.name}
                    </span>
                    <PriorityBadge level={checklist.priority} />
                    <StateBadge value={checklist.status} config={checklistStatusConfig} />
                    <span className="text-xs text-slate-600">v{checklist.version}</span>
                  </div>
                  {checklist.description ? (
                    <p className="mt-1.5 line-clamp-1 text-xs text-slate-500">{checklist.description}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    {machine ? (
                      <span className="flex items-center gap-1">
                        <Cpu className="h-3 w-3" />
                        {machine.name}
                      </span>
                    ) : null}
                    <span className="flex items-center gap-1">
                      <ClipboardList className="h-3 w-3" />
                      {checklist._item_count ?? 0} items
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {checklist.estimated_min} min
                    </span>
                    <span className={clsx('flex items-center gap-1', frequencyColor[checklist.frequency])}>
                      <Calendar className="h-3 w-3" />
                      {frequencyLabel[checklist.frequency]}
                    </span>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  {checklistAccess.edit ? (
                    <Link href={ROUTE_PATHS.checklists.edit(checklist.id)} className="btn-secondary px-3 py-1.5 text-xs">
                      <Settings className="h-3.5 w-3.5" />
                      Editar
                    </Link>
                  ) : null}
                  {executionAccess.run ? (
                    <Link href={ROUTE_PATHS.executions.createForChecklist(checklist.id)} className="btn-primary px-3 py-1.5 text-xs">
                      <PlayCircle className="h-3.5 w-3.5" />
                      Ejecutar
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No se encontraron checklists"
            description="Prueba otros filtros o crea una nueva plantilla."
          />
        ) : null}
      </div>

      <ViewCycleNav currentHref={ROUTE_PATHS.checklists.list} />
    </ScreenPage>
  )
}
