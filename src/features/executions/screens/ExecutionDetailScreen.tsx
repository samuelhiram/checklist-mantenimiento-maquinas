// Route: /executions/[id]
// Access: operator | supervisor | admin
// Purpose: render the guided execution runner from the executions feature instead of the route entrypoint.

'use client'

import { memo, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  CheckSquare,
  ClipboardList,
  Clock,
  Cpu,
  Flag,
  Hash,
  List,
  MessageSquare,
  Minus,
  PlayCircle,
  Ruler,
  Save,
  Type,
  XCircle,
} from 'lucide-react'
import { AsyncButton } from '@/components/feedback/AsyncButton'
import { useAuthState } from '@/components/ui/AuthProvider'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { useAsyncAction } from '@/hooks/useAsyncAction'
import {
  getDemoChecklistById,
  getDemoExecutionById,
  getDemoMachineById,
  listDemoChecklistItems,
} from '@/lib/demo/queries'
import type { ChecklistItem, ExecutionResult, ItemType } from '@/types'

function buildExecutionResult(
  executionId: string,
  itemId: string,
  partial: Partial<ExecutionResult>,
  recordedBy?: string
): ExecutionResult {
  return {
    id: partial.id ?? `res-${itemId}`,
    execution_id: executionId,
    item_id: itemId,
    is_na: partial.is_na ?? false,
    flagged: partial.flagged ?? false,
    recorded_at: partial.recorded_at ?? new Date().toISOString(),
    recorded_by: partial.recorded_by ?? recordedBy,
    is_checked: partial.is_checked,
    value_text: partial.value_text,
    value_number: partial.value_number,
    value_select: partial.value_select,
    photo_url: partial.photo_url,
    is_ok: partial.is_ok,
    comment: partial.comment,
    item: partial.item,
  }
}

