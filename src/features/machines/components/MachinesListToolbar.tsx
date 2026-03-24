'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { ScreenToolbar } from '@/components/screen/ScreenToolbar'

export function MachinesListToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '')
  const status = searchParams.get('status') ?? 'all'
  const type = searchParams.get('type') ?? 'all'
  const priority = searchParams.get('priority') ?? 'all'

  // Debounce search input
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchValue) {
      params.set('search', searchValue)
    } else {
      params.delete('search')
    }
    
    const timeoutId = setTimeout(() => {
      router.push(`?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchValue, router, searchParams])

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === 'all' || !value) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    router.push(`?${params.toString()}`)
  }

  return (
    <ScreenToolbar>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={searchValue}
          onChange={event => setSearchValue(event.target.value)}
          placeholder="Buscar por nombre, codigo o etiqueta..."
          className="input pl-9"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          value={status}
          onChange={event => updateParams({ status: event.target.value })}
          className="input w-auto text-sm"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="maintenance">Mantenimiento</option>
          <option value="inactive">Inactivo</option>
        </select>
        <select
          value={type}
          onChange={event => updateParams({ type: event.target.value })}
          className="input w-auto text-sm"
        >
          <option value="all">Todos los tipos</option>
          <option value="machine">Maquina</option>
          <option value="equipment">Equipo</option>
          <option value="process">Proceso</option>
          <option value="service">Servicio</option>
        </select>
        <select
          value={priority}
          onChange={event => updateParams({ priority: event.target.value })}
          className="input w-auto text-sm"
        >
          <option value="all">Toda prioridad</option>
          <option value="critical">Critico</option>
          <option value="high">Alto</option>
          <option value="medium">Medio</option>
        </select>
      </div>
    </ScreenToolbar>
  )
}
