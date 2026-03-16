// Used by routes: sidebar, dev fast access, and other navigation surfaces.
// Purpose: keep active-route matching in one place so path rules do not drift.

import { ROUTE_PATHS } from './routes'

export function isActiveNavigationPath(pathname: string, href: string) {
  if (href === ROUTE_PATHS.auth.login) {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
