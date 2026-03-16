import { RouteLoadingScreen } from '@/components/feedback/RouteLoadingScreen'

export default function Loading() {
  return (
    <RouteLoadingScreen
      variant="list"
      title="Cargando checklists"
      description="Preparando filtros, metricas y tarjetas del catalogo operativo."
    />
  )
}
