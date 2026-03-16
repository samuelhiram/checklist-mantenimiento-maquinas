import { RouteLoadingScreen } from '@/components/feedback/RouteLoadingScreen'

export default function Loading() {
  return (
    <RouteLoadingScreen
      variant="editor"
      title="Preparando nueva ejecucion"
      description="Montando formulario, contexto de checklist y acciones de arranque."
    />
  )
}
