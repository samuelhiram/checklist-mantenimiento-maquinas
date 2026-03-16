import {
  AUTHORIZATION_PROFILE_CATALOG,
  LEGACY_ROLE_PERMISSION_PROFILE,
  getAuthorizationPermissionEntries,
  getProfileGrantPermissionIds,
} from './authorization-catalog'
import { isAppPermission, isPermissionProfileId } from '../../types'
import type {
  AppPermission,
  EffectivePermissionProfile,
  PermissionDefinition,
  PermissionProfile,
  PermissionProfileId,
  UserRole,
} from '../../types'

export { LEGACY_ROLE_PERMISSION_PROFILE } from './authorization-catalog'

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = getAuthorizationPermissionEntries().map(entry => ({
  id: entry.id as AppPermission,
  name: entry.name,
  description: entry.description,
}))

function definePermissionProfile(profile: PermissionProfile): PermissionProfile {
  return {
    ...profile,
    permissions: Array.from(new Set(profile.permissions)),
  }
}

export const PERMISSION_PROFILES: PermissionProfile[] = Object.entries(AUTHORIZATION_PROFILE_CATALOG).map(
  ([profileId, profile]) =>
    definePermissionProfile({
      id: profileId as PermissionProfileId,
      name: profile.name,
      description: profile.description,
      permissions: getProfileGrantPermissionIds(profileId as PermissionProfileId) as AppPermission[],
    })
)

const PERMISSION_PROFILE_MAP = new Map<PermissionProfileId, PermissionProfile>(
  PERMISSION_PROFILES.map(profile => [profile.id, profile])
)

export function getPermissionProfileById(profileId: PermissionProfileId): PermissionProfile {
  return PERMISSION_PROFILE_MAP.get(profileId) ?? PERMISSION_PROFILES[0]
}

export function getPermissionProfileOptions() {
  return PERMISSION_PROFILES.map(profile => ({
    id: profile.id,
    name: profile.name,
    description: profile.description,
  }))
}

export function resolvePermissionProfileIdFromRole(role: UserRole): PermissionProfileId {
  return LEGACY_ROLE_PERMISSION_PROFILE[role]
}

export function resolveLegacyRoleFromPermissionProfileId(profileId: PermissionProfileId): UserRole {
  const match = Object.entries(LEGACY_ROLE_PERMISSION_PROFILE).find(([, value]) => value === profileId)
  return (match?.[0] as UserRole | undefined) ?? 'operator'
}

export function resolvePermissionProfileFromRole(role: UserRole): PermissionProfile {
  return getPermissionProfileById(resolvePermissionProfileIdFromRole(role))
}

type EffectivePermissionProfileInput = {
  permissionProfileId?: string | null
  permissionProfileName?: string | null
  permissions?: readonly string[] | null
  role?: UserRole | null
}

export function resolveEffectivePermissionProfile({
  permissionProfileId,
  permissionProfileName,
  permissions,
  role,
}: EffectivePermissionProfileInput): EffectivePermissionProfile {
  const fallbackProfile = resolvePermissionProfileFromRole(role ?? 'operator')

  if (!permissionProfileId || !isPermissionProfileId(permissionProfileId)) {
    return {
      id: fallbackProfile.id,
      name: fallbackProfile.name,
      permissions: [...fallbackProfile.permissions],
    }
  }

  const canonicalProfile = getPermissionProfileById(permissionProfileId)
  const normalizedPermissions = (permissions ?? []).filter(isAppPermission)

  return {
    id: permissionProfileId,
    name: permissionProfileName?.trim() || canonicalProfile.name,
    permissions: normalizedPermissions.length ? [...normalizedPermissions] : [...canonicalProfile.permissions],
  }
}

export function hasPermission(
  permissions: readonly AppPermission[] | null | undefined,
  permission: AppPermission
): boolean {
  return permissions?.includes(permission) ?? false
}

export function hasAnyPermission(
  permissions: readonly AppPermission[] | null | undefined,
  requiredPermissions: readonly AppPermission[]
): boolean {
  return requiredPermissions.some(permission => hasPermission(permissions, permission))
}
