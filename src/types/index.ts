// ============================================================
// Types - MaquinaCheck
// ============================================================
// This file is the canonical domain typing entry point for the app.
// New feature work should prefer extending this file with:
// 1. domain interfaces
// 2. literal-union constants
// 3. runtime guards for untrusted strings from forms, params, or the database

export * from './system'
import {
  AUTHORIZATION_FEATURE_CATALOG,
  AUTHORIZATION_PROFILE_CATALOG,
  buildCatalogIds,
  buildPermissionIdsFromCatalog,
  type AuthorizationFeatureId,
  type AuthorizationOperationId,
} from '../lib/auth/authorization-catalog'
import type { ISODateString, JsonObject } from './system'

export type UserRole = 'operator' | 'supervisor' | 'admin'
export const PERMISSION_OPERATIONS = [
  'view',
  'create',
  'edit',
  'delete',
  'archive',
  'restore',
  'run',
  'review',
  'approve',
  'assign',
  'manage',
] as const
export type PermissionOperation = typeof PERMISSION_OPERATIONS[number]
export type AppPermission = {
  [FeatureId in AuthorizationFeatureId]: `${FeatureId}.${AuthorizationOperationId<FeatureId>}`
}[AuthorizationFeatureId]
export const APP_PERMISSIONS = buildPermissionIdsFromCatalog(AUTHORIZATION_FEATURE_CATALOG)
export type PermissionProfileId = keyof typeof AUTHORIZATION_PROFILE_CATALOG
export const PERMISSION_PROFILE_IDS = buildCatalogIds(AUTHORIZATION_PROFILE_CATALOG)
export const ORGANIZATION_PLANS = ['free', 'pro', 'enterprise'] as const
export type OrganizationPlan = typeof ORGANIZATION_PLANS[number]
export type MachineStatus = 'active' | 'inactive' | 'maintenance' | 'decommissioned'
export type ChecklistStatus = 'draft' | 'active' | 'archived'
export type ExecutionStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
export const ITEM_TYPES = ['check', 'measure', 'photo', 'text', 'number', 'select'] as const
export type ItemType = typeof ITEM_TYPES[number]
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical'
export type FrequencyType = 'manual' | 'daily' | 'weekly' | 'monthly' | 'custom'
export type FindingStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

// Runtime guards are required whenever raw strings cross into domain types.
export function isOrganizationPlan(value: string): value is OrganizationPlan {
  return ORGANIZATION_PLANS.some(plan => plan === value)
}

export function isItemType(value: string): value is ItemType {
  return ITEM_TYPES.some(itemType => itemType === value)
}

export function isAppPermission(value: string): value is AppPermission {
  return APP_PERMISSIONS.some(permission => permission === value)
}

export function isPermissionProfileId(value: string): value is PermissionProfileId {
  return PERMISSION_PROFILE_IDS.some(profileId => profileId === value)
}

export function isPermissionOperation(value: string): value is PermissionOperation {
  return PERMISSION_OPERATIONS.some(operation => operation === value)
}

export interface PermissionDefinition {
  id: AppPermission
  name: string
  description: string
}

export interface PermissionProfile {
  id: PermissionProfileId
  name: string
  description: string
  permissions: AppPermission[]
}

export interface EffectivePermissionProfile {
  id: PermissionProfileId
  name: string
  permissions: AppPermission[]
}

export interface DashboardAccess {
  view: boolean
}

export interface MachinesAccess {
  view: boolean
  create: boolean
  edit: boolean
  manage: boolean
}

export interface ChecklistsAccess {
  view: boolean
  create: boolean
  edit: boolean
  manage: boolean
}

export interface ExecutionsAccess {
  view: boolean
  run: boolean
}

export interface FindingsAccess {
  view: boolean
  manage: boolean
}

export interface AdministrationAccess {
  view: boolean
  manageUsers: boolean
  manageOrganization: boolean
  manage: boolean
}

export interface AppAccessSnapshot {
  dashboard: DashboardAccess
  machines: MachinesAccess
  checklists: ChecklistsAccess
  executions: ExecutionsAccess
  findings: FindingsAccess
  administration: AdministrationAccess
}

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string
  plan: OrganizationPlan
  settings: JsonObject
  created_at: ISODateString
  updated_at: ISODateString
}

