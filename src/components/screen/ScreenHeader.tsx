// Used by routes: feature screens with a top summary and primary actions.
// Purpose: keep titles, descriptions and actions aligned across pages.

import type { ElementType, ReactNode } from 'react'

export function ScreenHeader({
  title,
  description,
  icon: Icon,
  accentClassName = 'text-accent-cyan',
  actions,
}: {
  title: string
  description?: string
  icon?: ElementType
  accentClassName?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 animate-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          {Icon ? <Icon className={`w-6 h-6 ${accentClassName}`} /> : null}
          {title}
        </h1>
        {description ? <p className="text-slate-400 text-sm mt-1">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
