// Route: /machines/new
// Access: supervisor | admin
// Purpose: keep the creation route available while the machine form workflow is completed.

import { Cpu, Search } from 'lucide-react'
import Link from 'next/link'
import { RoutePlaceholder } from '@/components/screen/RoutePlaceholder'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { requireMachineCreateAccess } from '@/lib/auth/authorization-guards'

export async function MachineCreateScreen() {
  await requireMachineCreateAccess()

  return (
    <RoutePlaceholder
      title="Nueva maquina"
      description="Alta de maquinas, procesos y servicios."
      backHref={ROUTE_PATHS.machines.list}
      backLabel="Volver a maquinas"
      icon={Cpu}
      note="La ruta ya esta registrada y lista para crecer sin romper la navegacion. El siguiente paso natural es conectar un formulario server-first con Prisma."
      action={
        <Link href={ROUTE_PATHS.machines.list} className="btn-primary">
          <Search className="h-4 w-4" />
          Revisar catalogo
        </Link>
      }
    />
  )
}
