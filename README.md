# Máquinas Checklist App

Aplicación de gestión de checklists para mantenimiento de máquinas y equipos.

## Quick Start

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Configurar entorno:**
    Copia `.env.local.example` a `.env.local` y configura las variables necesarias (Supabase/PostgreSQL).

3.  **Sincronizar base de datos y autorizaciones:**
    ```bash
    npx prisma migrate dev
    npm run prisma:sync-authz
    ```

4.  **Iniciar en desarrollo:**
    ```bash
    npm run dev
    ```

## Scripts de Verificación

Para mantener la calidad del código, utiliza los siguientes comandos:

-   `npm run verify`: Ejecuta lint, typecheck y pruebas unitarias (en paralelo).
-   `npm run lint`: Ejecuta el linter (ESLint) con reglas personalizadas del proyecto.
-   `npm run typecheck`: Valida los tipos de TypeScript utilizando `tsconfig.typecheck.json`.
-   `npm run test:ui`: Ejecuta las pruebas de integración de la interfaz y navegación.

## Arquitectura

El proyecto sigue una arquitectura modular basada en `features`:

-   `src/app`: Entrypoints de Next.js (App Router). Las páginas son "thin" y delegan en screens.
-   `src/features`: Lógica de negocio y UI organizada por dominio (checklists, machines, etc.).
-   `src/components`: Componentes UI compartidos y primitivos.
-   `src/lib`: Infraestructura (Prisma, Auth, normalización de datos).
-   `src/types`: Definiciones de tipos del sistema y del dominio.

Para más detalles, consulta la carpeta `docs/`.
