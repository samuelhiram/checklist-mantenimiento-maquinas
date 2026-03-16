"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHORIZATION_REQUIREMENTS = void 0;
exports.getDashboardAccess = getDashboardAccess;
exports.getMachinesAccess = getMachinesAccess;
exports.getChecklistsAccess = getChecklistsAccess;
exports.getExecutionsAccess = getExecutionsAccess;
exports.getFindingsAccess = getFindingsAccess;
exports.getAdministrationAccess = getAdministrationAccess;
exports.getAppAccessSnapshot = getAppAccessSnapshot;
exports.canViewDashboard = canViewDashboard;
exports.canViewMachines = canViewMachines;
exports.canCreateMachines = canCreateMachines;
exports.canEditMachines = canEditMachines;
exports.canManageMachines = canManageMachines;
exports.canViewChecklists = canViewChecklists;
exports.canCreateChecklists = canCreateChecklists;
exports.canEditChecklists = canEditChecklists;
exports.canManageChecklists = canManageChecklists;
exports.canViewExecutions = canViewExecutions;
exports.canRunExecutions = canRunExecutions;
exports.canViewFindings = canViewFindings;
exports.canManageFindings = canManageFindings;
exports.canViewAdministration = canViewAdministration;
exports.canManageUsers = canManageUsers;
exports.canManageOrganization = canManageOrganization;
exports.canManageAdministration = canManageAdministration;
const authorization_catalog_1 = require("./authorization-catalog");
const permission_profiles_1 = require("./permission-profiles");
exports.AUTHORIZATION_REQUIREMENTS = {
    adminView: [(0, authorization_catalog_1.getPermissionId)('admin', 'view')],
    machineCreate: [(0, authorization_catalog_1.getPermissionId)('machines', 'create')],
    machineEdit: [(0, authorization_catalog_1.getPermissionId)('machines', 'edit')],
    checklistCreate: [(0, authorization_catalog_1.getPermissionId)('checklists', 'create')],
    checklistEdit: [(0, authorization_catalog_1.getPermissionId)('checklists', 'edit')],
    executionRun: [(0, authorization_catalog_1.getPermissionId)('executions', 'run')],
    findingsManage: [(0, authorization_catalog_1.getPermissionId)('findings', 'manage')],
    usersManage: [(0, authorization_catalog_1.getPermissionId)('users', 'manage')],
    organizationManage: [(0, authorization_catalog_1.getPermissionId)('organization', 'manage')],
};
function toPermissionList(source) {
    if (!source) {
        return [];
    }
    if ('permissions' in source) {
        return source.permissions;
    }
    return source;
}
function hasFeaturePermissionFor(source, featureId, operation) {
    return (0, permission_profiles_1.hasPermission)(toPermissionList(source), (0, authorization_catalog_1.getPermissionId)(featureId, operation));
}
function getDashboardAccess(source) {
    return {
        view: hasFeaturePermissionFor(source, 'dashboard', 'view'),
    };
}
function getMachinesAccess(source) {
    const view = hasFeaturePermissionFor(source, 'machines', 'view');
    const create = hasFeaturePermissionFor(source, 'machines', 'create');
    const edit = hasFeaturePermissionFor(source, 'machines', 'edit');
    return {
        view,
        create,
        edit,
        manage: create || edit,
    };
}
function getChecklistsAccess(source) {
    const view = hasFeaturePermissionFor(source, 'checklists', 'view');
    const create = hasFeaturePermissionFor(source, 'checklists', 'create');
    const edit = hasFeaturePermissionFor(source, 'checklists', 'edit');
    return {
        view,
        create,
        edit,
        manage: create || edit,
    };
}
function getExecutionsAccess(source) {
    return {
        view: hasFeaturePermissionFor(source, 'executions', 'view'),
        run: hasFeaturePermissionFor(source, 'executions', 'run'),
    };
}
function getFindingsAccess(source) {
    return {
        view: hasFeaturePermissionFor(source, 'findings', 'view'),
        manage: hasFeaturePermissionFor(source, 'findings', 'manage'),
    };
}
function getAdministrationAccess(source) {
    const permissions = toPermissionList(source);
    const view = hasFeaturePermissionFor(source, 'admin', 'view');
    const manageUsers = hasFeaturePermissionFor(source, 'users', 'manage');
    const manageOrganization = hasFeaturePermissionFor(source, 'organization', 'manage');
    return {
        view,
        manageUsers,
        manageOrganization,
        manage: (0, permission_profiles_1.hasAnyPermission)(permissions, [
            ...exports.AUTHORIZATION_REQUIREMENTS.adminView,
            ...exports.AUTHORIZATION_REQUIREMENTS.usersManage,
            ...exports.AUTHORIZATION_REQUIREMENTS.organizationManage,
        ]),
    };
}
function getAppAccessSnapshot(source) {
    return {
        dashboard: getDashboardAccess(source),
        machines: getMachinesAccess(source),
        checklists: getChecklistsAccess(source),
        executions: getExecutionsAccess(source),
        findings: getFindingsAccess(source),
        administration: getAdministrationAccess(source),
    };
}
function canViewDashboard(source) {
    return getDashboardAccess(source).view;
}
function canViewMachines(source) {
    return getMachinesAccess(source).view;
}
function canCreateMachines(source) {
    return getMachinesAccess(source).create;
}
function canEditMachines(source) {
    return getMachinesAccess(source).edit;
}
function canManageMachines(source) {
    return getMachinesAccess(source).manage;
}
function canViewChecklists(source) {
    return getChecklistsAccess(source).view;
}
function canCreateChecklists(source) {
    return getChecklistsAccess(source).create;
}
function canEditChecklists(source) {
    return getChecklistsAccess(source).edit;
}
function canManageChecklists(source) {
    return getChecklistsAccess(source).manage;
}
function canViewExecutions(source) {
    return getExecutionsAccess(source).view;
}
function canRunExecutions(source) {
    return getExecutionsAccess(source).run;
}
function canViewFindings(source) {
    return getFindingsAccess(source).view;
}
function canManageFindings(source) {
    return getFindingsAccess(source).manage;
}
function canViewAdministration(source) {
    return getAdministrationAccess(source).view;
}
function canManageUsers(source) {
    return getAdministrationAccess(source).manageUsers;
}
function canManageOrganization(source) {
    return getAdministrationAccess(source).manageOrganization;
}
function canManageAdministration(source) {
    return getAdministrationAccess(source).manage;
}
