// Used by routes: shared loading boundaries across public and authenticated segments.
// Purpose: render route-aware skeleton screens with a consistent propagation pattern.

import { Activity } from 'lucide-react'
import clsx from 'clsx'
import {
  DetailHeaderSkeleton,
  ScreenCardGridSkeleton,
  ScreenEditorStackSkeleton,
  ScreenHeaderSkeleton,
  ScreenListPanelSkeleton,
  ScreenSplitPanelsSkeleton,
  ScreenStatsGridSkeleton,
  ScreenToolbarSkeleton,
  SkeletonBlock,
  SkeletonCircle,
  SkeletonPanel,
  SkeletonPill,
  SkeletonText,
} from './LoadingSkeleton'

export type RouteLoadingVariant = 'auth' | 'workspace' | 'dashboard' | 'list' | 'detail' | 'editor'

const ROUTE_LOADING_COPY: Record<RouteLoadingVariant, { title: string; description: string }> = {
  auth: {
    title: 'Preparando acceso',
    description: 'Cargando autenticacion, organizacion y primer estado de la aplicacion.',
  },
  workspace: {
    title: 'Preparando espacio de trabajo',
    description: 'Resolviendo navegacion, permisos y contenido inicial de la ruta actual.',
  },
  dashboard: {
    title: 'Cargando dashboard',
    description: 'Preparando resumen operativo, indicadores y accesos rapidos.',
  },
  list: {
    title: 'Cargando listado',
    description: 'Montando filtros, metricas y resultados para que la vista aparezca estable.',
  },
  detail: {
    title: 'Cargando detalle',
    description: 'Resolviendo contexto, paneles relacionados y actividad reciente.',
  },
  editor: {
    title: 'Cargando editor',
    description: 'Preparando formulario, acciones y estructura editable de la pantalla.',
  },
}

function LoadingIntro({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-3 animate-in sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/20 bg-accent-cyan/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-cyan/35" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-cyan" />
          </span>
          {title}
        </div>
        <p className="max-w-2xl text-sm text-slate-500">{description}</p>
      </div>
      <div className="hidden flex-shrink-0 items-center gap-2 lg:flex">
        <SkeletonPill className="w-20" />
        <SkeletonPill className="w-28" />
      </div>
    </div>
  )
}

function AuthRouteSkeleton({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="w-full max-w-md animate-in">
      <SkeletonPanel className="space-y-6 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-accent-cyan/20 bg-accent-cyan/10">
            <Activity className="h-5 w-5 text-accent-cyan animate-pulse" />
          </div>
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{title}</p>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-24 rounded-md" />
            <SkeletonBlock className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-20 rounded-md" />
            <SkeletonBlock className="h-11 w-full rounded-xl" />
          </div>
        </div>

        <SkeletonBlock className="h-11 w-full rounded-xl" />

        <div className="flex items-center justify-between gap-3">
          <SkeletonBlock className="h-3 w-28 rounded-md" />
          <SkeletonBlock className="h-3 w-16 rounded-md" />
        </div>
      </SkeletonPanel>
    </div>
  )
}

function DashboardRouteSkeleton({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <>
      <LoadingIntro title={title} description={description} />
      <ScreenHeaderSkeleton actionCount={1} />
      <ScreenStatsGridSkeleton />
      <div className="grid gap-4 lg:grid-cols-3">
        <SkeletonPanel className="space-y-4 lg:col-span-2">
          <div className="flex items-start gap-3">
            <SkeletonCircle className="h-10 w-10 flex-shrink-0" />
            <div className="min-w-0 flex-1 space-y-3">
              <SkeletonBlock className="h-5 w-44 rounded-md" />
              <SkeletonText lines={3} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-9 w-28 rounded-lg" />
            <SkeletonBlock className="h-9 w-28 rounded-lg" />
            <SkeletonBlock className="h-9 w-28 rounded-lg" />
          </div>
        </SkeletonPanel>
        <SkeletonPanel className="space-y-4">
          <SkeletonBlock className="h-5 w-28 rounded-md" />
          <SkeletonText lines={4} lastLineClassName="w-7/12" />
          <div className="flex flex-wrap gap-2">
            <SkeletonPill className="w-20" />
            <SkeletonPill className="w-24" />
          </div>
        </SkeletonPanel>
      </div>
    </>
  )
}

