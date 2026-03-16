# Loading UX Pattern

## Objetivo
- Unificar feedback visual para fetches, thunks, server actions y transiciones de ruta.
- Evitar spinners ad hoc y botones inconsistentes.
- Hacer que el patron sea facil de repetir sin reinterpretar la implementacion cada vez.

## Fuente de verdad
1. `src/components/ui/AppProviders.tsx`
   - Monta `AsyncUiProvider` para coordinar pending local reusable.
2. `src/components/feedback/AsyncUiProvider.tsx`
   - Registro global de tareas pendientes.
3. `src/components/feedback/AsyncButton.tsx`
   - Boton compartido para estados `loading`, `disabled` y `aria-busy`.
4. `src/components/feedback/FormSubmitButton.tsx`
   - Wrapper para forms con server actions.
5. `src/hooks/useAsyncAction.ts`
   - Hook para acciones cliente que disparan promesas.
6. `src/app/loading.tsx`
   - Fallback root/public para transiciones de ruta fuera del shell autenticado.
7. `src/app/(authenticated)/loading.tsx`
   - Fallback del shell autenticado; mantiene sidebar y menu mientras carga el contenido.
8. `src/components/feedback/LoadingSkeleton.tsx`
   - Primitives canonicas de skeleton: bloques, lineas, paneles y composiciones de screen.
9. `src/components/feedback/RouteLoadingScreen.tsx`
   - Orquestador canonico para skeleton screens de ruta con variantes como `auth`, `workspace`, `dashboard`, `list`, `detail` y `editor`.
10. `src/features/navigation/components/TrackedLink.tsx`
   - Wrapper para links de superficies de navegacion persistente.

## Regla practica
- Boton cliente con `fetch`, thunk o promesa:
  - usar `useAsyncAction(...)`
  - renderizar con `AsyncButton`
- Boton cliente con estado de carga ya existente en el mismo screen o feature:
  - mantener esa fuente
  - pasar `loading={...}` a `AsyncButton`
- Form con `action={serverAction}`:
  - usar `FormSubmitButton`
- Ruta o segmento que deba mostrar espera mientras resuelve:
  - usar `loading.tsx`
  - reutilizar `RouteLoadingScreen`
  - si vive dentro del shell principal, preferir `src/app/(authenticated)/loading.tsx` para no tapar sidebar
  - cuando la forma del screen importa, pasar `variant` o crear un `loading.tsx` mas cercano con la variante adecuada
- Link dentro de sidebar, fast access dev o ciclo entre vistas:
  - usar `TrackedLink`

## Cuando no hace falta loader
- Boton que solo abre/cierra UI local, tabs, accordions, modales o estados visuales:
  - usar `button` normal
  - no usar `AsyncButton`
- Navegacion inmediata donde no quieres feedback adicional:
  - usar `Link` normal fuera de superficies persistentes
  - o `TrackedLink` con `trackNavigation={false}` si la superficie exige esa primitive
- Link persistente que debe conservar el patron pero sin spinner visual:
  - usar `TrackedLink`
  - dejar `showPendingSpinner={false}` o no pasarlo

## Ejemplos

### Accion cliente
```tsx
const saveAction = useAsyncAction({ label: 'Guardando checklist' })

const handleSave = async () => {
  await saveAction.run(async () => saveChecklistDraft(payload))
}

<AsyncButton
  onClick={handleSave}
  loading={saveAction.isLoading}
  loadingLabel="Guardando..."
  className="btn-primary"
>
  Guardar
</AsyncButton>
```

### Server action
```tsx
<form action={createAuthUserAction}>
  <FormSubmitButton className="btn-primary" loadingLabel="Creando...">
    Crear acceso
  </FormSubmitButton>
</form>
```

## Definicion de terminado
- Toda accion async visible desde un boton debe mostrar estado de carga.
- El boton debe quedar deshabilitado mientras la accion corre.
- El label en carga debe explicar la accion en curso.
- No se debe duplicar un spinner inline si `AsyncButton` o `FormSubmitButton` ya cubren el caso.
- Si la navegacion depende de trabajo server-side, la ruta debe tener `loading.tsx`.
- Si la navegacion ocurre dentro del shell autenticado, el loader debe vivir bajo el route group compartido para quedar solo en el area de contenido.
- Los loaders de ruta deben preferir skeletons estructurales antes que un spinner centrado generico.
- La variante elegida debe parecerse al screen final: `list` para catalogos, `detail` para detalle, `editor` para formularios, etc.
- Evitar barras globales de progreso si el feedback local del control ya comunica mejor el estado.
- No forzar loader en acciones que no esperan backend ni transicion real.

## Que evitar
- `button` con spinner custom copiado dentro de cada pantalla.
- `fetch(...)` directo sin feedback visual.
- usar `setLoading(true)` local si el caso ya cabe en `useAsyncAction`.
- dejar formularios con server action sin `FormSubmitButton`.

## Como propagarlo en una vista nueva
1. Identificar si la accion es cliente, server action o transicion de ruta.
2. Elegir la primitive correcta:
   - cliente: `useAsyncAction` + `AsyncButton`
   - server action: `FormSubmitButton`
   - ruta: `loading.tsx`
   - navegacion persistente: `TrackedLink`
3. Si es una ruta, decidir si basta con `RouteLoadingScreen` generico o si conviene una variante:
   - `auth`: acceso o bootstrap publico
   - `workspace`: fallback amplio dentro del shell
   - `dashboard`: overview con metricas
   - `list`: catalogos o grids
   - `detail`: vistas de detalle con paneles relacionados
   - `editor`: formularios y edicion
4. Si la variante no alcanza, componer el screen con primitives de `LoadingSkeleton.tsx` en vez de crear markup ad hoc.
5. Asignar un `label` corto y claro para la accion o la pantalla.
6. Evitar condicionales de spinner inline salvo que el caso sea realmente especial.
7. Verificar visualmente y luego correr:
   - `npm run verify`
   - `npm run verify:full` si el cambio altera navegacion, layouts o release UX

## Estado actual
- Ya adoptado en login principal, login dev, logout del sidebar, forms de `/dev/auth-admin`,
  guardado de checklist y acciones principales de ejecucion.
- Todavia puede haber botones legacy fuera de este patron; la regla es migrarlos cuando se toque
  esa pantalla, no volver a introducir implementaciones paralelas.
