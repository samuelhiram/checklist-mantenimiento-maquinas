import { AUTHORIZATION_REQUIREMENTS } from './authorization'
import { requireAnyPermission, requirePermission } from './session'

export async function requireAdminViewAccess() {
  return requireAnyPermission([...AUTHORIZATION_REQUIREMENTS.adminView])
}

export async function requireMachineCreateAccess() {
  return requirePermission(AUTHORIZATION_REQUIREMENTS.machineCreate[0])
}

export async function requireMachineEditAccess() {
  return requirePermission(AUTHORIZATION_REQUIREMENTS.machineEdit[0])
}

export async function requireChecklistCreateAccess() {
  return requirePermission(AUTHORIZATION_REQUIREMENTS.checklistCreate[0])
}
