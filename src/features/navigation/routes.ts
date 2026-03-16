// Canonical front route contract for the app.
// Rule: route strings should be declared here first and consumed through helpers.

export const ROUTE_PATHS = {
  auth: {
    login: '/',
    dashboard: '/dashboard',
  },
  machines: {
    list: '/machines',
    create: '/machines/new',
    detail: (machineId: string) => `/machines/${machineId}`,
    edit: (machineId: string) => `/machines/${machineId}/edit`,
  },
  checklists: {
    list: '/checklists',
    create: '/checklists/new',
    createForMachine: (machineId: string) => `/checklists/new?machine=${machineId}`,
    edit: (checklistId: string) => `/checklists/${checklistId}/edit`,
  },
  executions: {
    list: '/executions',
    listForMachine: (machineId: string) => `/executions?machine=${machineId}`,
    create: '/executions/new',
    createForChecklist: (checklistId: string) => `/executions/new?checklist=${checklistId}`,
    detail: (executionId: string) => `/executions/${executionId}`,
  },
  findings: {
    list: '/findings',
    detail: (findingId: string) => `/findings/${findingId}`,
  },
  admin: {
    index: '/admin',
  },
  dev: {
    login: '/dev/login',
    authAdmin: '/dev/auth-admin',
  },
  api: {
    authLogin: '/api/auth/login',
    authLogout: '/api/auth/logout',
    authSession: '/api/auth/session',
    devAuthLogin: '/api/dev-auth/login',
    devAuthLogout: '/api/dev-auth/logout',
  },
} as const

// Filesystem-backed page routes. Keep this aligned with src/app so tests can detect drift.
export const PAGE_ROUTE_TEMPLATES = {
  auth: {
    login: ROUTE_PATHS.auth.login,
    dashboard: ROUTE_PATHS.auth.dashboard,
  },
  machines: {
    list: ROUTE_PATHS.machines.list,
    create: ROUTE_PATHS.machines.create,
    detail: '/machines/[id]',
    edit: '/machines/[id]/edit',
  },
  checklists: {
    list: ROUTE_PATHS.checklists.list,
    create: ROUTE_PATHS.checklists.create,
    edit: '/checklists/[id]/edit',
  },
  executions: {
    list: ROUTE_PATHS.executions.list,
    create: ROUTE_PATHS.executions.create,
    detail: '/executions/[id]',
  },
  findings: {
    list: ROUTE_PATHS.findings.list,
    detail: '/findings/[id]',
  },
  admin: {
    index: ROUTE_PATHS.admin.index,
  },
  dev: {
    login: ROUTE_PATHS.dev.login,
    authAdmin: ROUTE_PATHS.dev.authAdmin,
  },
} as const

export const INDEXABLE_ROUTE_PATHS = {
  dashboard: ROUTE_PATHS.auth.dashboard,
  machines: ROUTE_PATHS.machines.list,
  checklists: ROUTE_PATHS.checklists.list,
  executions: ROUTE_PATHS.executions.list,
  findings: ROUTE_PATHS.findings.list,
  admin: ROUTE_PATHS.admin.index,
} as const

export type IndexableRouteKey = keyof typeof INDEXABLE_ROUTE_PATHS
export type IndexableRoutePath = (typeof INDEXABLE_ROUTE_PATHS)[IndexableRouteKey]
