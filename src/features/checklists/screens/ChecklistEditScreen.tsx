// Route: /checklists/[id]/edit
// Access: operator | supervisor | admin
// Purpose: render the checklist editor from the feature layer instead of the route entrypoint.

'use client'

import { memo, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  GripVertical,
  Hash,
  List,
  Plus,
  Ruler,
  Save,
  Trash2,
  Type,
} from 'lucide-react'
import { AsyncButton } from '@/components/feedback/AsyncButton'
import { useAuthState } from '@/components/ui/AuthProvider'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { useAsyncAction } from '@/hooks/useAsyncAction'
import { getAppAccessSnapshot } from '@/lib/auth/authorization'
import { getDemoChecklistById, getDemoMachineById, listDemoChecklistItems } from '@/lib/demo/queries'
import { isItemType } from '@/types'
import type { ChecklistItem, ItemType } from '@/types'

const ITEM_TYPE_CONFIG: Record<ItemType, { icon: React.ElementType; label: string; color: string }> = {
  check: { icon: CheckSquare, label: 'Verificacion', color: 'text-emerald-400' },
  measure: { icon: Ruler, label: 'Medicion', color: 'text-cyan-400' },
  photo: { icon: Camera, label: 'Foto', color: 'text-violet-400' },
  text: { icon: Type, label: 'Texto', color: 'text-blue-400' },
  number: { icon: Hash, label: 'Numero', color: 'text-amber-400' },
  select: { icon: List, label: 'Seleccion', color: 'text-rose-400' },
}

function cloneChecklistItem(item: ChecklistItem): ChecklistItem {
  return {
    ...item,
    options: item.options ? [...item.options] : undefined,
  }
}

