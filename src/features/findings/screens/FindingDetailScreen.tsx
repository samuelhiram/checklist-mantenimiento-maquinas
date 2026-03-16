// Route: /findings/[id]
// Access: operator | supervisor | admin
// Purpose: keep the finding detail route inside the findings feature until the full workflow is implemented.

import { AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { RoutePlaceholder } from '@/components/screen/RoutePlaceholder'
import { ROUTE_PATHS } from '@/features/navigation/routes'

export async function FindingDetailScreen({ findingId }: { findingId: string }) {
  return (
    <RoutePlaceholder
      title="Detalle de hallazgo"
      description={`Hallazgo ${findingId}.`}
      backHref={ROUTE_PATHS.findings.list}
      backLabel="Volver a hallazgos"
      icon={AlertTriangle}
      note="El detalle ya tiene una ruta estable para que los links del dashboard y las maquinas no queden rotos. Aqui puede crecer despues el seguimiento completo del hallazgo."
      action={
        <Link href={ROUTE_PATHS.findings.list} className="btn-primary">
          <ArrowLeft className="h-4 w-4" />
          Regresar al tablero de hallazgos
        </Link>
      }
    />
  )
}
