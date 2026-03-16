import { RouteLoadingScreen } from '@/components/feedback/RouteLoadingScreen'

export default function Loading() {
  return (
    <RouteLoadingScreen
      variant="editor"
      title="Preparando nuevo checklist"
      description="Montando estructura editable, acciones y contexto base del checklist."
    />
  )
}
