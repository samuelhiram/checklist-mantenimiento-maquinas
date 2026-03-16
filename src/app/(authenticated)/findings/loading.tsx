import { RouteLoadingScreen } from '@/components/feedback/RouteLoadingScreen'

export default function Loading() {
  return (
    <RouteLoadingScreen
      variant="list"
      title="Cargando hallazgos"
      description="Preparando severidades, filtros y registros de seguimiento."
    />
  )
}
