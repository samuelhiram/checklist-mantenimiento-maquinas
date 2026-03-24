import {
  ScreenHeaderSkeleton,
  ScreenStatsGridSkeleton,
  ScreenToolbarSkeleton,
  ScreenCardGridSkeleton,
  SkeletonBlock,
  SkeletonScreen,
  SkeletonIntro,
} from '@/components/feedback/LoadingSkeleton'

export function MachinesListSkeleton() {
  return (
    <SkeletonScreen>
      <SkeletonIntro 
        title="Cargando maquinas" 
        description="Preparando listado de equipos, filtros operativos y metricas de estado." 
      />
      <ScreenHeaderSkeleton actionCount={1} />
      <ScreenStatsGridSkeleton cards={3} columnsClassName="grid-cols-1 sm:grid-cols-3" />
      <ScreenToolbarSkeleton />
      <SkeletonBlock className="h-4 w-44 rounded-md animate-in-delay-1" />
      <ScreenCardGridSkeleton />
    </SkeletonScreen>
  )
}
