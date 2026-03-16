import { RouteLoadingScreen } from '@/components/feedback/RouteLoadingScreen'

export default function Loading() {
  return (
    <RouteLoadingScreen
      variant="list"
      title="Cargando ejecuciones"
      description="Preparando filtros, resumen y ejecuciones recientes para la vista operativa."
    />
  )
}