function ListRouteSkeleton({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <>
      <LoadingIntro title={title} description={description} />
      <ScreenHeaderSkeleton actionCount={1} />
      <ScreenStatsGridSkeleton cards={3} columnsClassName="grid-cols-1 sm:grid-cols-3" />
      <ScreenToolbarSkeleton />
      <SkeletonBlock className="h-4 w-44 rounded-md animate-in-delay-1" />
      <ScreenCardGridSkeleton />
    </>
  )
}

function DetailRouteSkeleton({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <>
      <LoadingIntro title={title} description={description} />
      <DetailHeaderSkeleton />
      <ScreenSplitPanelsSkeleton className="animate-in-delay-1" />
      <ScreenStatsGridSkeleton cards={3} columnsClassName="grid-cols-1 sm:grid-cols-3" />
      <div className="grid gap-4 xl:grid-cols-2">
        <ScreenListPanelSkeleton rows={4} />
        <ScreenListPanelSkeleton rows={4} />
      </div>
    </>
  )
}

function EditorRouteSkeleton({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <>
      <LoadingIntro title={title} description={description} />
      <DetailHeaderSkeleton actionCount={2} />
      <ScreenStatsGridSkeleton cards={4} columnsClassName="grid-cols-2 xl:grid-cols-4" />
      <ScreenEditorStackSkeleton />
      <div className="flex flex-col justify-between gap-3 animate-in-delay-3 sm:flex-row">
        <SkeletonBlock className="h-10 w-40 rounded-lg" />
        <SkeletonBlock className="h-10 w-36 rounded-lg" />
      </div>
    </>
  )
}

function WorkspaceRouteSkeleton({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <>
      <LoadingIntro title={title} description={description} />
      <ScreenHeaderSkeleton />
      <ScreenStatsGridSkeleton />
      <ScreenToolbarSkeleton filterCount={2} />
      <ScreenSplitPanelsSkeleton className="animate-in-delay-2" />
      <ScreenListPanelSkeleton rows={4} className="animate-in-delay-3" />
    </>
  )
}

export function RouteLoadingScreen({
  title,
  description,
  viewport = 'content',
  variant = 'workspace',
}: {
  title?: string
  description?: string
  viewport?: 'content' | 'screen'
  variant?: RouteLoadingVariant
}) {
  const viewportClass = viewport === 'screen' ? 'min-h-screen' : 'min-h-full'
  const copy = ROUTE_LOADING_COPY[variant]
  const resolvedTitle = title ?? copy.title
  const resolvedDescription = description ?? copy.description
  const isAuthVariant = variant === 'auth'

  const content = (() => {
    if (variant === 'auth') {
      return <AuthRouteSkeleton title={resolvedTitle} description={resolvedDescription} />
    }

    if (variant === 'dashboard') {
      return <DashboardRouteSkeleton title={resolvedTitle} description={resolvedDescription} />
    }

    if (variant === 'list') {
      return <ListRouteSkeleton title={resolvedTitle} description={resolvedDescription} />
    }

    if (variant === 'detail') {
      return <DetailRouteSkeleton title={resolvedTitle} description={resolvedDescription} />
    }

    if (variant === 'editor') {
      return <EditorRouteSkeleton title={resolvedTitle} description={resolvedDescription} />
    }

    return <WorkspaceRouteSkeleton title={resolvedTitle} description={resolvedDescription} />
  })()

  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className={clsx(
        viewportClass,
        'w-full bg-grid p-6',
        isAuthVariant ? 'flex items-center justify-center' : undefined
      )}
      role="status"
    >
      <span className="sr-only">{`${resolvedTitle}. ${resolvedDescription}`}</span>
      <div className={clsx('w-full', isAuthVariant ? 'max-w-md' : 'mx-auto max-w-7xl space-y-5')}>
        {content}
      </div>
    </section>
  )
}
