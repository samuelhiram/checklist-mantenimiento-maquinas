# Frontend Routing Pattern

Ver tambien: `docs/loading-pattern.md` y `docs/authorization-pattern.md`

## Objetivo
- Tener una fuente canonica para rutas reutilizables del front.
- Separar existencia de ruta de indexacion en UI.
- Reducir strings hardcodeados en links, redirects y menus.
- Mantener `src/app` como entrypoint delgado que delega a screens por feature.

## Fuente de verdad
1. `src/app/...`
   - Define que rutas existen en Next.js.
   - Si agregas `page.tsx`, la ruta existe.
   - El `page.tsx` debe delegar a una screen de `src/features/.../screens`.
2. `src/features/navigation/routes.ts`
   - Fuente canonica para strings de rutas reutilizables.
   - Debe usarse en `Link`, `router.replace`, `redirect`, `fetch` y forms.
   - Tambien define `PAGE_ROUTE_TEMPLATES` para auditar que el contrato siga alineado con `src/app`.
3. `src/features/navigation/views.ts`
   - Registro derivado de vistas indexables en sidebar, fast access dev y ciclo entre views.
   - Solo incluye vistas de navegacion principal y toma su metadata base del catalogo de autorizacion.
4. `src/lib/auth/authorization-catalog.ts`
   - Fuente canonica de features autorizables, operaciones y metadata indexable.
   - Si un modulo nuevo debe verse o no verse segun permisos, se declara aqui primero.

## Regla practica
- Ruta existe: crear carpeta y `page.tsx` en `src/app`.
- Ruta reutilizable: agregar helper en `routes.ts`.
- Ruta indexable en UI: declarar feature indexable en `authorization-catalog.ts`; `views.ts` la derivara.
- Ruta protegida del shell principal: crearla bajo `src/app/(authenticated)` para heredar `AppShell` y su `loading.tsx`.
- Ruta protegida fuera del shell principal: usar `requirePermission` o `requireAnyPermission` en layout o helper server.

## Como agregar una vista nueva
1. Crear la ruta en `src/app/(authenticated)/nueva-vista/page.tsx` si pertenece al shell principal.
   - Si no pertenece al shell principal, ubicarla en el segmento que corresponda.
   - Mantenerla como wrapper delgado.
2. Agregar su path canonico en `src/features/navigation/routes.ts`.
3. Agregar o ajustar su template en `PAGE_ROUTE_TEMPLATES`.
4. Si debe salir en menu o ciclo de vistas:
   - agregar feature indexable y permiso `view` en `src/lib/auth/authorization-catalog.ts`
   - asignar icono en `src/features/navigation/view-icons.tsx`
   - `src/features/navigation/views.ts` la levantara sola
5. Si la pantalla usa links hacia otras rutas:
   - consumir `ROUTE_PATHS`
   - no escribir strings como `'/machines'` directo
6. Si la ruta es protegida:
   - reutilizar el route group `src/app/(authenticated)` cuando comparta sidebar
   - y aplicar `requirePermission(...)` / `requireAnyPermission(...)` solo si necesita una guardia extra
7. Correr verificaciones:
   - `npm run verify`

## Que no va en `views.ts`
- rutas `api`
- rutas `dev/login`
- rutas dinamicas de detalle
- rutas utilitarias como `new`, `edit`, `logout`
- metadata canonica de permisos o grants por perfil

## Decision de arquitectura
- `routes.ts` = contrato de paths reutilizables
- `PAGE_ROUTE_TEMPLATES` = contrato auditable contra `src/app`
- `authorization-catalog.ts` = fuente canonica de features con permisos y visibilidad
- `views.ts` = indexacion derivada de navegacion principal
- `app/` = existencia real de la ruta
- `features/.../screens` = implementacion real de la pantalla

## Regla de mantenimiento
- Si una ruta aparece en UI, auth o navegacion, no debe escribirse como string suelto si ya existe helper en `routes.ts`.
