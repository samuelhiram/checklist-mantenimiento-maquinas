import { RouteLoadingScreen } from '@/components/feedback/RouteLoadingScreen'

export default function Loading() {
  return (
    <RouteLoadingScreen
      variant="editor"
      title="Cargando edicion de maquina"
      description="Preparando formulario, permisos y estado editable de la maquina seleccionada."
    />
  )
}
