import { hasPermission } from '../../lib/auth/permission-profiles'
import { getIndexableAuthorizationFeatures } from '../../lib/auth/authorization-catalog'
import type { AppPermission } from '../../types'
import { INDEXABLE_ROUTE_PATHS } from './routes'
import type { AppViewIconKey } from './view-icons'

export type AppViewId = keyof typeof INDEXABLE_ROUTE_PATHS

export interface AppViewDefinition {
  id: AppViewId
  href: (typeof INDEXABLE_ROUTE_PATHS)[AppViewId]
  label: string
  description: string
  icon: AppViewIconKey
  requiredPermission: AppPermission
}

function defineAppView(input: Omit<AppViewDefinition, 'href'>): AppViewDefinition {
  return {
    ...input,
    href: INDEXABLE_ROUTE_PATHS[input.id],
  }
}

export const APP_VIEWS: AppViewDefinition[] = getIndexableAuthorizationFeatures().map(view =>
  defineAppView({
    id: view.routeId as AppViewId,
    label: view.label,
    description: view.description,
    icon: view.icon as AppViewIconKey,
    requiredPermission: view.requiredPermission as AppPermission,
  })
)

export function getVisibleAppViews(permissions?: readonly AppPermission[] | null) {
  if (!permissions?.length) {
    return []
  }

  return APP_VIEWS.filter(view => hasPermission(permissions, view.requiredPermission))
}

export function getViewByHref(href: string) {
  return APP_VIEWS.find(view => view.href === href) ?? null
}

export function getAdjacentViews(currentHref: string, permissions?: readonly AppPermission[] | null) {
  const visibleViews = getVisibleAppViews(permissions)
  const currentIndex = visibleViews.findIndex(view => view.href === currentHref)

  if (currentIndex === -1 || visibleViews.length < 2) {
    return {
      previous: null,
      next: null,
    }
  }

  const previousIndex = (currentIndex - 1 + visibleViews.length) % visibleViews.length
  const nextIndex = (currentIndex + 1) % visibleViews.length

  return {
    previous: visibleViews[previousIndex],
    next: visibleViews[nextIndex],
  }
}
