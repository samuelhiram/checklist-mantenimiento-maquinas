// Used by routes: feature screens with a top summary and primary actions.
// Purpose: keep titles, descriptions and actions aligned across pages.

import type { ElementType, ReactNode } from 'react'

export function ScreenHeader({
  title,
  description,
  icon: Icon,
  accentClassName = 'text-accent-cyan',
  actions,
  size = 'md',
}: {
  title: string
  description?: string
  icon?: ElementType
  accentClassName?: string
  actions?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}) {
  const titleClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }
  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <div className="flex items-start justify-between gap-4 animate-in">
      <div>
        <h1 className={`font-display ${titleClasses[size]} font-bold text-white tracking-wide flex items-center gap-2`}>
          {Icon ? <Icon className={`${iconClasses[size]} ${accentClassName}`} /> : null}
          {title}
        </h1>
        {description ? <p className="text-slate-400 text-xs mt-0.5">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
