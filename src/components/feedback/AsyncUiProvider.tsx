// Used by routes: global root layout and any client component that performs async UI work.
// Purpose: keep one lightweight registry of pending tasks for shared loading feedback.

'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { Nullable } from '@/types'
import { getCurrentNavigationHref, normalizeNavigationHref } from '@/features/navigation/href-state'

type AsyncTaskId = number
type NavigationTask = {
  taskId: AsyncTaskId
  href: string
  startedAt: number
  fromHref: string
}
type NavigationMeasurement = {
  href: string
  durationMs: number
}

interface AsyncUiContextValue {
  pendingCount: number
  isBusy: boolean
  latestLabel: Nullable<string>
  isNavigating: boolean
  pendingHref: Nullable<string>
  lastNavigation: Nullable<NavigationMeasurement>
  beginTask: (label?: string) => AsyncTaskId
  endTask: (taskId: AsyncTaskId) => void
  beginNavigation: (href: string, label?: string) => void
}

const AsyncUiContext = createContext<AsyncUiContextValue | null>(null)

export function AsyncUiProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const nextTaskId = useRef(0)
  const [pendingLabels, setPendingLabels] = useState<Record<number, string | undefined>>({})
  const [pendingNavigation, setPendingNavigation] = useState<NavigationTask | null>(null)
  const [lastNavigation, setLastNavigation] = useState<NavigationMeasurement | null>(null)
  const currentHref = useMemo(() => getCurrentNavigationHref(pathname, searchParams), [pathname, searchParams])

  const beginTask = useCallback((label?: string) => {
    const taskId = ++nextTaskId.current
    setPendingLabels(current => ({ ...current, [taskId]: label }))
    return taskId
  }, [])

  const endTask = useCallback((taskId: AsyncTaskId) => {
    setPendingLabels(current => {
      if (!(taskId in current)) return current

      const next = { ...current }
      delete next[taskId]
      return next
    })
  }, [])

  const completeNavigation = useCallback((task: NavigationTask, didTimeout = false) => {
    endTask(task.taskId)

    const durationMs = Math.round(performance.now() - task.startedAt)
    if (!didTimeout) {
      setLastNavigation({ href: task.href, durationMs })
    }
    setPendingNavigation(null)

    if (process.env.NODE_ENV === 'development') {
      const prefix = didTimeout ? '[nav-timeout]' : '[nav]'
      console.info(`${prefix} ${task.fromHref} -> ${task.href} en ${durationMs}ms`)
    }
  }, [endTask])

  const beginNavigation = useCallback((href: string, label?: string) => {
    const normalizedHref = normalizeNavigationHref(href)
    if (!normalizedHref || normalizedHref === currentHref) return

    setPendingNavigation(current => {
      if (current) completeNavigation(current, true)

      return {
        taskId: beginTask(label ?? `Navegando a ${normalizedHref}`),
        href: normalizedHref,
        startedAt: performance.now(),
        fromHref: currentHref,
      }
    })
  }, [beginTask, completeNavigation, currentHref])

  useEffect(() => {
    if (!pendingNavigation) return
    if (currentHref === pendingNavigation.fromHref) return

    completeNavigation(pendingNavigation)
  }, [completeNavigation, currentHref, pendingNavigation])

  useEffect(() => {
    if (!pendingNavigation) return

    const timeoutId = window.setTimeout(() => {
      completeNavigation(pendingNavigation, true)
    }, 15000)

    return () => window.clearTimeout(timeoutId)
  }, [completeNavigation, pendingNavigation])

  const pendingCount = Object.keys(pendingLabels).length
  const labels = Object.values(pendingLabels).filter((value): value is string => Boolean(value))

  const value = useMemo<AsyncUiContextValue>(() => ({
    pendingCount,
    isBusy: pendingCount > 0,
    latestLabel: labels.length > 0 ? labels[labels.length - 1] : null,
    isNavigating: pendingNavigation !== null,
    pendingHref: pendingNavigation?.href ?? null,
    lastNavigation,
    beginTask,
    endTask,
    beginNavigation,
  }), [beginNavigation, beginTask, endTask, labels, lastNavigation, pendingCount, pendingNavigation])

  return (
    <AsyncUiContext.Provider value={value}>
      {children}
    </AsyncUiContext.Provider>
  )
}

export function useAsyncUi() {
  const context = useContext(AsyncUiContext)

  if (!context) {
    throw new Error('useAsyncUi must be used within AsyncUiProvider')
  }

  return context
}
