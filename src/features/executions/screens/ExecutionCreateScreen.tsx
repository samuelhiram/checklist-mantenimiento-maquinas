// Route: /executions/new
// Access: operator | supervisor | admin
// Purpose: keep the execution creation route inside the executions feature until the guided setup is implemented.

import { ClipboardList, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import { RoutePlaceholder } from '@/components/screen/RoutePlaceholder'
import { ROUTE_PATHS } from '@/features/navigation/routes'

export async function ExecutionCreateScreen({ checklistId }: { checklistId?: string }) {
  const description = checklistId
    ? `Preparando una nueva ejecucion para el checklist ${checklistId}.`
    : 'Programacion o arranque de una nueva ejecucion.'

  return (
    <RoutePlaceholder
      title="Nueva ejecucion"
      description={description}
      backHref={ROUTE_PATHS.executions.list}
      backLabel="Volver a ejecuciones"
      icon={PlayCircle}
      note="Esta vista ya existe para que dashboard, checklists y detalle de maquina no enlacen a un 404. El siguiente paso es convertirla en un asistente de seleccion de checklist y responsable."
      action={
        <Link href={ROUTE_PATHS.executions.list} className="btn-primary">
          <ClipboardList className="h-4 w-4" />
          Ver ejecuciones
        </Link>
      }
    />
  )
}
