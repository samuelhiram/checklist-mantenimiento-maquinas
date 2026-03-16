import { RouteLoadingScreen } from '@/components/feedback/RouteLoadingScreen'

export default function Loading() {
  return (
    <RouteLoadingScreen
      variant="editor"
      title="Cargando editor de checklist"
      description="Preparando items, metricas y controles de guardado del checklist."
    />
  )
}
