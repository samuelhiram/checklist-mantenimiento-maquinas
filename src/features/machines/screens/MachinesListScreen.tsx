// Route: /machines
// Access: operator | supervisor | admin
// Purpose: render the machines listing while keeping the route entrypoint thin.

import { Suspense } from 'react'
import Link from 'next/link'
import { Cpu, Plus } from 'lucide-react'
import { ScreenHeader } from '@/components/screen/ScreenHeader'
import { ScreenPage } from '@/components/screen/ScreenPage'
import { ScreenStatsGrid } from '@/components/screen/ScreenStatsGrid'
import { ScreenCardGridSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ViewCycleNav } from '@/features/navigation/components/ViewCycleNav'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { getCurrentSession } from '@/lib/auth/session'
import { getAppAccessSnapshot } from '@/lib/auth/authorization'
import { getMachineStats } from '../queries'
import { MachinesListToolbar } from '../components/MachinesListToolbar'
import { MachinesListGallery } from '../components/MachinesListGallery'

export async function MachinesListScreen({
  searchParams,
}: {
  searchParams?: {
    search?: string
    status?: string
    type?: string
    priority?: string
  }
}) {
  const session = await getCurrentSession()
  if (!session?.org.id) return null

  const access = getAppAccessSnapshot(session.profile)
  const stats = await getMachineStats(session.org.id)

  return (
    <ScreenPage>
      <ScreenHeader
        size="lg"
        title="Maquinas y Equipos"
        description={`${stats.total} activos registrados / ${stats.active} operativos`}
        icon={Cpu}
        accentClassName="text-blue-400"
        actions={
          access.machines.create ? (
            <Link href={ROUTE_PATHS.machines.create} className="btn-primary">
              <Plus className="h-4 w-4" />
              Nueva maquina
            </Link>
          ) : null
        }
      />

      <ScreenStatsGrid
        columnsClassName="grid-cols-1 sm:grid-cols-3"
        items={[
          { label: 'Operativos', value: stats.active, tone: 'emerald' },
          { label: 'Mantenimiento', value: stats.maintenance, tone: 'amber' },
          { label: 'Prioridad critica', value: stats.critical, tone: 'red' },
        ]}
      />

      <MachinesListToolbar />

      <Suspense fallback={<ScreenCardGridSkeleton cards={6} />}>
        <MachinesListGallery 
          search={searchParams?.search}
          status={searchParams?.status}
          type={searchParams?.type}
          priority={searchParams?.priority}
        />
      </Suspense>

      <ViewCycleNav currentHref={ROUTE_PATHS.machines.list} />
    </ScreenPage>
  )
}
