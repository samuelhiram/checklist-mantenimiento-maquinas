import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'
import { resolvePermissionProfileFromRole } from '../src/lib/auth/permission-profiles'
import { getCurrentNavigationHref, normalizeNavigationHref } from '../src/features/navigation/href-state'
import { isActiveNavigationPath } from '../src/features/navigation/path-matching'
import { INDEXABLE_ROUTE_PATHS, PAGE_ROUTE_TEMPLATES } from '../src/features/navigation/routes'
import { APP_VIEWS, getAdjacentViews, getViewByHref, getVisibleAppViews } from '../src/features/navigation/views'

function flattenRouteTemplates(input: Record<string, unknown>): string[] {
  return Object.values(input).flatMap(value => {
    if (typeof value === 'string') {
      return value
    }

    return flattenRouteTemplates(value as Record<string, unknown>)
  })
}

function collectFilesystemPageRoutes(appDir: string, routePrefix = ''): string[] {
  const routes: string[] = []
  const pageFile = path.join(appDir, 'page.tsx')

  if (fs.existsSync(pageFile)) {
    routes.push(routePrefix || '/')
  }

  for (const entry of fs.readdirSync(appDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue
    }

    const routeSegment = isRouteGroupDirectory(entry.name) ? '' : entry.name
    const childPrefix = routeSegment ? `${routePrefix}/${routeSegment}`.replace('//', '/') : routePrefix
    routes.push(...collectFilesystemPageRoutes(path.join(appDir, entry.name), childPrefix))
  }

  return routes
}

function isRouteGroupDirectory(entryName: string): boolean {
  return (entryName.startsWith('(') && entryName.endsWith(')')) || entryName.startsWith('@')
}

function collectFilesystemPageFiles(appDir: string): string[] {
  const pageFiles: string[] = []
  const pageFile = path.join(appDir, 'page.tsx')

  if (fs.existsSync(pageFile)) {
    pageFiles.push(pageFile)
  }

  for (const entry of fs.readdirSync(appDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue
    }

    pageFiles.push(...collectFilesystemPageFiles(path.join(appDir, entry.name)))
  }

  return pageFiles
}

test('app view registry keeps unique ids and hrefs', () => {
  const ids = new Set(APP_VIEWS.map(view => view.id))
  const hrefs = new Set(APP_VIEWS.map(view => view.href))

  assert.equal(ids.size, APP_VIEWS.length)
  assert.equal(hrefs.size, APP_VIEWS.length)

  for (const view of APP_VIEWS) {
    assert.ok(view.label.length > 0)
    assert.ok(view.description.length > 0)
    assert.ok(view.href.startsWith('/'))
    assert.ok(view.requiredPermission.length > 0)
  }
})

test('page route templates stay aligned with the filesystem', () => {
  const appDir = path.resolve(__dirname, '..', '..', 'src', 'app')
  const declaredRoutes = flattenRouteTemplates(PAGE_ROUTE_TEMPLATES).sort()
  const filesystemRoutes = collectFilesystemPageRoutes(appDir).sort()

  assert.deepEqual(declaredRoutes, filesystemRoutes)
})