function MeasureInput({
  item,
  result,
  onChange,
}: {
  item: ChecklistItem
  result?: ExecutionResult
  onChange: (value: number) => void
}) {
  const value = result?.value_number
  const inRange =
    value !== undefined && item.min_value !== undefined && item.max_value !== undefined
      ? value >= item.min_value && value <= item.max_value
      : null

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="relative">
          <input
            type="number"
            step="0.1"
            value={value ?? ''}
            onChange={event => {
              if (event.target.value !== '') {
                onChange(Number(event.target.value))
              }
            }}
            className={clsx(
              'input pr-16',
              inRange === false ? 'border-red-500/50 focus:border-red-500' : null,
              inRange === true ? 'border-emerald-500/50 focus:border-emerald-500' : null
            )}
            placeholder="0.0"
          />
          {item.unit ? (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400">{item.unit}</span>
          ) : null}
        </div>

        {item.min_value !== undefined || item.max_value !== undefined ? (
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            {item.min_value !== undefined ? (
              <span>
                Min: <span className="font-mono text-slate-400">{item.min_value}</span>
              </span>
            ) : null}
            {item.target_value !== undefined ? (
              <span>
                &middot; Obj: <span className="font-mono text-cyan-400">{item.target_value}</span>
              </span>
            ) : null}
            {item.max_value !== undefined ? (
              <span>
                &middot; Max: <span className="font-mono text-slate-400">{item.max_value}</span>
              </span>
            ) : null}
            {value !== undefined && inRange !== null ? (
              <span className={inRange ? 'font-semibold text-emerald-400' : 'font-semibold text-red-400'}>
                {inRange ? 'En rango' : 'Fuera de rango'}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {value !== undefined && inRange !== null ? (
        <div className={clsx('flex h-8 w-8 items-center justify-center rounded-lg', inRange ? 'bg-emerald-500/15' : 'bg-red-500/15')}>
          {inRange ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <XCircle className="h-4 w-4 text-red-400" />
          )}
        </div>
      ) : null}
    </div>
  )
}

const ChecklistItemRunner = memo(function ChecklistItemRunner({
  item,
  result,
  onResult,
}: {
  item: ChecklistItem
  result?: ExecutionResult
  onResult: (itemId: string, result: Partial<ExecutionResult>) => void
}) {
  const [showComment, setShowComment] = useState(false)
  const isOk = result?.is_ok
  const isNa = result?.is_na

  const typeIcons: Record<ItemType, React.ElementType> = {
    check: CheckSquare,
    measure: Ruler,
    photo: Camera,
    text: Type,
    number: Hash,
    select: List,
  }

  const TypeIcon = typeIcons[item.item_type] || CheckSquare

  const markOk = () => onResult(item.id, { is_ok: true, is_checked: true, is_na: false })
  const markFail = () => onResult(item.id, { is_ok: false, is_checked: false, is_na: false })
  const markNa = () => onResult(item.id, { is_na: true, is_ok: undefined, is_checked: undefined })

  return (
    <div
      className={clsx(
        'card p-4 transition-all',
        isOk === true && !isNa ? 'border-emerald-500/30 bg-emerald-500/5' : null,
        isOk === false && !isNa ? 'border-red-500/30 bg-red-500/5' : null,
        isNa ? 'opacity-60' : null,
        item.is_critical && isOk === false ? 'border-red-500/60 ring-1 ring-red-500/20' : null
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 pt-0.5">
          <div
            className={clsx(
              'flex h-6 w-6 items-center justify-center rounded',
              isOk === true ? 'bg-emerald-500/20' : isOk === false ? 'bg-red-500/20' : 'bg-surface-300'
            )}
          >
            <TypeIcon
              className={clsx(
                'h-3.5 w-3.5',
                isOk === true ? 'text-emerald-400' : isOk === false ? 'text-red-400' : 'text-slate-500'
              )}
            />
          </div>
          {item.is_critical ? <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" title="Critico" /> : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <p className={clsx('text-sm font-medium', isNa ? 'text-slate-600' : 'text-slate-200')}>
              {item.title}
              {item.is_required && !isNa ? <span className="ml-0.5 text-red-400">*</span> : null}
            </p>
            {item.is_critical ? <span className="badge-critical text-xs">Critico</span> : null}
          </div>

          {item.description ? <p className="mb-3 text-xs leading-relaxed text-slate-500">{item.description}</p> : null}

          {!isNa ? (
            <div className="mb-3">
              {item.item_type === 'check' ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={markOk}
                    className={clsx(
                      'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                      isOk === true
                        ? 'bg-emerald-500 text-white'
                        : 'bg-surface-300 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400'
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    OK / Conforme
                  </button>
                  <button
                    type="button"
                    onClick={markFail}
                    className={clsx(
                      'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                      isOk === false
                        ? 'bg-red-500 text-white'
                        : 'bg-surface-300 text-slate-400 hover:bg-red-500/20 hover:text-red-400'
                    )}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    No conforme
                  </button>
                </div>
              ) : null}

              {item.item_type === 'measure' ? (
                <MeasureInput
                  item={item}
                  result={result}
                  onChange={value => {
                    const inRange =
                      item.min_value !== undefined && item.max_value !== undefined
                        ? value >= item.min_value && value <= item.max_value
                        : true
                    onResult(item.id, { value_number: value, is_ok: inRange, is_na: false })
                  }}
                />
              ) : null}

              {item.item_type === 'text' ? (
                <textarea
                  value={result?.value_text || ''}
                  onChange={event =>
                    onResult(item.id, { value_text: event.target.value, is_ok: Boolean(event.target.value), is_na: false })
                  }
                  rows={2}
                  className="input w-full resize-none text-sm"
                  placeholder="Ingrese observaciones..."
                />
              ) : null}

              {item.item_type === 'number' ? (
                <input
                  type="number"
                  value={result?.value_number ?? ''}
                  onChange={event => {
                    if (event.target.value !== '') {
                      onResult(item.id, { value_number: Number(event.target.value), is_ok: true, is_na: false })
                    }
                  }}
                  className="input w-40 text-sm"
                  placeholder="0"
                />
              ) : null}

              {item.item_type === 'select' && item.options ? (
                <div className="flex flex-wrap gap-2">
                  {item.options.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => onResult(item.id, { value_select: option, is_ok: true, is_na: false })}
                      className={clsx(
                        'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                        result?.value_select === option
                          ? 'border-accent-cyan/30 bg-accent-cyan/20 text-accent-cyan'
                          : 'border-surface-400 bg-surface-300 text-slate-400 hover:border-accent-cyan/30'
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}

              {item.item_type === 'photo' ? (
                <div className="flex items-center gap-3">
                  <button type="button" className="btn-secondary text-xs">
                    <Camera className="h-3.5 w-3.5" />
                    Tomar foto
                  </button>
                  <span className="text-xs text-slate-500">{item.photo_required ? 'Requerida' : 'Opcional'}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            {!isNa ? (
              <button
                type="button"
                onClick={() => setShowComment(current => !current)}
                className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-300"
              >
                <MessageSquare className="h-3 w-3" />
                {result?.comment ? 'Nota' : 'Agregar nota'}
              </button>
            ) : null}

            {!isNa && isOk === false ? (
              <button
                type="button"
                onClick={() => onResult(item.id, { ...result, flagged: !result?.flagged })}
                className={clsx(
                  'flex items-center gap-1 text-xs transition-colors',
                  result?.flagged ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'
                )}
              >
                <Flag className="h-3 w-3" />
                {result?.flagged ? 'Marcado' : 'Marcar hallazgo'}
              </button>
            ) : null}

            {!item.is_required ? (
              <button
                type="button"
                onClick={isNa ? () => onResult(item.id, { is_na: false }) : markNa}
                className="ml-auto flex items-center gap-1 text-xs text-slate-600 transition-colors hover:text-slate-400"
              >
                <Minus className="h-3 w-3" />
                {isNa ? 'Marcar aplica' : 'No aplica'}
              </button>
            ) : null}
          </div>

          {showComment ? (
            <input
              value={result?.comment || ''}
              onChange={event => onResult(item.id, { ...result, comment: event.target.value })}
              className="input mt-2 w-full text-sm"
              placeholder="Comentario u observacion..."
            />
          ) : null}
        </div>

        <div className="mt-1 flex-shrink-0">
          {isNa ? <span className="rounded bg-surface-300 px-2 py-1 text-xs text-slate-600">N/A</span> : null}
          {!isNa && isOk === true ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : null}
          {!isNa && isOk === false ? <XCircle className="h-5 w-5 text-red-400" /> : null}
          {!isNa && isOk === undefined ? <div className="h-5 w-5 rounded-full border-2 border-slate-600" /> : null}
        </div>
      </div>
    </div>
  )
})

export function ExecutionDetailScreen({ executionId }: { executionId: string }) {
  const router = useRouter()
  const { user } = useAuthState()
  const [results, setResults] = useState<Record<string, ExecutionResult>>({})
  const [items, setItems] = useState<ChecklistItem[]>([])

  const execution = getDemoExecutionById(executionId)
  const checklist = execution ? getDemoChecklistById(execution.checklist_id) ?? null : null
  const machine = execution ? getDemoMachineById(execution.machine_id) ?? null : null

  const [notes, setNotes] = useState('')
  const [started, setStarted] = useState(execution?.status === 'in_progress')
  const startAction = useAsyncAction({ label: 'Iniciando ejecucion' })
  const completeAction = useAsyncAction({ label: 'Completando ejecucion' })

  useEffect(() => {
    if (checklist) {
      setItems(listDemoChecklistItems(checklist.id).map(item => ({
        ...item,
        options: item.options ? [...item.options] : undefined,
      })))
      setResults({})
    }
  }, [checklist])

  const handleResultChange = useCallback((itemId: string, partial: Partial<ExecutionResult>) => {
    setResults(current => {
      const nextResult = buildExecutionResult(executionId, itemId, {
        ...current[itemId],
        ...partial,
      }, user?.id)

      return {
        ...current,
        [itemId]: nextResult,
      }
    })
  }, [executionId, user?.id])

  if (!execution || !checklist || !machine) {
    return (
      <div className="p-8 text-center text-slate-400">
        <ClipboardList className="mx-auto mb-4 h-12 w-12 opacity-20" />
        <p>Ejecucion no encontrada</p>
        <Link href={ROUTE_PATHS.executions.list} className="btn-secondary mt-4 inline-flex">
          Volver
        </Link>
      </div>
    )
  }

  const totalItems = items.length
  const answeredItems = items.filter(item => results[item.id] !== undefined).length
  const okItems = items.filter(item => results[item.id]?.is_ok === true || results[item.id]?.is_na === true).length
  const failedItems = items.filter(item => results[item.id]?.is_ok === false && !results[item.id]?.is_na).length
  const criticalFails = items.filter(item => item.is_critical && results[item.id]?.is_ok === false && !results[item.id]?.is_na).length
  const progress = totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0
  const requiredItems = items.filter(item => item.is_required).length
  const canComplete = answeredItems >= requiredItems

  const handleStart = async () => {
    await Promise.resolve()
    setStarted(true)
    toast.success('Ejecucion iniciada')
  }

  const handleComplete = async () => {
    if (!canComplete) {
      toast.error('Completa todos los items requeridos')
      return
    }

    const resultMap: Record<string, ExecutionResult> = {}
    for (const item of items) {
      if (results[item.id]) {
        resultMap[item.id] = buildExecutionResult(execution.id, item.id, results[item.id])
      }
    }

    const result = await completeAction.run(async () => {
      const values = Object.values(resultMap)
      const okCount = values.filter(item => item.is_ok === true || item.is_checked === true).length
      const score = values.length > 0 ? Math.round((okCount / values.length) * 100) : 0
      const status = values.filter(item => item.is_ok === false && !item.is_na).length === 0 ? 'completed' : 'failed'
      return { status, score, notes }
    })

    if (result) {
      toast[result.status === 'completed' ? 'success' : 'error'](
        result.status === 'completed'
          ? `Completado con ${result.score}% de conformidad`
          : `Fallido: ${criticalFails} item(s) critico(s)`
      )
      router.push(ROUTE_PATHS.executions.list)
    }
  }

  return (
    <div className="mx-auto min-h-full max-w-4xl space-y-5 bg-grid p-6">
      <div className="flex items-start gap-4 animate-in">
        <Link
          href={ROUTE_PATHS.executions.list}
          className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-surface-400 bg-surface-200 transition-colors hover:border-accent-cyan/30"
        >
          <ArrowLeft className="h-4 w-4 text-slate-400" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold tracking-wide text-white">{checklist.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5" />
              {machine.name}
            </span>
            <span>&middot;</span>
            <span className="flex items-center gap-1">
              <ClipboardList className="h-3.5 w-3.5" />
              {totalItems} items
            </span>
            <span>&middot;</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {checklist.estimated_min} min
            </span>
          </div>
        </div>
        {criticalFails > 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/15 px-3 py-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400">{criticalFails} critico(s) fallido(s)</span>
          </div>
        ) : null}
      </div>

      <div className="card animate-in-delay-1 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Progreso de ejecucion</span>
          <span className="font-display font-bold text-accent-cyan">{progress}%</span>
        </div>
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-surface-300">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-emerald transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: totalItems, color: 'text-slate-300' },
            { label: 'Respondidos', value: answeredItems, color: 'text-cyan-400' },
            { label: 'Conformes', value: okItems, color: 'text-emerald-400' },
            { label: 'No conformes', value: failedItems, color: 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className={clsx('font-display text-xl font-bold', stat.color)}>{stat.value}</p>
              <p className="text-xs text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {!started && execution.status !== 'in_progress' ? (
        <div className="card animate-in-delay-1 p-6 text-center">
          <PlayCircle className="mx-auto mb-3 h-10 w-10 text-accent-cyan opacity-70" />
          <p className="mb-1 font-medium text-slate-200">Lista para ejecutar</p>
          <p className="mb-4 text-sm text-slate-500">Presiona iniciar para comenzar el registro de esta verificacion</p>
          <AsyncButton
            onClick={() => startAction.run(handleStart)}
            loading={startAction.isLoading}
            loadingLabel="Iniciando..."
            className="btn-primary"
          >
            <CheckSquare className="h-4 w-4" />
            Iniciar ejecucion
          </AsyncButton>
        </div>
      ) : null}

      {started || execution.status === 'in_progress' ? (
        <div className="space-y-3 animate-in-delay-2">
          {items.map((item, index) => (
            <div key={item.id}>
              {index > 0 && index % 3 === 0 ? <div className="my-4 h-px bg-surface-300" /> : null}
              <ChecklistItemRunner
                item={item}
                result={results[item.id]}
                onResult={handleResultChange}
              />
            </div>
          ))}
        </div>
      ) : null}

      {started || execution.status === 'in_progress' ? (
        <div className="card animate-in-delay-3 space-y-4 p-5">
          <div>
            <label className="label">Notas y observaciones finales</label>
            <textarea
              value={notes}
              onChange={event => setNotes(event.target.value)}
              rows={3}
              className="input w-full resize-none"
              placeholder="Condiciones especiales, observaciones del turno, acciones inmediatas tomadas..."
            />
          </div>
          <div className="flex items-center justify-between border-t border-surface-300 pt-2">
            <div className="text-sm text-slate-500">
              {!canComplete ? (
                <span className="flex items-center gap-1.5 text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  Faltan {requiredItems - answeredItems} items requeridos
                </span>
              ) : null}
              {canComplete && criticalFails === 0 ? (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Listo para completar
                </span>
              ) : null}
              {canComplete && criticalFails > 0 ? (
                <span className="flex items-center gap-1.5 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  {criticalFails} item(s) critico(s) con fallo; se registrara como FALLIDO
                </span>
              ) : null}
            </div>
            <AsyncButton
              onClick={handleComplete}
              loading={completeAction.isLoading}
              loadingLabel="Guardando..."
              disabled={!canComplete}
              className={clsx('btn-primary', !canComplete ? 'cursor-not-allowed opacity-50' : null)}
            >
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Completar ejecucion
              </span>
            </AsyncButton>
          </div>
        </div>
      ) : null}
    </div>
  )
}
