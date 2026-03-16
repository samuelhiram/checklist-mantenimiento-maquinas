// Route: /machines/[id]
// Access: operator | supervisor | admin
// Purpose: render the machine detail flow from the machines feature instead of the route entrypoint.

'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { Activity, AlertTriangle, ArrowLeft, CheckCircle2, ChevronRight, ClipboardList, Clock, Cpu, PlayCircle, Plus, Settings, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthState } from '@/components/ui/AuthProvider'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { getAppAccessSnapshot } from '@/lib/auth/authorization'
import {
  getDemoChecklistById,
  getDemoMachineById,
  listDemoChecklistsByMachine,
  listDemoExecutionsByMachine,
  listDemoFindingsByMachine,
} from '@/lib/demo/queries'
import type { ExecutionStatus, PriorityLevel } from '@/types'
import { MACHINE_TYPE_LABEL } from '../config'

const PRIORITY_BADGE: Record<PriorityLevel, string> = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
}

const PRIORITY_LABEL: Record<PriorityLevel, string> = {
  critical: 'Critico',
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
}

const EXECUTION_STATUS_CLASS: Record<ExecutionStatus, string> = {
  completed: 'status-completed',
  pending: 'status-pending',
  in_progress: 'status-in_progress',
  failed: 'status-failed',
  cancelled: 'status-inactive',
}

const EXECUTION_STATUS_LABEL: Record<ExecutionStatus, string> = {
  completed: 'Completado',
  pending: 'Pendiente',
  in_progress: 'En progreso',
  failed: 'Fallido',
  cancelled: 'Cancelado',
}

const MACHINE_STATUS_CLASS: Record<string, string> = {
  active: 'status-active',
  maintenance: 'status-maintenance',
  inactive: 'status-inactive',
  decommissioned: 'status-inactive',
}

const MACHINE_STATUS_LABEL: Record<string, string> = {
  active: 'Activo',
  maintenance: 'En mantenimiento',
  inactive: 'Inactivo',
  decommissioned: 'Dado de baja',
}

function executionSurfaceClass(status: ExecutionStatus) {
  if (status === 'completed') return 'bg-emerald-500/15'
  if (status === 'in_progress') return 'bg-cyan-500/15'
  if (status === 'failed') return 'bg-red-500/15'
  return 'bg-surface-300'
}

function ExecutionStatusIcon({ status }: { status: ExecutionStatus }) {
  if (status === 'completed') return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
  if (status === 'in_progress') return <Activity className="h-3.5 w-3.5 text-accent-cyan" />
  if (status === 'failed') return <XCircle className="h-3.5 w-3.5 text-red-400" />
  return <Clock className="h-3.5 w-3.5 text-slate-400" />
}