test('route entrypoints stay thin and delegate to feature screens', () => {
  const appDir = path.resolve(__dirname, '..', '..', 'src', 'app')
  const allowedInlinePages = new Set([path.join(appDir, 'dev', 'auth-admin', 'page.tsx')])
  const pageFiles = collectFilesystemPageFiles(appDir)

  for (const pageFile of pageFiles) {
    if (allowedInlinePages.has(pageFile)) {
      continue
    }

    const source = fs.readFileSync(pageFile, 'utf8')
    assert.match(
      source,
      /from ['"]@\/features\/.+\/screens\/.+['"]/,
      `${path.relative(appDir, pageFile)} should import a feature screen`
    )
    assert.ok(
      !source.includes("'use client'") && !source.includes('"use client"'),
      `${path.relative(appDir, pageFile)} should stay server-side and thin`
    )
  }
})

test('app view registry stays aligned with canonical indexable routes', () => {
  const registeredIds = APP_VIEWS.map(view => view.id).sort()
  const canonicalIds = Object.keys(INDEXABLE_ROUTE_PATHS).sort()

  assert.deepEqual(registeredIds, canonicalIds)

  for (const view of APP_VIEWS) {
    assert.equal(view.href, INDEXABLE_ROUTE_PATHS[view.id])
  }
})

test('operator, supervisor and admin see the expected view set', () => {
  const operatorPermissions = resolvePermissionProfileFromRole('operator').permissions
  const supervisorPermissions = resolvePermissionProfileFromRole('supervisor').permissions
  const adminPermissions = resolvePermissionProfileFromRole('admin').permissions

  assert.deepEqual(
    getVisibleAppViews(operatorPermissions).map(view => view.href),
    ['/dashboard', '/machines', '/checklists', '/executions', '/findings']
  )

  assert.deepEqual(
    getVisibleAppViews(supervisorPermissions).map(view => view.href),
    ['/dashboard', '/machines', '/checklists', '/executions', '/findings']
  )

  assert.deepEqual(
    getVisibleAppViews(adminPermissions).map(view => view.href),
    ['/dashboard', '/machines', '/checklists', '/executions', '/findings', '/admin']
  )
})

test('view lookup resolves known routes and ignores unknown ones', () => {
  assert.equal(getViewByHref('/machines')?.id, 'machines')
  assert.equal(getViewByHref('/missing'), null)
})

test('adjacent view cycle wraps correctly for operator navigation', () => {
  const operatorPermissions = resolvePermissionProfileFromRole('operator').permissions
  const fromDashboard = getAdjacentViews('/dashboard', operatorPermissions)
  assert.equal(fromDashboard.previous?.href, '/findings')
  assert.equal(fromDashboard.next?.href, '/machines')

  const fromFindings = getAdjacentViews('/findings', operatorPermissions)
  assert.equal(fromFindings.previous?.href, '/executions')
  assert.equal(fromFindings.next?.href, '/dashboard')
})

test('adjacent view cycle includes admin route for admin role', () => {
  const adminPermissions = resolvePermissionProfileFromRole('admin').permissions
  const fromAdmin = getAdjacentViews('/admin', adminPermissions)
  assert.equal(fromAdmin.previous?.href, '/findings')
  assert.equal(fromAdmin.next?.href, '/dashboard')
})

test('adjacent view cycle returns empty neighbors for unknown or insufficient context', () => {
  const operatorPermissions = resolvePermissionProfileFromRole('operator').permissions
  const unknownRoute = getAdjacentViews('/not-registered', operatorPermissions)
  assert.equal(unknownRoute.previous, null)
  assert.equal(unknownRoute.next, null)

  const withoutPermissions = getAdjacentViews('/dashboard', null)
  assert.equal(withoutPermissions.previous, null)
  assert.equal(withoutPermissions.next, null)
})

test('active route matching handles exact and nested paths without string drift', () => {
  assert.equal(isActiveNavigationPath('/dashboard', INDEXABLE_ROUTE_PATHS.dashboard), true)
  assert.equal(isActiveNavigationPath('/executions/exec-1', INDEXABLE_ROUTE_PATHS.executions), true)
  assert.equal(isActiveNavigationPath('/executions-archive', INDEXABLE_ROUTE_PATHS.executions), false)
})

test('tracked navigation keeps querystrings for comparisons while ignoring hashes', () => {
  assert.equal(normalizeNavigationHref('/executions?machine=m-1#top'), '/executions?machine=m-1')
  assert.equal(getCurrentNavigationHref('/executions', { toString: () => 'machine=m-1' }), '/executions?machine=m-1')
  assert.equal(getCurrentNavigationHref('/executions', { toString: () => '' }), '/executions')
})
