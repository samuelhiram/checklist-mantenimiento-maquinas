// Used by routes: scaffolded front views that must exist before their full workflow is implemented.
// Purpose: provide a consistent non-404 screen while keeping the navigation contract valid.

import Link from 'next/link'
import type { ElementType, ReactNode } from 'react'
import { ArrowLeft, Construction } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { ScreenHeader } from './ScreenHeader'
import { ScreenPage } from './ScreenPage'

export function RoutePlaceholder({
  title,
  description,
  backHref,
  backLabel,
  note,
  icon,
  action,
}: {
  title: string
  description: string
  backHref: string
  backLabel: string
  note: string
  icon: ElementType
  action?: ReactNode
}) {
  return (
    <ScreenPage>
      <ScreenHeader
        title={title}
        description={description}
        icon={icon}
        actions={
          <Link href={backHref} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        }
      />

      <div className="card border-dashed border-surface-500">
        <EmptyState
          icon={Construction}
          title="Flujo en preparacion"
          description={note}
          action={action}
        />
      </div>
    </ScreenPage>
  )
}
