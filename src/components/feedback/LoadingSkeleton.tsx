// Used by routes: loading.tsx files and any async surface that needs structural placeholders.
// Purpose: provide reusable skeleton primitives that mirror the app's screen patterns.

import clsx from 'clsx'
import type { ReactNode } from 'react'

function repeat(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index)
}

export function SkeletonBlock({
  className,
}: {
  className?: string
}) {
  return <div aria-hidden className={clsx('skeleton-block', className)} />
}

export function SkeletonCircle({
  className,
}: {
  className?: string
}) {
  return <SkeletonBlock className={clsx('rounded-full', className)} />
}

export function SkeletonPill({
  className,
}: {
  className?: string
}) {
  return <SkeletonBlock className={clsx('h-7 rounded-full', className)} />
}

export function SkeletonText({
  lines = 3,
  className,
  lineClassName,
  lastLineClassName = 'w-8/12',
}: {
  lines?: number
  className?: string
  lineClassName?: string
  lastLineClassName?: string
}) {
  const widths = ['w-full', 'w-11/12', 'w-10/12', 'w-9/12', 'w-8/12']

  return (
    <div className={clsx('space-y-2', className)}>
      {repeat(lines).map(lineIndex => (
        <SkeletonBlock
          key={lineIndex}
          className={clsx(
            'h-3 rounded-md',
            lineIndex === lines - 1 ? lastLineClassName : widths[lineIndex % widths.length],
            lineClassName
          )}
        />
      ))}
    </div>
  )
}

export function SkeletonPanel({
  children,
  className,
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <div className={clsx('skeleton-panel', padded && 'p-5', className)}>
      {children}
    </div>
  )
}

