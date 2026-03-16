// Used by routes: list-heavy views with filters, search and secondary actions.
// Purpose: normalize toolbar layout while keeping filter controls domain-specific.

import clsx from 'clsx'
import type { ReactNode } from 'react'

export function ScreenToolbar({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={clsx('flex flex-col sm:flex-row gap-3 animate-in-delay-1', className)}>{children}</div>
}
