# Frontend Architecture Pattern

Ver tambien: `docs/frontend-routing.md`, `docs/loading-pattern.md` y `docs/authorization-pattern.md`

## Objetivo
- Reducir ambiguedad al agregar vistas, componentes y estado de UI.
- Mantener `src/app` delgado y facil de recorrer.
- Separar claramente entrypoints, screens de dominio, primitives compartidos e infraestructura.

## Regla base
1. `src/app`
   - Solo entrypoints de rutas, layouts y endpoints de Next.
   - Los route groups de Next, por ejemplo `src/app/(authenticated)`, se usan para compartir shell y loading sin cambiar la URL publica.
   - Un `page.tsx` debe delegar a una screen de `src/features/.../screens`.
   - Excepcion actual: `src/app/dev/auth-admin/page.tsx`, porque es tooling tecnico y todavia concentra orquestacion server-only.
   - Si un `page.tsx` empieza a crecer, la screen esta en el lugar incorrecto.
2. `src/features/<dominio>`
   - Hogar de screens, componentes del dominio, config visual y helpers de composicion.
   - Aqui viven piezas como cards, filtros, tabs y status maps que pertenecen a un modulo concreto.
3. `src/components`
   - Solo primitives compartidos entre varios dominios.
   - No deben conocer `MOCK_*`, reglas del negocio ni registros de vistas.
4. `src/lib`
   - Infraestructura y boundaries: auth, Prisma, factories, normalizacion y acceso a datos demo/mock.
5. `src/components/ui/AuthProvider.tsx`
   - Espejo cliente minimo del auth server-owned para render de UI.
   - No es fuente de verdad de seguridad.

## Donde cae cada cosa
- Nueva vista completa: `src/features/<dominio>/screens/<Nombre>Screen.tsx`
- Card o tabla de un solo dominio: `src/features/<dominio>/components/...`
- Labels, status config, icon maps del dominio: `src/features/<dominio>/config.ts`
- Layout visual reutilizable: `src/components/screen/...`
- Badge o presentational primitive: `src/components/display/...`
- Loading, pending, async UX: `src/components/feedback/...`
- Metadatos y helpers de navegacion: `src/features/navigation/...`
- Shell autenticado compartido: `src/features/shell/...`
- Route entrypoint del shell autenticado: `src/app/(authenticated)/layout.tsx` y `src/app/(authenticated)/loading.tsx`
- Datos demo/mock y queries de referencia: `src/lib/demo/data.ts` y `src/lib/demo/queries.ts`

## Regla para estado
- Estado de filtros o tabs que solo afecta una screen: local con `useState`
- Auth visible de UI que cruza rutas: `AuthProvider`
- Drafts interactivos grandes: estado local del screen, no contexto global
- Si dos vistas similares resuelven el mismo problema, deben usar la misma estrategia

## Regla para permisos en front
- Cada screen debe derivar capacidades una sola vez al inicio.
- El vocabulario de features y operaciones sale del catalogo canonico: `src/lib/auth/authorization-catalog.ts`
- Fuente canonica: `src/lib/auth/authorization.ts`
- Preferir:
  - `const access = getAppAccessSnapshot(user)`
  - o `const machineAccess = getMachinesAccess(user)`
- Usar las capabilities resultantes para decidir:
  - que modulos o secciones se muestran
  - que CTA aparecen
  - que modo de la screen es solo lectura o editable
- No repartir checks `hasPermission('...')` por JSX de la screen.

## Regla para navegacion
- Strings de rutas: `src/features/navigation/routes.ts`
- Registro canonico de features/autorizacion: `src/lib/auth/authorization-catalog.ts`
- Vistas indexables derivadas: `src/features/navigation/views.ts`
- Links de superficies de navegacion persistente: `TrackedLink`
- Entry menus, sidebar y ciclo entre vistas no deben usar `next/link` directo

## Checklist al agregar un modulo
1. Crear `src/features/<dominio>/screens/<Nombre>Screen.tsx`
2. Crear `src/app/<ruta>/page.tsx` que solo delegue a esa screen
3. Si hay UI propia del dominio, ponerla en `src/features/<dominio>/components`
4. Si hay config repetida del dominio, moverla a `config.ts`
5. Si la vista entra al menu principal:
   - registrar feature y permisos en `src/lib/auth/authorization-catalog.ts`
   - registrar ruta en `src/features/navigation/routes.ts`
   - registrar icono en `src/features/navigation/view-icons.tsx`
6. Verificar con:
   - `npm run verify`
   - `npm run verify:full` si el cambio es estructural o de release

## Guardrail actual
- `tests/app-views.test.ts` falla si un `page.tsx` fuera de la excepcion tecnica deja de importar una screen de `src/features/.../screens`.
- Esa misma prueba tambien falla si un route entrypoint vuelve a declararse como client component.
