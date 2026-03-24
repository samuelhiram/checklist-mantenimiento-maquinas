// Used by routes: client components that run fetches, thunks, or side effects from buttons.
// Purpose: centralize local async status plus participation in the global pending registry.

'use client'

import { useCallback, useRef, useState } from 'react'
import { useAsyncUi } from '@/components/feedback/AsyncUiProvider'
import type { AsyncStatus, Nullable } from '@/types'

interface UseAsyncActionOptions {
  label?: string
  minimumPendingMs?: number
  singleton?: boolean
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function useAsyncAction(options: UseAsyncActionOptions = {}) {
  const { beginTask, endTask } = useAsyncUi()
  const { singleton = true } = options
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [error, setError] = useState<Nullable<string>>(null)
  const activeRunCountRef = useRef(0)
  const latestRunIdRef = useRef(0)
  const abortControllerRef = useRef<Nullable<AbortController>>(null)
  
  const latestSettledRef = useRef<{
    runId: number
    status: Extract<AsyncStatus, 'success' | 'error'>
    error: Nullable<string>
  } | null>(null)

  const run = useCallback(async <T,>(task: (signal: AbortSignal) => Promise<T>) => {
    if (singleton && abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

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
      const result = await task(controller.signal)
      return result
    } catch (cause) {
      if (cause instanceof Error && cause.name === 'AbortError') {
        // Task was cancelled, we don't treat this as application error
        return undefined as unknown as T
      }
      
      nextStatus = 'error'
      nextError = cause instanceof Error ? cause.message : 'Ocurrio un error inesperado'
      throw cause
    } finally {
      const remainingMs = minimumPendingMs - (Date.now() - startedAt)
      if (remainingMs > 0) await delay(remainingMs)

      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
      }

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
  }, [beginTask, endTask, options.label, options.minimumPendingMs, singleton])

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
