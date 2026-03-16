// Used by routes: mock-backed screens that still need a stable data access boundary.
// Purpose: keep demo data consumption behind explicit query helpers instead of a global catch-all file.

import type {
  Checklist,
  ChecklistItem,
  DashboardStats,
  Execution,
  Finding,
  Location,
  Machine,
  Organization,
  Profile,
} from '@/types'
import {
  MOCK_CHECKLIST_ITEMS,
  MOCK_CHECKLISTS,
  MOCK_DASHBOARD_STATS,
  MOCK_EXECUTIONS,
  MOCK_FINDINGS,
  MOCK_LOCATIONS,
  MOCK_MACHINES,
  MOCK_ORG,
  MOCK_PROFILES,
} from './data'

export function getDemoOrganization(): Organization {
  return MOCK_ORG
}

export function listDemoLocations(): readonly Location[] {
  return MOCK_LOCATIONS
}

export function listDemoProfiles(): readonly Profile[] {
  return MOCK_PROFILES
}

export function getDemoProfileById(profileId: string): Profile | undefined {
  return MOCK_PROFILES.find(profile => profile.id === profileId)
}

export function listDemoMachines(): readonly Machine[] {
  return MOCK_MACHINES
}

export function getDemoMachineById(machineId: string): Machine | undefined {
  return MOCK_MACHINES.find(machine => machine.id === machineId)
}

export function listDemoChecklists(): readonly Checklist[] {
  return MOCK_CHECKLISTS
}

export function getDemoChecklistById(checklistId: string): Checklist | undefined {
  return MOCK_CHECKLISTS.find(checklist => checklist.id === checklistId)
}

export function listDemoChecklistsByMachine(machineId: string): readonly Checklist[] {
  return MOCK_CHECKLISTS.filter(checklist => checklist.machine_id === machineId)
}

export function listDemoChecklistItems(checklistId: string): readonly ChecklistItem[] {
  return MOCK_CHECKLIST_ITEMS[checklistId] ?? []
}

export function listDemoExecutions(): readonly Execution[] {
  return MOCK_EXECUTIONS
}

export function getDemoExecutionById(executionId: string): Execution | undefined {
  return MOCK_EXECUTIONS.find(execution => execution.id === executionId)
}

export function listDemoExecutionsByMachine(machineId: string): readonly Execution[] {
  return MOCK_EXECUTIONS.filter(execution => execution.machine_id === machineId)
}

export function listDemoFindings(): readonly Finding[] {
  return MOCK_FINDINGS
}

export function getDemoFindingById(findingId: string): Finding | undefined {
  return MOCK_FINDINGS.find(finding => finding.id === findingId)
}

export function listDemoFindingsByMachine(machineId: string): readonly Finding[] {
  return MOCK_FINDINGS.filter(finding => finding.machine_id === machineId)
}

export function getDemoDashboardStats(): DashboardStats {
  return MOCK_DASHBOARD_STATS
}
