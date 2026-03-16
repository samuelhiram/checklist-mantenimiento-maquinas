// Route: /checklists/new
// Access: supervisor | admin
// Purpose: keep the checklist creation route inside the checklists feature until the full form is implemented.

import { ClipboardList, Cpu } from 'lucide-react'
import Link from 'next/link'
import { RoutePlaceholder } from '@/components/screen/RoutePlaceholder'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { requireChecklistCreateAccess } from '@/lib/auth/authorization-guards'

export async function ChecklistCreateScreen({ machineId }: { machineId?: string }) {
  await requireChecklistCreateAccess()

  const description = machineId
    ? `Nuevo checklist para la maquina ${machineId}.`
    : 'Nueva plantilla de checklist reusable.'

  return (
    <RoutePlaceholder
      title="Nuevo checklist"
      description={description}
      backHref={ROUTE_PATHS.checklists.list}
      backLabel="Volver a checklists"
      icon={ClipboardList}
      note="La ruta ya acepta contexto por maquina y queda lista para crecer hacia un editor server-first sin romper enlaces desde otras vistas."
      action={
        <Link
          href={machineId ? ROUTE_PATHS.machines.detail(machineId) : ROUTE_PATHS.checklists.list}
          className="btn-primary"
        >
          <Cpu className="h-4 w-4" />
          {machineId ? 'Volver a la maquina' : 'Ver plantillas'}
        </Link>
      }
    />
  )
}
