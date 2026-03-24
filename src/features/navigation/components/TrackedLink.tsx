// Used by routes: navigation surfaces such as the sidebar, dev fast access, and view cycling.
// Purpose: register route transitions in the global async UI layer so slow navigations show feedback.

'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import clsx from 'clsx'
import type { MouseEvent, ReactNode } from 'react'
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
  onClick,
  trackNavigation = true,
  title,
}: {
  href: string
  children: ReactNode
  className?: string
  pendingClassName?: string
  trackingLabel?: string
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
      className={clsx(className, isPending && 'opacity-50 pointer-events-none select-none', isPending && pendingClassName)}
    >
      {children}
    </Link>
  )
}
