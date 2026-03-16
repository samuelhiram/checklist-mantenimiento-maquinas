// Route: /machines
// Access: operator | supervisor | admin
// Purpose: render the machines listing while keeping the route entrypoint thin.

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Cpu, Plus, Search } from 'lucide-react'
import { useAuthState } from '@/components/ui/AuthProvider'
import { EmptyState } from '@/components/screen/EmptyState'
import { ScreenHeader } from '@/components/screen/ScreenHeader'
import { ScreenPage } from '@/components/screen/ScreenPage'
import { ScreenStatsGrid } from '@/components/screen/ScreenStatsGrid'
import { ScreenToolbar } from '@/components/screen/ScreenToolbar'
import { ViewCycleNav } from '@/features/navigation/components/ViewCycleNav'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { getAppAccessSnapshot } from '@/lib/auth/authorization'
import { listDemoMachines } from '@/lib/demo/queries'
import type { Machine } from '@/types'
import { MachineCard } from '../components/MachineCard'

export function MachinesListScreen() {
  const { user } = useAuthState()
  const access = getAppAccessSnapshot(user)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<{
    status: 'all' | Machine['status']
    type: 'all' | Machine['type']
    priority: 'all' | Machine['priority']
  }>({
    status: 'all',
    type: 'all',
    priority: 'all',
  })
  const machineAccess = access.machines
  const machines = listDemoMachines()

  const filtered = machines.filter(machine => {
    const normalizedSearch = search.toLowerCase()
    const matchesSearch =
      !search ||
      machine.name.toLowerCase().includes(normalizedSearch) ||
      (machine.code?.toLowerCase() || '').includes(normalizedSearch) ||
      machine.tags.some(tag => tag.toLowerCase().includes(normalizedSearch))
    const matchesStatus = filter.status === 'all' || machine.status === filter.status
    const matchesType = filter.type === 'all' || machine.type === filter.type
    const matchesPriority = filter.priority === 'all' || machine.priority === filter.priority

    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const counts = {
    active: machines.filter(machine => machine.status === 'active').length,
    maintenance: machines.filter(machine => machine.status === 'maintenance').length,
    critical: machines.filter(machine => machine.priority === 'critical').length,
  }

  return (
    <ScreenPage>
      <ScreenHeader
        title="Maquinas y Equipos"
        description={`${machines.length} activos registrados / ${counts.active} operativos`}
        icon={Cpu}
        accentClassName="text-blue-400"
        actions={
          machineAccess.create ? (
            <Link href={ROUTE_PATHS.machines.create} className="btn-primary">
              <Plus className="h-4 w-4" />
              Nueva maquina
            </Link>
          ) : null
        }
      />

      <ScreenStatsGrid
        columnsClassName="grid-cols-1 sm:grid-cols-3"
        items={[
          { label: 'Operativos', value: counts.active, tone: 'emerald' },
          { label: 'Mantenimiento', value: counts.maintenance, tone: 'amber' },
          { label: 'Prioridad critica', value: counts.critical, tone: 'red' },
        ]}
      />

      <ScreenToolbar>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar por nombre, codigo o etiqueta..."
            className="input pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filter.status}
            onChange={event => setFilter(current => ({ ...current, status: event.target.value as typeof current.status }))}
            className="input w-auto text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="maintenance">Mantenimiento</option>
            <option value="inactive">Inactivo</option>
          </select>
          <select
            value={filter.type}
            onChange={event => setFilter(current => ({ ...current, type: event.target.value as typeof current.type }))}
            className="input w-auto text-sm"
          >
            <option value="all">Todos los tipos</option>
            <option value="machine">Maquina</option>
            <option value="equipment">Equipo</option>
            <option value="process">Proceso</option>
            <option value="service">Servicio</option>
          </select>
          <select
            value={filter.priority}
            onChange={event => setFilter(current => ({ ...current, priority: event.target.value as typeof current.priority }))}
            className="input w-auto text-sm"
          >
            <option value="all">Toda prioridad</option>
            <option value="critical">Critico</option>
            <option value="high">Alto</option>
            <option value="medium">Medio</option>
          </select>
        </div>
      </ScreenToolbar>

      {search ? (
        <p className="animate-in text-sm text-slate-500">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para &quot;{search}&quot;
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(machine => (
          <MachineCard key={machine.id} machine={machine} />
        ))}
        {filtered.length === 0 ? (
          <div className="col-span-1 md:col-span-2 xl:col-span-3">
            <EmptyState
              icon={Cpu}
              title="No se encontraron maquinas"
              description="Intenta ajustar los filtros de busqueda"
            />
          </div>
        ) : null}
      </div>

      <ViewCycleNav currentHref={ROUTE_PATHS.machines.list} />
    </ScreenPage>
  )
}