export interface Profile {
  id: string
  org_id: string
  full_name: string
  avatar_url?: string
  role: UserRole
  department?: string
  badge_number?: string
  is_active: boolean
  last_seen_at?: ISODateString
  created_at: ISODateString
  updated_at: ISODateString
  // joined
  organization?: Organization
}

export interface AuthenticatedProfile extends Profile {
  permission_profile_id: PermissionProfileId
  permission_profile_name: string
  permissions: AppPermission[]
}

export interface AuthUiState {
  user: AuthenticatedProfile | null
  org: Organization | null
  isAuthenticated: boolean
}

export interface Location {
  id: string
  org_id: string
  name: string
  code?: string
  parent_id?: string
  description?: string
  created_at: ISODateString
  // joined
  parent?: Location
  children?: Location[]
}

export interface Machine {
  id: string
  org_id: string
  location_id?: string
  name: string
  code?: string
  type: 'machine' | 'process' | 'service' | 'equipment'
  manufacturer?: string
  model?: string
  serial_number?: string
  status: MachineStatus
  priority: PriorityLevel
  image_url?: string
  description?: string
  specs: JsonObject
  tags: string[]
  created_by?: string
  created_at: ISODateString
  updated_at: ISODateString
  // joined
  location?: Location
  checklists?: Checklist[]
  _checklist_count?: number
  _open_findings?: number
  _last_execution?: string
}

export interface Checklist {
  id: string
  org_id: string
  machine_id: string
  name: string
  description?: string
  version: number
  status: ChecklistStatus
  priority: PriorityLevel
  frequency: FrequencyType
  frequency_cron?: string
  estimated_min: number
  required_role: UserRole
  instructions?: string
  tags: string[]
  is_template: boolean
  created_by?: string
  updated_by?: string
  created_at: ISODateString
  updated_at: ISODateString
  // joined
  machine?: Machine
  items?: ChecklistItem[]
  _item_count?: number
}

export interface ChecklistItem {
  id: string
  checklist_id: string
  parent_id?: string
  position: number
  item_type: ItemType
  title: string
  description?: string
  is_required: boolean
  is_critical: boolean
  // measure fields
  unit?: string
  min_value?: number
  max_value?: number
  target_value?: number
  // select fields
  options?: string[]
  // photo
  photo_required?: boolean
  // meta
  help_text?: string
  reference_image?: string
  created_at: ISODateString
  updated_at: ISODateString
  // joined
  children?: ChecklistItem[]
}

export interface Execution {
  id: string
  org_id: string
  checklist_id: string
  machine_id: string
  assigned_to?: string
  executed_by?: string
  reviewed_by?: string
  status: ExecutionStatus
  priority: PriorityLevel
  scheduled_at?: ISODateString
  started_at?: ISODateString
  completed_at?: ISODateString
  due_at?: ISODateString
  score?: number
  notes?: string
  metadata: JsonObject
  created_at: ISODateString
  updated_at: ISODateString
  // joined
  checklist?: Checklist
  machine?: Machine
  assigned_profile?: Profile
  executed_profile?: Profile
  results?: ExecutionResult[]
}

export interface ExecutionResult {
  id: string
  execution_id: string
  item_id: string
  is_checked?: boolean
  value_text?: string
  value_number?: number
  value_select?: string
  photo_url?: string
  is_ok?: boolean
  is_na: boolean
  comment?: string
  flagged: boolean
  recorded_at: ISODateString
  recorded_by?: string
  // joined
  item?: ChecklistItem
}

export interface Finding {
  id: string
  org_id: string
  execution_id?: string
  machine_id: string
  item_id?: string
  reported_by?: string
  assigned_to?: string
  title: string
  description?: string
  severity: PriorityLevel
  status: FindingStatus
  photos: string[]
  resolved_at?: ISODateString
  resolution_note?: string
  created_at: ISODateString
  updated_at: ISODateString
  // joined
  machine?: Machine
  reporter?: Profile
}

// Dashboard stats
export interface DashboardStats {
  total_machines: number
  active_machines: number
  machines_in_maintenance: number
  total_checklists: number
  executions_today: number
  executions_completed_today: number
  executions_pending: number
  open_findings: number
  critical_findings: number
  compliance_rate: number
  recent_executions: Execution[]
  machines_by_status: Record<MachineStatus, number>
}
