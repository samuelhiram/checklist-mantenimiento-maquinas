// Used by routes: /machines and machine detail-oriented screens.
// Purpose: centralize machine-specific UI labels and status styling in one feature file.

import type { ElementType } from 'react'
import { Activity, BarChart3, Cpu, Wrench } from 'lucide-react'
import type { Machine, MachineStatus } from '@/types'

export const MACHINE_TYPE_ICON: Record<Machine['type'], ElementType> = {
  machine: Cpu,
  process: Activity,
  service: BarChart3,
  equipment: Wrench,
}

export const MACHINE_TYPE_LABEL: Record<Machine['type'], string> = {
  machine: 'Maquina',
  process: 'Proceso',
  service: 'Servicio',
  equipment: 'Equipo',
}

export const MACHINE_STATUS_CONFIG: Record<
  MachineStatus,
  { label: string; className: string; dotClassName: string }
> = {
  active: { label: 'Activo', className: 'status-active', dotClassName: 'bg-emerald-400' },
  inactive: { label: 'Inactivo', className: 'status-inactive', dotClassName: 'bg-slate-400' },
  maintenance: { label: 'Mantenimiento', className: 'status-maintenance', dotClassName: 'bg-amber-400 animate-pulse' },
  decommissioned: { label: 'Dado de baja', className: 'status-inactive', dotClassName: 'bg-slate-600' },
}
