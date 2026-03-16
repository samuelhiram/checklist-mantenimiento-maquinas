// Used by routes: feature list and detail screens inside the authenticated shell.
// Purpose: provide a consistent page frame with shared spacing and background.

import clsx from 'clsx'
import type { ReactNode } from 'react'

export function ScreenPage({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={clsx('p-6 space-y-5 bg-grid min-h-full', className)}>{children}</div>
}
