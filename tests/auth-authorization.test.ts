import test from 'node:test'
import assert from 'node:assert/strict'
import { APP_PERMISSIONS } from '../src/types'
import {
  canCreateChecklists,
  canCreateMachines,
  canEditChecklists,
  canEditMachines,
  getAppAccessSnapshot,
  canManageAdministration,
  canManageFindings,
  canManageMachines,
  canRunExecutions,
  canViewAdministration,
  canViewChecklists,
  canViewDashboard,
  canViewExecutions,
  canViewFindings,
  canViewMachines,
} from '../src/lib/auth/authorization'
import {
  PERMISSION_DEFINITIONS,
  PERMISSION_PROFILES,
  resolveEffectivePermissionProfile,
  resolvePermissionProfileFromRole,
} from '../src/lib/auth/permission-profiles'

test('operator profile keeps only operational access', () => {
  const operator = resolvePermissionProfileFromRole('operator')

  assert.equal(canViewDashboard(operator.permissions), true)
  assert.equal(canViewMachines(operator.permissions), true)
  assert.equal(canViewChecklists(operator.permissions), true)
  assert.equal(canViewExecutions(operator.permissions), true)
  assert.equal(canViewFindings(operator.permissions), true)
  assert.equal(canRunExecutions(operator.permissions), true)
  assert.equal(canCreateMachines(operator.permissions), false)
  assert.equal(canEditMachines(operator.permissions), false)
  assert.equal(canCreateChecklists(operator.permissions), false)
  assert.equal(canEditChecklists(operator.permissions), false)
  assert.equal(canManageFindings(operator.permissions), false)
  assert.equal(canViewAdministration(operator.permissions), false)
  assert.equal(canManageAdministration(operator.permissions), false)
})

test('supervisor profile keeps operational management without admin access', () => {
  const supervisor = resolvePermissionProfileFromRole('supervisor')

  assert.equal(canManageMachines(supervisor.permissions), true)
  assert.equal(canCreateMachines(supervisor.permissions), true)
  assert.equal(canEditMachines(supervisor.permissions), true)
  assert.equal(canCreateChecklists(supervisor.permissions), true)
  assert.equal(canEditChecklists(supervisor.permissions), true)
  assert.equal(canManageFindings(supervisor.permissions), true)
  assert.equal(canViewAdministration(supervisor.permissions), false)
  assert.equal(canManageAdministration(supervisor.permissions), false)
})

test('admin profile keeps full administrative access', () => {
  const admin = resolvePermissionProfileFromRole('admin')

  assert.equal(canViewAdministration(admin.permissions), true)
  assert.equal(canManageAdministration(admin.permissions), true)
  assert.equal(canCreateMachines(admin.permissions), true)
  assert.equal(canEditChecklists(admin.permissions), true)
  assert.equal(canManageFindings(admin.permissions), true)
})

test('app access snapshot groups front capabilities by feature', () => {
  const supervisor = resolvePermissionProfileFromRole('supervisor')
  const access = getAppAccessSnapshot(supervisor.permissions)

  assert.equal(access.dashboard.view, true)
  assert.equal(access.machines.view, true)
  assert.equal(access.machines.create, true)
  assert.equal(access.machines.edit, true)
  assert.equal(access.machines.manage, true)
  assert.equal(access.checklists.create, true)
  assert.equal(access.executions.run, true)
  assert.equal(access.findings.manage, true)
  assert.equal(access.administration.view, false)
})

test('effective permission profile falls back to the legacy role when persisted profile is missing', () => {
  const resolved = resolveEffectivePermissionProfile({
    permissionProfileId: null,
    permissionProfileName: null,
    permissions: null,
    role: 'supervisor',
  })

  assert.equal(resolved.id, 'supervisor_operations')
  assert.equal(resolved.name, 'Supervisor de operaciones')
  assert.equal(canCreateMachines(resolved.permissions), true)
  assert.equal(canViewAdministration(resolved.permissions), false)
})

test('effective permission profile keeps persisted id and name while falling back to canonical permissions', () => {
  const resolved = resolveEffectivePermissionProfile({
    permissionProfileId: 'admin_system',
    permissionProfileName: 'Admin personalizado',
    permissions: [],
    role: 'operator',
  })

  assert.equal(resolved.id, 'admin_system')
  assert.equal(resolved.name, 'Admin personalizado')
  assert.equal(canManageAdministration(resolved.permissions), true)
})

test('effective permission profile filters invalid persisted permissions', () => {
  const resolved = resolveEffectivePermissionProfile({
    permissionProfileId: 'operator_basic',
    permissionProfileName: 'Operador base',
    permissions: ['machines.view', 'not-a-real-permission'],
    role: 'admin',
  })

  assert.deepEqual(resolved.permissions, ['machines.view'])
  assert.equal(canViewMachines(resolved.permissions), true)
  assert.equal(canRunExecutions(resolved.permissions), false)
})

test('permission catalog stays aligned across exported ids, definitions, and profiles', () => {
  const permissionIds = [...APP_PERMISSIONS].sort()
  const definitionIds = PERMISSION_DEFINITIONS.map(permission => permission.id).sort()

  assert.deepEqual(definitionIds, permissionIds)

  for (const profile of PERMISSION_PROFILES) {
    for (const permission of profile.permissions) {
      assert.equal(APP_PERMISSIONS.includes(permission), true)
    }
  }
})
