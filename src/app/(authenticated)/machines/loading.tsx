import { RouteLoadingScreen } from '@/components/feedback/RouteLoadingScreen'

export default function Loading() {
  return (
    <RouteLoadingScreen
      variant="list"
      title="Cargando maquinas"
      description="Preparando filtros, metricas y tarjetas del inventario operativo."
    />
  )
}
