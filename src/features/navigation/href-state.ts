// Used by routes: navigation feedback and tracked link primitives.
// Purpose: keep current-route comparison consistent across pathname and querystring aware surfaces.

type SearchParamsLike = {
  toString: () => string
}

export function normalizeNavigationHref(href: string) {
  return href.split('#')[0]
}

export function getCurrentNavigationHref(pathname: string, searchParams?: SearchParamsLike | null) {
  const query = searchParams?.toString()

  if (!query) {
    return pathname
  }

  return `${pathname}?${query}`
}
