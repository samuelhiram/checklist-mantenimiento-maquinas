// Used by routes: list and detail screens that need a consistent empty fallback.
// Purpose: remove duplicated empty-state markup while preserving per-view copy.

import type { ElementType, ReactNode } from 'react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ElementType
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="text-center py-16 text-slate-500">
      <Icon className="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p className="text-lg font-medium">{title}</p>
      {description ? <p className="text-sm mt-1">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}
