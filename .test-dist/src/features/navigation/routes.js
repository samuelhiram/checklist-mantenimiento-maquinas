"use strict";
// Canonical front route contract for the app.
// Rule: route strings should be declared here first and consumed through helpers.
Object.defineProperty(exports, "__esModule", { value: true });
exports.INDEXABLE_ROUTE_PATHS = exports.PAGE_ROUTE_TEMPLATES = exports.ROUTE_PATHS = void 0;
exports.ROUTE_PATHS = {
    auth: {
        login: '/',
        dashboard: '/dashboard',
    },
    machines: {
        list: '/machines',
        create: '/machines/new',
        detail: (machineId) => `/machines/${machineId}`,
        edit: (machineId) => `/machines/${machineId}/edit`,
    },
    checklists: {
        list: '/checklists',
        create: '/checklists/new',
        createForMachine: (machineId) => `/checklists/new?machine=${machineId}`,
        edit: (checklistId) => `/checklists/${checklistId}/edit`,
    },
    executions: {
        list: '/executions',
        listForMachine: (machineId) => `/executions?machine=${machineId}`,
        create: '/executions/new',
        createForChecklist: (checklistId) => `/executions/new?checklist=${checklistId}`,
        detail: (executionId) => `/executions/${executionId}`,
    },
    findings: {
        list: '/findings',
        detail: (findingId) => `/findings/${findingId}`,
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
};
// Filesystem-backed page routes. Keep this aligned with src/app so tests can detect drift.
exports.PAGE_ROUTE_TEMPLATES = {
    auth: {
        login: exports.ROUTE_PATHS.auth.login,
        dashboard: exports.ROUTE_PATHS.auth.dashboard,
    },
    machines: {
        list: exports.ROUTE_PATHS.machines.list,
        create: exports.ROUTE_PATHS.machines.create,
        detail: '/machines/[id]',
        edit: '/machines/[id]/edit',
    },
    checklists: {
        list: exports.ROUTE_PATHS.checklists.list,
        create: exports.ROUTE_PATHS.checklists.create,
        edit: '/checklists/[id]/edit',
    },
    executions: {
        list: exports.ROUTE_PATHS.executions.list,
        create: exports.ROUTE_PATHS.executions.create,
        detail: '/executions/[id]',
    },
    findings: {
        list: exports.ROUTE_PATHS.findings.list,
        detail: '/findings/[id]',
    },
    admin: {
        index: exports.ROUTE_PATHS.admin.index,
    },
    dev: {
        login: exports.ROUTE_PATHS.dev.login,
        authAdmin: exports.ROUTE_PATHS.dev.authAdmin,
    },
};
exports.INDEXABLE_ROUTE_PATHS = {
    dashboard: exports.ROUTE_PATHS.auth.dashboard,
    machines: exports.ROUTE_PATHS.machines.list,
    checklists: exports.ROUTE_PATHS.checklists.list,
    executions: exports.ROUTE_PATHS.executions.list,
    findings: exports.ROUTE_PATHS.findings.list,
    admin: exports.ROUTE_PATHS.admin.index,
};
