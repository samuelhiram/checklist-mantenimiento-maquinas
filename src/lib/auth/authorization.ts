import type {
  AdministrationAccess,
  AppAccessSnapshot,
  AppPermission,
  AuthenticatedProfile,
  ChecklistsAccess,
  DashboardAccess,
  ExecutionsAccess,
  FindingsAccess,
  MachinesAccess,
} from '@/types'
import {
  getPermissionId,
  type AuthorizationFeatureId,
  type AuthorizationOperationId,
} from './authorization-catalog'
import { hasAnyPermission, hasPermission } from './permission-profiles'

export type PermissionSource =
  | Pick<AuthenticatedProfile, 'permissions'>
  | readonly AppPermission[]
  | null
  | undefined

export const AUTHORIZATION_REQUIREMENTS = {
  adminView: [getPermissionId('admin', 'view')] as const,
  machineCreate: [getPermissionId('machines', 'create')] as const,
  machineEdit: [getPermissionId('machines', 'edit')] as const,
  checklistCreate: [getPermissionId('checklists', 'create')] as const,
  checklistEdit: [getPermissionId('checklists', 'edit')] as const,
  executionRun: [getPermissionId('executions', 'run')] as const,
  findingsManage: [getPermissionId('findings', 'manage')] as const,
  usersManage: [getPermissionId('users', 'manage')] as const,
  organizationManage: [getPermissionId('organization', 'manage')] as const,
}

function toPermissionList(source: PermissionSource): readonly AppPermission[] {
  if (!source) {
    return []
  }

  if ('permissions' in source) {
    return source.permissions
  }

  return source
}

function hasFeaturePermissionFor<
  FeatureId extends AuthorizationFeatureId,
  OperationId extends AuthorizationOperationId<FeatureId>,
>(
  source: PermissionSource,
  featureId: FeatureId,
  operation: OperationId
): boolean {
  return hasPermission(toPermissionList(source), getPermissionId(featureId, operation) as AppPermission)
}

export function getDashboardAccess(source: PermissionSource): DashboardAccess {
  return {
    view: hasFeaturePermissionFor(source, 'dashboard', 'view'),
  }
}

export function getMachinesAccess(source: PermissionSource): MachinesAccess {
  const view = hasFeaturePermissionFor(source, 'machines', 'view')
  const create = hasFeaturePermissionFor(source, 'machines', 'create')
  const edit = hasFeaturePermissionFor(source, 'machines', 'edit')

  return {
    view,
    create,
    edit,
    manage: create || edit,
  }
}

export function getChecklistsAccess(source: PermissionSource): ChecklistsAccess {
  const view = hasFeaturePermissionFor(source, 'checklists', 'view')
  const create = hasFeaturePermissionFor(source, 'checklists', 'create')
  const edit = hasFeaturePermissionFor(source, 'checklists', 'edit')

  return {
    view,
    create,
    edit,
    manage: create || edit,
  }
}

export function getExecutionsAccess(source: PermissionSource): ExecutionsAccess {
  return {
    view: hasFeaturePermissionFor(source, 'executions', 'view'),
    run: hasFeaturePermissionFor(source, 'executions', 'run'),
  }
}

export function getFindingsAccess(source: PermissionSource): FindingsAccess {
  return {
    view: hasFeaturePermissionFor(source, 'findings', 'view'),
    manage: hasFeaturePermissionFor(source, 'findings', 'manage'),
  }
}

export function getAdministrationAccess(source: PermissionSource): AdministrationAccess {
  const permissions = toPermissionList(source)
  const view = hasFeaturePermissionFor(source, 'admin', 'view')
  const manageUsers = hasFeaturePermissionFor(source, 'users', 'manage')
  const manageOrganization = hasFeaturePermissionFor(source, 'organization', 'manage')

  return {
    view,
    manageUsers,
    manageOrganization,
    manage: hasAnyPermission(permissions, [
      ...AUTHORIZATION_REQUIREMENTS.adminView,
      ...AUTHORIZATION_REQUIREMENTS.usersManage,
      ...AUTHORIZATION_REQUIREMENTS.organizationManage,
    ]),
  }
}

export function getAppAccessSnapshot(source: PermissionSource): AppAccessSnapshot {
  return {
    dashboard: getDashboardAccess(source),
    machines: getMachinesAccess(source),
    checklists: getChecklistsAccess(source),
    executions: getExecutionsAccess(source),
    findings: getFindingsAccess(source),
    administration: getAdministrationAccess(source),
  }
}

export function canViewDashboard(source: PermissionSource): boolean {
  return getDashboardAccess(source).view
}

export function canViewMachines(source: PermissionSource): boolean {
  return getMachinesAccess(source).view
}

export function canCreateMachines(source: PermissionSource): boolean {
  return getMachinesAccess(source).create
}

export function canEditMachines(source: PermissionSource): boolean {
  return getMachinesAccess(source).edit
}

export function canManageMachines(source: PermissionSource): boolean {
  return getMachinesAccess(source).manage
}

export function canViewChecklists(source: PermissionSource): boolean {
  return getChecklistsAccess(source).view
}

export function canCreateChecklists(source: PermissionSource): boolean {
  return getChecklistsAccess(source).create
}

export function canEditChecklists(source: PermissionSource): boolean {
  return getChecklistsAccess(source).edit
}

export function canManageChecklists(source: PermissionSource): boolean {
  return getChecklistsAccess(source).manage
}

export function canViewExecutions(source: PermissionSource): boolean {
  return getExecutionsAccess(source).view
}

export function canRunExecutions(source: PermissionSource): boolean {
  return getExecutionsAccess(source).run
}

export function canViewFindings(source: PermissionSource): boolean {
  return getFindingsAccess(source).view
}

export function canManageFindings(source: PermissionSource): boolean {
  return getFindingsAccess(source).manage
}

export function canViewAdministration(source: PermissionSource): boolean {
  return getAdministrationAccess(source).view
}

export function canManageUsers(source: PermissionSource): boolean {
  return getAdministrationAccess(source).manageUsers
}

export function canManageOrganization(source: PermissionSource): boolean {
  return getAdministrationAccess(source).manageOrganization
}

export function canManageAdministration(source: PermissionSource): boolean {
  return getAdministrationAccess(source).manage
}
