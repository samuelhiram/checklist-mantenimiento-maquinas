// Used by routes: client components that run fetches, thunks, or side effects from buttons.
// Purpose: centralize local async status plus participation in the global pending registry.

'use client'

import { useCallback, useRef, useState } from 'react'
import { useAsyncUi } from '@/components/feedback/AsyncUiProvider'
import type { AsyncStatus, Nullable } from '@/types'

interface UseAsyncActionOptions {
  label?: string
  minimumPendingMs?: number
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function useAsyncAction(options: UseAsyncActionOptions = {}) {
  const { beginTask, endTask } = useAsyncUi()
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [error, setError] = useState<Nullable<string>>(null)
  const activeRunCountRef = useRef(0)
  const latestRunIdRef = useRef(0)
  const latestSettledRef = useRef<{
    runId: number
    status: Extract<AsyncStatus, 'success' | 'error'>
    error: Nullable<string>
  } | null>(null)

  const run = useCallback(async <T,>(task: () => Promise<T>) => {
    const minimumPendingMs = options.minimumPendingMs ?? 0
    const startedAt = Date.now()
    const runId = ++latestRunIdRef.current
    const taskId = beginTask(options.label)
    let nextStatus: Extract<AsyncStatus, 'success' | 'error'> = 'success'
    let nextError: Nullable<string> = null

    activeRunCountRef.current += 1

    setStatus('loading')
    setError(null)

    try {
      return await task()
    } catch (cause) {
      nextStatus = 'error'
      nextError = cause instanceof Error ? cause.message : 'Ocurrio un error inesperado'
      throw cause
    } finally {
      const remainingMs = minimumPendingMs - (Date.now() - startedAt)
      if (remainingMs > 0) await delay(remainingMs)

      if (!latestSettledRef.current || runId >= latestSettledRef.current.runId) {
        latestSettledRef.current = {
          runId,
          status: nextStatus,
          error: nextError,
        }
      }
      activeRunCountRef.current = Math.max(0, activeRunCountRef.current - 1)
      endTask(taskId)

      if (activeRunCountRef.current === 0 && latestSettledRef.current) {
        setStatus(latestSettledRef.current.status)
        setError(latestSettledRef.current.error)
      }
    }
  }, [beginTask, endTask, options.label, options.minimumPendingMs])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
  }, [])

  return {
    run,
    reset,
    error,
    status,
    isLoading: status === 'loading',
  }
}
