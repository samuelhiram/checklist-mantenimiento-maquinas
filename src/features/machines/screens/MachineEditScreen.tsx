// Route: /machines/[id]/edit
// Access: supervisor | admin
// Purpose: reserve the edit route so machine actions never point to a missing page.

import { Cpu, FilePenLine } from 'lucide-react'
import Link from 'next/link'
import { RoutePlaceholder } from '@/components/screen/RoutePlaceholder'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { requireMachineEditAccess } from '@/lib/auth/authorization-guards'

export async function MachineEditScreen({ machineId }: { machineId: string }) {
  await requireMachineEditAccess()

  return (
    <RoutePlaceholder
      title="Editar maquina"
      description={`Preparando la edicion de la maquina ${machineId}.`}
      backHref={ROUTE_PATHS.machines.detail(machineId)}
      backLabel="Volver al detalle"
      icon={FilePenLine}
      note="La edicion completa todavia no esta implementada, pero la ruta ya existe y queda protegida para evitar 404 desde el catalogo operativo."
      action={
        <Link href={ROUTE_PATHS.machines.detail(machineId)} className="btn-primary">
          <Cpu className="h-4 w-4" />
          Ver maquina
        </Link>
      }
    />
  )
}
