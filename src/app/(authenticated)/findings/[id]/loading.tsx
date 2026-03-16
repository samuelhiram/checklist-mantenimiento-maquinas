import { RouteLoadingScreen } from '@/components/feedback/RouteLoadingScreen'

export default function Loading() {
  return (
    <RouteLoadingScreen
      variant="detail"
      title="Cargando hallazgo"
      description="Resolviendo contexto, trazabilidad y acciones relacionadas del hallazgo."
    />
  )
}