const ItemEditor = memo(function ItemEditor({
  item,
  index,
  canEdit,
  onRemove,
  onUpdate,
}: {
  item: ChecklistItem
  index: number
  canEdit: boolean
  onRemove: (itemId: string) => void
  onUpdate: (itemId: string, partial: Partial<ChecklistItem>) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const config = ITEM_TYPE_CONFIG[item.item_type]
  const Icon = config.icon

  const update = (partial: Partial<ChecklistItem>) => onUpdate(item.id, partial)

  return (
    <div className={clsx('card border transition-all', item.is_critical ? 'border-l-2 border-l-red-500/50' : null)}>
      <div className="flex items-center gap-3 p-3.5">
        {canEdit ? (
          <div className="flex-shrink-0 cursor-grab text-slate-600 hover:text-slate-400">
            <GripVertical className="h-4 w-4" />
          </div>
        ) : null}

        <span className="w-5 flex-shrink-0 text-center font-mono text-xs text-slate-600">{index + 1}</span>

        <div
          className={clsx(
            'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded',
            config.color.replace('text-', 'bg-').replace('400', '500/15')
          )}
        >
          <Icon className={clsx('h-3.5 w-3.5', config.color)} />
        </div>

        <input
          value={item.title}
          onChange={event => update({ title: event.target.value })}
          className="flex-1 bg-transparent text-sm font-medium text-slate-200 placeholder-slate-600 focus:outline-none"
          placeholder="Titulo del item..."
          disabled={!canEdit}
        />

        <div className="flex flex-shrink-0 items-center gap-2">
          {item.is_critical ? <span className="badge-critical text-xs">Critico</span> : null}
          {item.is_required ? (
            <span className="rounded bg-surface-300 px-1.5 py-0.5 text-xs text-slate-500">Requerido</span>
          ) : null}
          {canEdit ? (
            <>
              <button
                type="button"
                onClick={() => setExpanded(current => !current)}
                className="flex h-6 w-6 items-center justify-center text-slate-500 transition-colors hover:text-slate-300"
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="flex h-6 w-6 items-center justify-center text-slate-600 transition-colors hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {expanded && canEdit ? (
        <div className="space-y-4 border-t border-surface-300 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tipo de item</label>
              <select
                value={item.item_type}
                onChange={event => {
                  if (isItemType(event.target.value)) {
                    update({ item_type: event.target.value })
                  }
                }}
                className="input text-sm"
              >
                {Object.entries(ITEM_TYPE_CONFIG).map(([type, value]) => (
                  <option key={type} value={type}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Descripcion / Instruccion</label>
              <input
                value={item.description || ''}
                onChange={event => update({ description: event.target.value })}
                className="input text-sm"
                placeholder="Instruccion detallada..."
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={item.is_required}
                onChange={event => update({ is_required: event.target.checked })}
                className="h-4 w-4 rounded border-surface-400 bg-surface-200 text-accent-cyan"
              />
              <span className="text-sm text-slate-300">Requerido</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={item.is_critical}
                onChange={event => update({ is_critical: event.target.checked })}
                className="h-4 w-4 rounded border-surface-400 bg-surface-200 text-red-400"
              />
              <span className="text-sm text-slate-300">
                Critico <span className="text-xs text-slate-500">(bloquea si falla)</span>
              </span>
            </label>
          </div>

          {item.item_type === 'measure' ? (
            <div className="grid grid-cols-4 gap-3 rounded-lg border border-surface-400 bg-surface-200 p-3">
              <div>
                <label className="label">Unidad</label>
                <input
                  value={item.unit || ''}
                  onChange={event => update({ unit: event.target.value })}
                  className="input text-sm"
                  placeholder="PSI, C, bar..."
                />
              </div>
              <div>
                <label className="label">Minimo</label>
                <input
                  type="number"
                  value={item.min_value ?? ''}
                  onChange={event =>
                    update({ min_value: event.target.value === '' ? undefined : Number(event.target.value) })
                  }
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="label">Maximo</label>
                <input
                  type="number"
                  value={item.max_value ?? ''}
                  onChange={event =>
                    update({ max_value: event.target.value === '' ? undefined : Number(event.target.value) })
                  }
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="label">Objetivo</label>
                <input
                  type="number"
                  value={item.target_value ?? ''}
                  onChange={event =>
                    update({ target_value: event.target.value === '' ? undefined : Number(event.target.value) })
                  }
                  className="input text-sm"
                />
              </div>
            </div>
          ) : null}

          {item.item_type === 'select' ? (
            <div className="rounded-lg border border-surface-400 bg-surface-200 p-3">
              <label className="label">Opciones (una por linea)</label>
              <textarea
                value={(item.options || []).join('\n')}
                onChange={event => update({ options: event.target.value.split('\n').filter(Boolean) })}
                rows={4}
                className="input resize-none text-sm"
                placeholder={'Opcion 1\nOpcion 2\nOpcion 3'}
              />
            </div>
          ) : null}

          {item.item_type === 'photo' ? (
            <div className="flex items-center gap-2 rounded-lg border border-surface-400 bg-surface-200 p-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.photo_required || false}
                  onChange={event => update({ photo_required: event.target.checked })}
                  className="h-4 w-4 rounded border-surface-400 bg-surface-200 text-accent-cyan"
                />
                <span className="text-sm text-slate-300">Foto obligatoria</span>
              </label>
            </div>
          ) : null}

          <div>
            <label className="label">Texto de ayuda</label>
            <input
              value={item.help_text || ''}
              onChange={event => update({ help_text: event.target.value })}
              className="input text-sm"
              placeholder="Texto de ayuda para el operador..."
            />
          </div>
        </div>
      ) : null}
    </div>
  )
})

export function ChecklistEditScreen({ checklistId }: { checklistId: string }) {
  const { user } = useAuthState()
  const access = getAppAccessSnapshot(user)
  const [selectedItems, setSelectedItems] = useState<ChecklistItem[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(true)
  const checklist = getDemoChecklistById(checklistId)
  const machine = checklist ? getDemoMachineById(checklist.machine_id) ?? null : null
  const checklistAccess = access.checklists
  const canEdit = checklistAccess.edit
  const saveAction = useAsyncAction({ label: 'Guardando checklist' })

  useEffect(() => {
    if (!checklistId) {
      setSelectedItems([])
      setIsLoadingItems(false)
      return
    }

    setIsLoadingItems(true)
    setSelectedItems(listDemoChecklistItems(checklistId).map(cloneChecklistItem))
    setIsLoadingItems(false)
  }, [checklistId])

  const handleUpdateItem = useCallback((itemId: string, partial: Partial<ChecklistItem>) => {
    setSelectedItems(current =>
      current.map(item => {
        if (item.id !== itemId) {
          return item
        }

        return {
          ...item,
          ...partial,
          updated_at: new Date().toISOString(),
        }
      })
    )
  }, [])

  const handleRemoveItem = useCallback((itemId: string) => {
    setSelectedItems(current =>
      current
        .filter(item => item.id !== itemId)
        .map((item, index) => ({ ...item, position: index + 1 }))
    )
  }, [])

  const handleAddItem = () => {
    setSelectedItems(current => {
      const newItem: ChecklistItem = {
        id: `item-new-${Date.now()}`,
        checklist_id: checklistId,
        position: current.length + 1,
        item_type: 'check',
        title: '',
        is_required: true,
        is_critical: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      return [...current, newItem]
    })
  }

  const handleSave = async () => {
    const result = await saveAction.run(async () => ({
      checklistId,
      items: selectedItems,
    }))

    if (!result) {
      toast.error('Error al guardar')
      return
    }

    toast.success('Checklist guardado correctamente')
  }

  if (!checklist) {
    return (
      <div className="p-8 text-center text-slate-400">
        <ClipboardList className="mx-auto mb-4 h-12 w-12 opacity-20" />
        <p>Checklist no encontrado</p>
      </div>
    )
  }

  const criticalCount = selectedItems.filter(item => item.is_critical).length
  const requiredCount = selectedItems.filter(item => item.is_required).length

  return (
    <div className="min-h-full space-y-5 bg-grid p-6">
      <div className="flex items-start gap-4 animate-in">
        <Link
          href={ROUTE_PATHS.checklists.list}
          className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-surface-400 bg-surface-200 transition-colors hover:border-accent-cyan/30"
        >
          <ArrowLeft className="h-4 w-4 text-slate-400" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold tracking-wide text-white">{checklist.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            {machine ? <span>{machine.name}</span> : null}
            <span>&middot;</span>
            <span>{selectedItems.length} items</span>
            <span>&middot;</span>
            <span>v{checklist.version}</span>
            {!canEdit ? (
              <span className="ml-2 flex items-center gap-1 text-xs text-amber-400">
                <AlertCircle className="h-3 w-3" />
                Solo lectura (sin permiso de edicion)
              </span>
            ) : null}
          </div>
        </div>
        {canEdit ? (
          <div className="flex flex-shrink-0 gap-2">
            <button type="button" onClick={handleAddItem} className="btn-secondary">
              <Plus className="h-4 w-4" />
              Agregar item
            </button>
            <AsyncButton
              onClick={handleSave}
              loading={saveAction.isLoading}
              loadingLabel="Guardando..."
              className="btn-primary"
            >
              <Save className="h-4 w-4" />
              Guardar
            </AsyncButton>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-4 gap-3 animate-in-delay-1">
        {[
          { label: 'Total items', value: selectedItems.length, color: 'text-white' },
          { label: 'Requeridos', value: requiredCount, color: 'text-cyan-400' },
          { label: 'Criticos', value: criticalCount, color: 'text-red-400' },
          { label: 'Tiempo est.', value: `${checklist.estimated_min}m`, color: 'text-emerald-400' },
        ].map(stat => (
          <div key={stat.label} className="card p-3 text-center">
            <p className={clsx('font-display text-xl font-bold', stat.color)}>{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 animate-in-delay-2">
        {isLoadingItems ? (
          <div className="py-12 text-center text-slate-500">
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-surface-400 border-t-accent-cyan" />
            <p className="text-sm">Cargando items...</p>
          </div>
        ) : null}

        {!isLoadingItems && selectedItems.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-surface-400 py-16 text-center text-slate-500">
            <ClipboardList className="mx-auto mb-3 h-10 w-10 opacity-20" />
            <p className="font-medium">No hay items en este checklist</p>
            {canEdit ? (
              <button type="button" onClick={handleAddItem} className="btn-primary mt-4">
                <Plus className="h-4 w-4" />
                Agregar primer item
              </button>
            ) : null}
          </div>
        ) : null}

        {!isLoadingItems
          ? selectedItems.map((item, index) => (
              <ItemEditor
                key={item.id}
                item={item}
                index={index}
                canEdit={canEdit}
                onUpdate={handleUpdateItem}
                onRemove={handleRemoveItem}
              />
            ))
          : null}
      </div>

      {canEdit && selectedItems.length > 0 ? (
        <div className="flex justify-between animate-in-delay-3">
          <button type="button" onClick={handleAddItem} className="btn-secondary">
            <Plus className="h-4 w-4" />
            Agregar item
          </button>
          <AsyncButton
            onClick={handleSave}
            loading={saveAction.isLoading}
            loadingLabel="Guardando..."
            className="btn-primary"
          >
            <Save className="h-4 w-4" />
            Guardar cambios
          </AsyncButton>
        </div>
      ) : null}
    </div>
  )
}