export function ScreenHeaderSkeleton({
  actionCount = 2,
  showIcon = true,
  className,
}: {
  actionCount?: number
  showIcon?: boolean
  className?: string
}) {
  return (
    <div className={clsx('flex items-start justify-between gap-4 animate-in', className)}>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-center gap-3">
          {showIcon ? <SkeletonBlock className="h-7 w-7 rounded-lg" /> : null}
          <SkeletonBlock className="h-8 w-52 max-w-full rounded-lg sm:w-72" />
        </div>
        <SkeletonBlock className="h-4 w-full max-w-xl rounded-md sm:w-96" />
      </div>
      {actionCount > 0 ? (
        <div className="hidden flex-shrink-0 items-center gap-2 lg:flex">
          {repeat(actionCount).map(actionIndex => (
            <SkeletonBlock
              key={actionIndex}
              className={clsx('h-10 rounded-lg', actionIndex === 0 ? 'w-28' : 'w-36')}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function DetailHeaderSkeleton({
  actionCount = 1,
  className,
}: {
  actionCount?: number
  className?: string
}) {
  return (
    <div className={clsx('flex items-start gap-4 animate-in', className)}>
      <SkeletonBlock className="mt-1 h-8 w-8 flex-shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <SkeletonBlock className="h-8 w-56 rounded-lg sm:w-72" />
          <SkeletonPill className="w-24" />
          <SkeletonPill className="w-16" />
        </div>
        <div className="flex flex-wrap gap-3">
          <SkeletonBlock className="h-3 w-24 rounded-md" />
          <SkeletonBlock className="h-3 w-28 rounded-md" />
          <SkeletonBlock className="h-3 w-32 rounded-md" />
        </div>
      </div>
      {actionCount > 0 ? (
        <div className="hidden flex-shrink-0 items-center gap-2 lg:flex">
          {repeat(actionCount).map(actionIndex => (
            <SkeletonBlock
              key={actionIndex}
              className={clsx('h-10 rounded-lg', actionIndex === 0 ? 'w-28' : 'w-32')}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function ScreenStatsGridSkeleton({
  cards = 4,
  columnsClassName = 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
  className,
}: {
  cards?: number
  columnsClassName?: string
  className?: string
}) {
  return (
    <div className={clsx('grid gap-3 animate-in-delay-1', columnsClassName, className)}>
      {repeat(cards).map(cardIndex => (
        <SkeletonPanel key={cardIndex} className="space-y-3 border-surface-300/80 bg-surface-100/70">
          <div className="flex items-start justify-between gap-3">
            <SkeletonCircle className="h-10 w-10" />
            <SkeletonBlock className="h-3 w-14 rounded-full" />
          </div>
          <SkeletonBlock className="h-8 w-20 rounded-lg" />
          <SkeletonBlock className="h-3 w-24 rounded-md" />
          <SkeletonBlock className="h-3 w-28 rounded-md" />
        </SkeletonPanel>
      ))}
    </div>
  )
}

export function ScreenToolbarSkeleton({
  filterCount = 3,
  className,
}: {
  filterCount?: number
  className?: string
}) {
  return (
    <div className={clsx('flex flex-col gap-3 animate-in-delay-1 sm:flex-row', className)}>
      <SkeletonBlock className="h-11 flex-1 rounded-xl" />
      <div className="flex flex-wrap gap-2">
        {repeat(filterCount).map(filterIndex => (
          <SkeletonBlock
            key={filterIndex}
            className={clsx('h-11 rounded-xl', filterIndex === 0 ? 'w-36' : filterIndex === 1 ? 'w-32' : 'w-28')}
          />
        ))}
      </div>
    </div>
  )
}

export function ScreenCardGridSkeleton({
  cards = 6,
  columnsClassName = 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  className,
}: {
  cards?: number
  columnsClassName?: string
  className?: string
}) {
  return (
    <div className={clsx('grid gap-4', columnsClassName, className)}>
      {repeat(cards).map(cardIndex => (
        <SkeletonPanel key={cardIndex} className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <SkeletonCircle className="h-11 w-11 flex-shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-28 rounded-md sm:w-36" />
                <SkeletonBlock className="h-3 w-20 rounded-full" />
              </div>
            </div>
            <SkeletonPill className="w-16" />
          </div>
          <SkeletonText lines={3} />
          <div className="flex flex-wrap gap-2">
            <SkeletonPill className="w-14" />
            <SkeletonPill className="w-20" />
            <SkeletonPill className="w-16" />
          </div>
          <div className="flex justify-between gap-3 border-t border-surface-300/70 pt-3">
            <SkeletonBlock className="h-9 w-20 rounded-lg" />
            <SkeletonBlock className="h-9 w-28 rounded-lg" />
          </div>
        </SkeletonPanel>
      ))}
    </div>
  )
}

export function ScreenListPanelSkeleton({
  rows = 5,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <SkeletonPanel className={clsx('overflow-hidden p-0', className)} padded={false}>
      <div className="flex items-center justify-between border-b border-surface-300/70 p-5">
        <div className="flex items-center gap-3">
          <SkeletonCircle className="h-7 w-7" />
          <SkeletonBlock className="h-5 w-36 rounded-md" />
        </div>
        <SkeletonBlock className="h-4 w-20 rounded-md" />
      </div>
      <div className="divide-y divide-surface-300/70">
        {repeat(rows).map(rowIndex => (
          <div key={rowIndex} className="flex items-center gap-4 px-5 py-4">
            <SkeletonCircle className="h-9 w-9 flex-shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-44 max-w-full rounded-md sm:w-56" />
              <div className="flex flex-wrap gap-2">
                <SkeletonBlock className="h-3 w-16 rounded-md" />
                <SkeletonBlock className="h-3 w-20 rounded-md" />
                <SkeletonBlock className="h-3 w-24 rounded-md" />
              </div>
            </div>
            <div className="hidden flex-shrink-0 items-center gap-2 sm:flex">
              <SkeletonPill className="w-16" />
              <SkeletonBlock className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonPanel>
  )
}

export function ScreenSplitPanelsSkeleton({
  className,
}: {
  className?: string
}) {
  return (
    <div className={clsx('grid gap-4 lg:grid-cols-3', className)}>
      <SkeletonPanel className="space-y-4 lg:col-span-2">
        <SkeletonBlock className="h-5 w-40 rounded-md" />
        <SkeletonText lines={4} lastLineClassName="w-9/12" />
        <div className="flex flex-wrap gap-2">
          <SkeletonPill className="w-24" />
          <SkeletonPill className="w-20" />
          <SkeletonPill className="w-28" />
        </div>
      </SkeletonPanel>
      <SkeletonPanel className="space-y-4">
        <SkeletonBlock className="h-5 w-28 rounded-md" />
        <div className="space-y-3">
          {repeat(4).map(rowIndex => (
            <div key={rowIndex} className="flex items-center justify-between gap-3">
              <SkeletonBlock className="h-3 w-20 rounded-md" />
              <SkeletonBlock className="h-3 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </SkeletonPanel>
    </div>
  )
}

export function ScreenEditorStackSkeleton({
  items = 4,
  className,
}: {
  items?: number
  className?: string
}) {
  return (
    <div className={clsx('space-y-3 animate-in-delay-2', className)}>
      {repeat(items).map(itemIndex => (
        <SkeletonPanel key={itemIndex} className="overflow-hidden p-0" padded={false}>
          <div className="flex items-center gap-3 p-4">
            <SkeletonBlock className="h-4 w-4 flex-shrink-0 rounded" />
            <SkeletonBlock className="h-4 w-5 flex-shrink-0 rounded" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-48 max-w-full rounded-md sm:w-64" />
              <SkeletonBlock className="h-3 w-24 rounded-md" />
            </div>
            <div className="hidden flex-shrink-0 items-center gap-2 sm:flex">
              <SkeletonPill className="w-16" />
              <SkeletonBlock className="h-6 w-6 rounded" />
            </div>
          </div>
          <div className="space-y-3 border-t border-surface-300/70 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <SkeletonBlock className="h-11 w-full rounded-xl" />
              <SkeletonBlock className="h-11 w-full rounded-xl" />
            </div>
            <SkeletonBlock className="h-24 w-full rounded-xl" />
          </div>
        </SkeletonPanel>
      ))}
    </div>
  )
}
