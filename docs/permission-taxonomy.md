# Permission Taxonomy

Ver tambien: `docs/authorization-pattern.md` y `prisma/schema.prisma`

## Objetivo
- Definir un vocabulario estable de permisos para que backend, frontend y agentes hablen el mismo idioma.
- Evitar permisos vagos como `write` cuando el sistema necesita distinguir acciones reales.
- Dejar claro cuando una accion debe ser `delete` y cuando debe ser `archive`.

## Forma canonica
- Formato preferido: `<resource>.<operation>`
- Ejemplos:
  - `machines.view`
  - `checklists.create`
  - `executions.run`
  - `organization.manage`

## Operaciones canonicas
- `view`
  - Lectura y acceso visible al modulo, listado o detalle.
- `create`
  - Alta de nuevas entidades.
- `edit`
  - Modificacion de entidades existentes.
- `delete`
  - Eliminacion irreversible o purge real.
- `archive`
  - Baja logica reversible o salida de operacion sin borrar historico.
- `restore`
  - Reactivacion de una entidad archivada o soft-deleted.
- `run`
  - Ejecucion operativa de un flujo o procedimiento.
- `review`
  - Revision formal de un trabajo ejecutado.
- `approve`
  - Aprobacion explicita con peso de negocio o cumplimiento.
- `assign`
  - Asignacion de responsables o trabajo.
- `manage`
  - Permiso agregado para superficies administrativas donde todavia no conviene separar mas fino.

## Regla de oro
- No usar `read` y `write` como permisos finales del sistema.
- `view` es la operacion de lectura.
- La "escritura" se descompone en acciones concretas: `create`, `edit`, `delete`, `archive`, `restore`.
- Si el dominio tiene una accion propia de negocio, usar un verbo semantico como `run`, `review`, `approve` o `assign`.

## Cuando usar `manage`
- Usarlo solo cuando la superficie es claramente administrativa y todavia no vale la pena dividirla.
- Ejemplos validos hoy:
  - `users.manage`
  - `organization.manage`
- Evitar `machines.manage` o `checklists.manage` como permiso principal si ya existen `create` y `edit`.

## Recomendacion por dominio
- `dashboard`
  - `dashboard.view`
- `machines`
  - base: `machines.view`, `machines.create`, `machines.edit`
  - si se agrega baja logica: `machines.archive`, `machines.restore`
  - si existe purge real: `machines.delete`
- `checklists`
  - base: `checklists.view`, `checklists.create`, `checklists.edit`
  - preferido para baja logica: `checklists.archive`, `checklists.restore`
  - `checklists.delete` solo si realmente se permite borrado irreversible
- `executions`
  - base: `executions.view`, `executions.run`
  - posibles futuros: `executions.review`, `executions.approve`
- `findings`
  - base: `findings.view`
  - si se granulariza: `findings.create`, `findings.edit`, `findings.assign`, `findings.review`, `findings.close`
  - `findings.manage` puede sobrevivir temporalmente como permiso agregado
- `admin`
  - `admin.view`
- `users`
  - hoy: `users.manage`
  - posible evolucion: `users.view`, `users.create`, `users.edit`, `users.disable`, `users.reset_password`
- `organization`
  - hoy: `organization.manage`

## Estado actual del proyecto
- El proyecto ya usa principalmente:
  - `view`
  - `create`
  - `edit`
  - `manage`
  - `run`
- Todavia no existen permisos canonicamente cargados para:
  - `delete`
  - `archive`
  - `restore`
  - `review`
  - `approve`
  - `assign`

## Soft Delete
- Hoy el schema **no** soporta soft delete generalizado.
- No hay campos estandar como:
  - `deletedAt`
  - `deletedBy`
  - `deleteReason`
  - `isDeleted`
- Tampoco hay un middleware o filtro central de Prisma para excluir registros "borrados".

## Matiz importante
- Existen estados de negocio como:
  - `Checklist.status = archived`
  - `Machine.status = inactive | decommissioned`
  - `Finding.status = open | in_progress | resolved | closed`
- Eso no equivale a soft delete general.
- Son ciclos de vida del dominio, no una convencion uniforme de eliminacion logica.

## Recomendacion para este producto
- Para entidades de negocio principales, preferir `archive` y `restore` antes que `delete`.
- Reservar `delete` para purga real o eliminacion irreversible.
- Si se quiere soft delete uniforme, introducir por modelo:
  - `archivedAt` / `archivedBy`
  - o `deletedAt` / `deletedBy`
- Si se adopta de forma transversal, tambien crear:
  - helper de consulta que excluya archivados por defecto
  - permiso `archive` y `restore`
  - auditoria de quien archivo o restauro

## Orden recomendado de implementacion futura
1. Definir por modulo si la baja sera `archive` o `delete`
2. Declarar el modulo u operacion en `src/lib/auth/authorization-catalog.ts`
3. Verificar que `src/types/index.ts` siga derivando los permisos canonicos desde ese catalogo
4. Persistirlos y sincronizarlos con Prisma
5. Crear helpers semanticos en `src/lib/auth/authorization.ts`
6. Conectar auditoria para operaciones destructivas o reversibles
