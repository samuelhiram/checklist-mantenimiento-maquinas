import { Cpu } from 'lucide-react'
import { EmptyState } from '@/components/screen/EmptyState'
import { getCurrentSession } from '@/lib/auth/session'
import { MachineCard } from './MachineCard'
import { listMachines } from '../queries'

export async function MachinesListGallery({
  search,
  status,
  type,
  priority,
}: {
  search?: string
  status?: string
  type?: string
  priority?: string
}) {
  const session = await getCurrentSession()
  if (!session?.org.id) return null

  const machines = await listMachines(session.org.id, {
    search,
    status,
    type,
    priority,
  })

  if (machines.length === 0) {
    return (
      <div className="col-span-1 md:col-span-2 xl:col-span-3">
        <EmptyState
          icon={Cpu}
          title="No se encontraron maquinas"
          description="Intenta ajustar los filtros de busqueda"
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {machines.map(machine => (
        <MachineCard key={machine.id} machine={machine} />
      ))}
    </div>
  )
}
