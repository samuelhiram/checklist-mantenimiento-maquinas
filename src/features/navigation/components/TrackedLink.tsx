// Used by routes: navigation surfaces such as the sidebar, dev fast access, and view cycling.
// Purpose: register route transitions in the global async UI layer so slow navigations show feedback.

'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import clsx from 'clsx'
import type { MouseEvent, ReactNode } from 'react'
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner'
import { useAsyncUi } from '@/components/feedback/AsyncUiProvider'
import { getCurrentNavigationHref, normalizeNavigationHref } from '../href-state'

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0
}

export function TrackedLink({
  href,
  children,
  className,
  pendingClassName,
  trackingLabel,
  showPendingSpinner = false,
  pendingSpinnerClassName,
  onClick,
  trackNavigation = true,
  title,
}: {
  href: string
  children: ReactNode
  className?: string
  pendingClassName?: string
  trackingLabel?: string
  showPendingSpinner?: boolean
  pendingSpinnerClassName?: string
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
  trackNavigation?: boolean
  title?: string
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { beginNavigation, isNavigating, pendingHref } = useAsyncUi()
  const currentHref = getCurrentNavigationHref(pathname, searchParams)
  const normalizedHref = normalizeNavigationHref(href)
  const isPending = isNavigating && pendingHref === normalizedHref

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || isModifiedEvent(event)) return
    if (normalizedHref === currentHref) return
    if (!trackNavigation) return

    beginNavigation(normalizedHref, trackingLabel)
  }

  return (
    <Link
      href={href}
      title={title}
      onClick={handleClick}
      aria-busy={isPending}
      data-loading={isPending ? 'true' : 'false'}
      className={clsx(className, isPending && pendingClassName)}
    >
      {children}
      {isPending && showPendingSpinner ? (
        <LoadingSpinner className={clsx('h-3 w-3 flex-shrink-0', pendingSpinnerClassName)} />
      ) : null}
    </Link>
  )
}
