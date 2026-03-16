import { RouteLoadingScreen } from '@/components/feedback/RouteLoadingScreen'

export default function Loading() {
  return (
    <RouteLoadingScreen
      variant="detail"
      title="Cargando detalle de maquina"
      description="Resolviendo contexto tecnico, checklists, ejecuciones y hallazgos relacionados."
    />
  )
}
