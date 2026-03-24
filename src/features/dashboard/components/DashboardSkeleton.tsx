import {
  ScreenHeaderSkeleton,
  ScreenStatsGridSkeleton,
  SkeletonBlock,
  SkeletonCircle,
  SkeletonPanel,
  SkeletonText,
  SkeletonPill,
  SkeletonScreen,
  SkeletonIntro,
} from '@/components/feedback/LoadingSkeleton'

export function DashboardSkeleton() {
  return (
    <SkeletonScreen>
      <SkeletonIntro 
        title="Dashboard" 
        description="Preparando resumen operativo, indicadores y accesos rapidos." 
      />
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
    </SkeletonScreen>
  )
}
