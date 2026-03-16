import { RouteLoadingScreen } from '@/components/feedback/RouteLoadingScreen'

export default function Loading() {
  return (
    <RouteLoadingScreen
      variant="detail"
      title="Cargando detalle de ejecucion"
      description="Resolviendo progreso, evidencia y resultados de la ejecucion seleccionada."
    />
  )
}
