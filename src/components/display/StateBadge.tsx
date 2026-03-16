// Used by routes: /machines, /checklists, /executions, /findings
// Purpose: render status-like values from a typed config without duplicating badge markup.

import clsx from 'clsx'

export type StateBadgeMap<T extends string> = Record<
  T,
  {
    label: string
    className: string
    dotClassName?: string
  }
>

export function StateBadge<T extends string>({
  value,
  config,
  className,
}: {
  value: T
  config: StateBadgeMap<T>
  className?: string
}) {
  const state = config[value]

  return (
    <span className={clsx(state.className, className)}>
      {state.dotClassName ? <span className={clsx('w-1.5 h-1.5 rounded-full', state.dotClassName)} /> : null}
      {state.label}
    </span>
  )
}