export function MachineDetailScreen({ machineId }: { machineId: string }) {
  const { user } = useAuthState()
  const access = getAppAccessSnapshot(user)
  const machine = getDemoMachineById(machineId)
  const checklists = listDemoChecklistsByMachine(machineId)
  const executions = listDemoExecutionsByMachine(machineId).slice(0, 8)
  const findings = listDemoFindingsByMachine(machineId)
  const machineAccess = access.machines
  const checklistAccess = access.checklists
  const executionAccess = access.executions
  const findingAccess = access.findings

  if (!machine) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Cpu className="mx-auto mb-4 h-12 w-12 opacity-20" />
        <p>Maquina no encontrada</p>
        <Link href={ROUTE_PATHS.machines.list} className="btn-secondary mt-4 inline-flex">
          Volver
        </Link>
      </div>
    )
  }

  const specEntries = Object.entries(machine.specs)

  return (
    <div className="min-h-full space-y-5 bg-grid p-6">
      <div className="flex items-start gap-4 animate-in">
        <Link
          href={ROUTE_PATHS.machines.list}
          className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-surface-400 bg-surface-200 transition-colors hover:border-accent-cyan/30"
        >
          <ArrowLeft className="h-4 w-4 text-slate-400" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-wide text-white">{machine.name}</h1>
            <span className={MACHINE_STATUS_CLASS[machine.status]}>
              <span
                className={clsx(
                  'h-1.5 w-1.5 rounded-full',
                  machine.status === 'active'
                    ? 'bg-emerald-400'
                    : machine.status === 'maintenance'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-slate-400'
                )}
              />
              {MACHINE_STATUS_LABEL[machine.status]}
            </span>
            <span className={PRIORITY_BADGE[machine.priority]}>{PRIORITY_LABEL[machine.priority]}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="font-mono text-accent-cyan">{machine.code || '--'}</span>
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              {MACHINE_TYPE_LABEL[machine.type] || machine.type}
            </span>
            {machine.manufacturer ? <span>{machine.manufacturer} {machine.model}</span> : null}
          </div>
        </div>
          {machineAccess.edit ? (
            <Link href={ROUTE_PATHS.machines.edit(machine.id)} className="btn-secondary flex-shrink-0">
              <Settings className="h-4 w-4" />
              Editar
            </Link>
          ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 animate-in-delay-1 lg:grid-cols-3">
        {machine.description ? (
          <div className="card p-5 lg:col-span-2">
            <h3 className="mb-2 text-sm font-semibold text-slate-300">Descripcion</h3>
            <p className="text-sm leading-relaxed text-slate-400">{machine.description}</p>
            {machine.serial_number ? <p className="mt-3 font-mono text-xs text-slate-500">N/S: {machine.serial_number}</p> : null}
            {machine.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {machine.tags.map(tag => (
                  <span key={tag} className="rounded bg-surface-300 px-2 py-0.5 font-mono text-xs text-slate-400">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        {specEntries.length > 0 ? (
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-300">Especificaciones</h3>
            <div className="space-y-2">
              {specEntries.map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-surface-300 pb-1.5 text-sm">
                  <span className="capitalize text-slate-500">{key.replace(/_/g, ' ')}</span>
                  <span className="font-mono text-slate-200">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-3 animate-in-delay-1">
        {[
          { label: 'Checklists', value: checklists.length, icon: ClipboardList, color: 'text-violet-400' },
          { label: 'Ejecuciones', value: executions.length, icon: PlayCircle, color: 'text-cyan-400' },
          {
            label: 'Hallazgos abiertos',
            value: findings.filter(item => item.status !== 'resolved').length,
            icon: AlertTriangle,
            color: 'text-amber-400',
          },
        ].map(stat => (
          <div key={stat.label} className="card flex items-center gap-3 p-4">
            <stat.icon className={clsx('h-5 w-5 flex-shrink-0', stat.color)} />
            <div>
              <p className={clsx('font-display text-2xl font-bold', stat.color)}>{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card animate-in-delay-2">
        <div className="flex items-center justify-between border-b border-surface-300 p-5">
          <h2 className="font-display flex items-center gap-2 text-base font-bold tracking-wide text-white">
            <ClipboardList className="h-4 w-4 text-violet-400" />
            Checklists ({checklists.length})
          </h2>
          {checklistAccess.create ? (
            <Link href={ROUTE_PATHS.checklists.createForMachine(machine.id)} className="btn-secondary px-3 py-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Nuevo checklist
            </Link>
          ) : null}
        </div>
        {checklists.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <ClipboardList className="mx-auto mb-3 h-8 w-8 opacity-20" />
            <p className="text-sm">No hay checklists para esta maquina</p>
            {checklistAccess.create ? (
              <Link href={ROUTE_PATHS.checklists.createForMachine(machine.id)} className="btn-secondary mt-3 inline-flex">
                Crear checklist
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="divide-y divide-surface-300">
            {checklists.map(checklist => (
              <div key={checklist.id} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-200">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-200 group-hover:text-white">{checklist.name}</span>
                    <span
                      className={clsx(
                        'rounded px-1.5 py-0.5 text-xs',
                        checklist.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : checklist.status === 'draft'
                            ? 'bg-slate-500/15 text-slate-400'
                            : 'bg-surface-300 text-slate-500'
                      )}
                    >
                      v{checklist.version}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span>{checklist._item_count} items</span>
                    <span>{checklist.estimated_min} min est.</span>
                    <span className="capitalize">
                      {checklist.frequency === 'daily'
                        ? 'Diario'
                        : checklist.frequency === 'weekly'
                          ? 'Semanal'
                          : checklist.frequency === 'monthly'
                            ? 'Mensual'
                            : 'Manual'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span className={PRIORITY_BADGE[checklist.priority]}>{PRIORITY_LABEL[checklist.priority]}</span>
                  {checklistAccess.edit ? (
                    <Link href={ROUTE_PATHS.checklists.edit(checklist.id)} className="btn-secondary px-2 py-1.5 text-xs">
                      <Settings className="h-3 w-3" />
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
            ))}
          </div>
        )}
      </div>

      {executionAccess.view && executions.length > 0 ? (
        <div className="card animate-in-delay-3">
          <div className="flex items-center justify-between border-b border-surface-300 p-5">
            <h2 className="font-display flex items-center gap-2 text-base font-bold tracking-wide text-white">
              <PlayCircle className="h-4 w-4 text-cyan-400" />
              Historial de ejecuciones
            </h2>
            <Link
              href={ROUTE_PATHS.executions.listForMachine(machine.id)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-accent-cyan"
            >
              Ver todas <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-surface-300">
            {executions.map(execution => {
              const checklist = getDemoChecklistById(execution.checklist_id)
              return (
                <Link
                  key={execution.id}
                  href={ROUTE_PATHS.executions.detail(execution.id)}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-200"
                >
                  <div className={clsx('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg', executionSurfaceClass(execution.status))}>
                    <ExecutionStatusIcon status={execution.status} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{checklist?.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {execution.scheduled_at ? format(new Date(execution.scheduled_at), 'd MMM yyyy HH:mm', { locale: es }) : ''}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className={EXECUTION_STATUS_CLASS[execution.status]}>{EXECUTION_STATUS_LABEL[execution.status]}</span>
                    {execution.score !== undefined && execution.score !== null ? (
                      <p className="mt-1 font-mono text-xs text-slate-500">{execution.score}%</p>
                    ) : null}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ) : null}

      {findingAccess.view && findings.length > 0 ? (
        <div className="card animate-in-delay-3">
          <div className="border-b border-surface-300 p-5">
            <h2 className="font-display flex items-center gap-2 text-base font-bold tracking-wide text-white">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Hallazgos ({findings.length})
            </h2>
          </div>
          <div className="divide-y divide-surface-300">
            {findings.map(finding => (
              <Link
                key={finding.id}
                href={ROUTE_PATHS.findings.detail(finding.id)}
                className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-surface-200"
              >
                <span className={PRIORITY_BADGE[finding.severity]}>{PRIORITY_LABEL[finding.severity]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-200">{finding.title}</p>
                  {finding.description ? <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{finding.description}</p> : null}
                </div>
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-xs',
                    finding.status === 'open'
                      ? 'bg-red-500/15 text-red-400'
                      : finding.status === 'in_progress'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                  )}
                >
                  {finding.status === 'open' ? 'Abierto' : finding.status === 'in_progress' ? 'En proceso' : 'Resuelto'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
