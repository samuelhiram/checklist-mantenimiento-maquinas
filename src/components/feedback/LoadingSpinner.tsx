// Used by routes: any client button, inline loader, or route fallback that needs a compact spinner.
// Purpose: provide one consistent loading glyph across the app.

import clsx from 'clsx'

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx('inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent', className)}
    />
  )
}
