# Authorization Pattern

Ver tambien: `docs/frontend-routing.md`, `docs/frontend-architecture.md` y `docs/permission-taxonomy.md`

## Objetivo
- Centralizar la autorizacion real en permisos canonicos.
- Mantener compatibilidad temporal con `Profile.role` mientras el sistema migra.
- Separar navegacion visible, guards server-side y checks de UI sin duplicar logica.

## Fuente de verdad
1. `src/lib/auth/authorization-catalog.ts`
   - Fuente canonica unica de features autorizables, operaciones, metadata indexable y grants base por perfil.
   - Cuando nace un modulo nuevo o una operacion nueva, se declara aqui primero.
2. `src/lib/auth/permission-profiles.ts`
   - Deriva perfiles efectivos y definiciones de permisos desde el catalogo canonico.
   - Aqui vive el puente temporal `role -> permission profile`.
   - Aqui tambien vive la resolucion efectiva del perfil persistido con fallback legacy cuando falta `permissionProfileId`.
3. `prisma/schema.prisma`
   - Persistencia de `Permission`, `PermissionProfile`, `PermissionProfilePermission` y `Profile.permissionProfileId`.
   - Los nombres visibles pueden cambiar, pero la autorizacion debe seguir dependiendo de permisos canonicos.
4. `src/lib/auth/sync-authorization-catalog.ts`
   - Upsert server-side del catalogo y backfill de perfiles legacy sin `permissionProfileId`.
5. `src/lib/auth/authorization.ts`
   - Helpers semanticos client-safe para UI, composicion y lecturas de acceso.
   - Preferir `canCreateMachines`, `canEditChecklists`, `canViewAdministration`, etc. en vez de repetir `hasPermission(...)`.
   - Tambien expone snapshots por feature para front, por ejemplo `getAppAccessSnapshot`, `getMachinesAccess` y `getChecklistsAccess`.
6. `src/lib/auth/authorization-guards.ts`
   - Guards semanticos server-side para rutas y screens protegidas.
   - Preferir `requireMachineCreateAccess`, `requireChecklistCreateAccess`, `requireAdminViewAccess`, etc.
7. `src/lib/auth/session.ts`
   - Resuelve la sesion autentica y normaliza `AuthenticatedProfile`.
   - `getCurrentSession()` es read-only y seguro para render.
   - `getCurrentSessionWithRefresh()` es la variante mutable para route handlers cuando se necesita refresh de idle expiry y limpieza de cookie invalida.
   - Consume el `permissionProfile` persistido si ya existe y cae a fallback por `role` solo para compatibilidad historica.
8. `src/features/navigation/views.ts`
   - La navegacion principal se deriva del catalogo y se indexa por `requiredPermission`, no por strings de role.

## Perfiles iniciales
- `operator_basic`
  - Acceso operativo a dashboard, maquinas, checklists, ejecuciones y hallazgos.
  - Puede ejecutar procedimientos.
- `supervisor_operations`
  - Todo lo del operador.
  - Puede crear y editar maquinas y checklists.
  - Puede gestionar hallazgos.
- `admin_system`
  - Todo lo del supervisor.
  - Puede entrar al modulo admin.
  - Puede gestionar usuarios y configuracion de organizacion.

## Regla de compatibilidad
- `Profile.role` sigue existiendo como compatibilidad temporal y etiqueta operativa.
- `Profile.permissionProfileId` es ya la relacion persistida preferida.
- La autorizacion efectiva ya no debe derivarse de `role` en codigo nuevo.
- Si una pantalla nueva necesita acceso:
  - preferir guards semanticos de `src/lib/auth/authorization-guards.ts`
  - preferir helpers semanticos de `src/lib/auth/authorization.ts` en UI
- `requireRole(...)` queda solo para compatibilidad con flows legacy mientras la migracion termina.

## Guardrails practicos
- Server-first:
  - rutas del shell principal: `src/app/(authenticated)` con `AppShell`
  - rutas protegidas con restricciones extra: guards semanticos en layouts anidados o helpers server-side
  - helpers puntuales: guards semanticos en `authorization-guards.ts`
  - forms de login: server actions con redirect, no `fetch + router.replace` como fuente principal
- UI:
  - en screens de front, derivar acceso una sola vez al inicio con `getAppAccessSnapshot(user)` o `get<X>Access(user)`
  - ocultar o mostrar CTA con las capabilities derivadas, no con strings repetidos
  - no usar visibilidad de menu como seguridad real
- Navegacion:
  - `views.ts` ya no debe inventar permisos nuevos
  - las vistas indexables se derivan del catalogo y solo resuelven `href`

## Como extender el sistema
1. Declarar el modulo u operacion nueva en `src/lib/auth/authorization-catalog.ts`
2. Asignar sus grants al perfil correspondiente en ese mismo catalogo
3. Si el modulo entra a navegacion principal:
   - agregar su path en `src/features/navigation/routes.ts`
   - agregar su icono en `src/features/navigation/view-icons.tsx`
4. Sincronizar Prisma con:
   - crear o actualizar migracion versionada
   - `npm run prisma:migrate:deploy`
   - `npm run prisma:sync-authz`
5. Agregar o reutilizar helper semantico en `src/lib/auth/authorization.ts`
6. Si hace falta un guard server-side, agregarlo en `src/lib/auth/authorization-guards.ts`
7. Reemplazar guards o `canEdit` por helpers semanticos, no por strings nuevos
8. Correr:
   - `npm run verify`
   - `npm run verify:full` si el cambio toca auth, layouts o navegacion

## Que no hacer
- No usar nombres de perfil como fuente de seguridad.
- No usar `role === 'admin'` en codigo nuevo para decisiones de acceso.
- No esconder menus pensando que eso protege la ruta.
- No repartir permisos en constantes ad hoc dentro de cada screen.
- No volver a introducir `hasPermission(user?.permissions, '...')` en screens si ya existe helper semantico.
- No volver a depender solo de `prisma db push` para cambios estructurales de auth/permisos si ya existe migracion versionada.
