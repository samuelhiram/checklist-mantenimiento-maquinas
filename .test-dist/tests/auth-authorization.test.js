"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const types_1 = require("../src/types");
const authorization_1 = require("../src/lib/auth/authorization");
const permission_profiles_1 = require("../src/lib/auth/permission-profiles");
(0, node_test_1.default)('operator profile keeps only operational access', () => {
    const operator = (0, permission_profiles_1.resolvePermissionProfileFromRole)('operator');
    strict_1.default.equal((0, authorization_1.canViewDashboard)(operator.permissions), true);
    strict_1.default.equal((0, authorization_1.canViewMachines)(operator.permissions), true);
    strict_1.default.equal((0, authorization_1.canViewChecklists)(operator.permissions), true);
    strict_1.default.equal((0, authorization_1.canViewExecutions)(operator.permissions), true);
    strict_1.default.equal((0, authorization_1.canViewFindings)(operator.permissions), true);
    strict_1.default.equal((0, authorization_1.canRunExecutions)(operator.permissions), true);
    strict_1.default.equal((0, authorization_1.canCreateMachines)(operator.permissions), false);
    strict_1.default.equal((0, authorization_1.canEditMachines)(operator.permissions), false);
    strict_1.default.equal((0, authorization_1.canCreateChecklists)(operator.permissions), false);
    strict_1.default.equal((0, authorization_1.canEditChecklists)(operator.permissions), false);
    strict_1.default.equal((0, authorization_1.canManageFindings)(operator.permissions), false);
    strict_1.default.equal((0, authorization_1.canViewAdministration)(operator.permissions), false);
    strict_1.default.equal((0, authorization_1.canManageAdministration)(operator.permissions), false);
});
(0, node_test_1.default)('supervisor profile keeps operational management without admin access', () => {
    const supervisor = (0, permission_profiles_1.resolvePermissionProfileFromRole)('supervisor');
    strict_1.default.equal((0, authorization_1.canManageMachines)(supervisor.permissions), true);
    strict_1.default.equal((0, authorization_1.canCreateMachines)(supervisor.permissions), true);
    strict_1.default.equal((0, authorization_1.canEditMachines)(supervisor.permissions), true);
    strict_1.default.equal((0, authorization_1.canCreateChecklists)(supervisor.permissions), true);
    strict_1.default.equal((0, authorization_1.canEditChecklists)(supervisor.permissions), true);
    strict_1.default.equal((0, authorization_1.canManageFindings)(supervisor.permissions), true);
    strict_1.default.equal((0, authorization_1.canViewAdministration)(supervisor.permissions), false);
    strict_1.default.equal((0, authorization_1.canManageAdministration)(supervisor.permissions), false);
});
(0, node_test_1.default)('admin profile keeps full administrative access', () => {
    const admin = (0, permission_profiles_1.resolvePermissionProfileFromRole)('admin');
    strict_1.default.equal((0, authorization_1.canViewAdministration)(admin.permissions), true);
    strict_1.default.equal((0, authorization_1.canManageAdministration)(admin.permissions), true);
    strict_1.default.equal((0, authorization_1.canCreateMachines)(admin.permissions), true);
    strict_1.default.equal((0, authorization_1.canEditChecklists)(admin.permissions), true);
    strict_1.default.equal((0, authorization_1.canManageFindings)(admin.permissions), true);
});
(0, node_test_1.default)('app access snapshot groups front capabilities by feature', () => {
    const supervisor = (0, permission_profiles_1.resolvePermissionProfileFromRole)('supervisor');
    const access = (0, authorization_1.getAppAccessSnapshot)(supervisor.permissions);
    strict_1.default.equal(access.dashboard.view, true);
    strict_1.default.equal(access.machines.view, true);
    strict_1.default.equal(access.machines.create, true);
    strict_1.default.equal(access.machines.edit, true);
    strict_1.default.equal(access.machines.manage, true);
    strict_1.default.equal(access.checklists.create, true);
    strict_1.default.equal(access.executions.run, true);
    strict_1.default.equal(access.findings.manage, true);
    strict_1.default.equal(access.administration.view, false);
});
(0, node_test_1.default)('effective permission profile falls back to the legacy role when persisted profile is missing', () => {
    const resolved = (0, permission_profiles_1.resolveEffectivePermissionProfile)({
        permissionProfileId: null,
        permissionProfileName: null,
        permissions: null,
        role: 'supervisor',
    });
    strict_1.default.equal(resolved.id, 'supervisor_operations');
    strict_1.default.equal(resolved.name, 'Supervisor de operaciones');
    strict_1.default.equal((0, authorization_1.canCreateMachines)(resolved.permissions), true);
    strict_1.default.equal((0, authorization_1.canViewAdministration)(resolved.permissions), false);
});
(0, node_test_1.default)('effective permission profile keeps persisted id and name while falling back to canonical permissions', () => {
    const resolved = (0, permission_profiles_1.resolveEffectivePermissionProfile)({
        permissionProfileId: 'admin_system',
        permissionProfileName: 'Admin personalizado',
        permissions: [],
        role: 'operator',
    });
    strict_1.default.equal(resolved.id, 'admin_system');
    strict_1.default.equal(resolved.name, 'Admin personalizado');
    strict_1.default.equal((0, authorization_1.canManageAdministration)(resolved.permissions), true);
});
(0, node_test_1.default)('effective permission profile filters invalid persisted permissions', () => {
    const resolved = (0, permission_profiles_1.resolveEffectivePermissionProfile)({
        permissionProfileId: 'operator_basic',
        permissionProfileName: 'Operador base',
        permissions: ['machines.view', 'not-a-real-permission'],
        role: 'admin',
    });
    strict_1.default.deepEqual(resolved.permissions, ['machines.view']);
    strict_1.default.equal((0, authorization_1.canViewMachines)(resolved.permissions), true);
    strict_1.default.equal((0, authorization_1.canRunExecutions)(resolved.permissions), false);
});
(0, node_test_1.default)('permission catalog stays aligned across exported ids, definitions, and profiles', () => {
    const permissionIds = [...types_1.APP_PERMISSIONS].sort();
    const definitionIds = permission_profiles_1.PERMISSION_DEFINITIONS.map(permission => permission.id).sort();
    strict_1.default.deepEqual(definitionIds, permissionIds);
    for (const profile of permission_profiles_1.PERMISSION_PROFILES) {
        for (const permission of profile.permissions) {
            strict_1.default.equal(types_1.APP_PERMISSIONS.includes(permission), true);
        }
    }
});
