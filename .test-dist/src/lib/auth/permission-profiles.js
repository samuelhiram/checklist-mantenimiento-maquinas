"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_PROFILES = exports.PERMISSION_DEFINITIONS = exports.LEGACY_ROLE_PERMISSION_PROFILE = void 0;
exports.getPermissionProfileById = getPermissionProfileById;
exports.getPermissionProfileOptions = getPermissionProfileOptions;
exports.resolvePermissionProfileIdFromRole = resolvePermissionProfileIdFromRole;
exports.resolveLegacyRoleFromPermissionProfileId = resolveLegacyRoleFromPermissionProfileId;
exports.resolvePermissionProfileFromRole = resolvePermissionProfileFromRole;
exports.resolveEffectivePermissionProfile = resolveEffectivePermissionProfile;
exports.hasPermission = hasPermission;
exports.hasAnyPermission = hasAnyPermission;
const authorization_catalog_1 = require("./authorization-catalog");
const types_1 = require("../../types");
var authorization_catalog_2 = require("./authorization-catalog");
Object.defineProperty(exports, "LEGACY_ROLE_PERMISSION_PROFILE", { enumerable: true, get: function () { return authorization_catalog_2.LEGACY_ROLE_PERMISSION_PROFILE; } });
exports.PERMISSION_DEFINITIONS = (0, authorization_catalog_1.getAuthorizationPermissionEntries)().map(entry => ({
    id: entry.id,
    name: entry.name,
    description: entry.description,
}));
function definePermissionProfile(profile) {
    return {
        ...profile,
        permissions: Array.from(new Set(profile.permissions)),
    };
}
exports.PERMISSION_PROFILES = Object.entries(authorization_catalog_1.AUTHORIZATION_PROFILE_CATALOG).map(([profileId, profile]) => definePermissionProfile({
    id: profileId,
    name: profile.name,
    description: profile.description,
    permissions: (0, authorization_catalog_1.getProfileGrantPermissionIds)(profileId),
}));
const PERMISSION_PROFILE_MAP = new Map(exports.PERMISSION_PROFILES.map(profile => [profile.id, profile]));
function getPermissionProfileById(profileId) {
    return PERMISSION_PROFILE_MAP.get(profileId) ?? exports.PERMISSION_PROFILES[0];
}
function getPermissionProfileOptions() {
    return exports.PERMISSION_PROFILES.map(profile => ({
        id: profile.id,
        name: profile.name,
        description: profile.description,
    }));
}
function resolvePermissionProfileIdFromRole(role) {
    return authorization_catalog_1.LEGACY_ROLE_PERMISSION_PROFILE[role];
}
function resolveLegacyRoleFromPermissionProfileId(profileId) {
    const match = Object.entries(authorization_catalog_1.LEGACY_ROLE_PERMISSION_PROFILE).find(([, value]) => value === profileId);
    return match?.[0] ?? 'operator';
}
function resolvePermissionProfileFromRole(role) {
    return getPermissionProfileById(resolvePermissionProfileIdFromRole(role));
}
function resolveEffectivePermissionProfile({ permissionProfileId, permissionProfileName, permissions, role, }) {
    const fallbackProfile = resolvePermissionProfileFromRole(role ?? 'operator');
    if (!permissionProfileId || !(0, types_1.isPermissionProfileId)(permissionProfileId)) {
        return {
            id: fallbackProfile.id,
            name: fallbackProfile.name,
            permissions: [...fallbackProfile.permissions],
        };
    }
    const canonicalProfile = getPermissionProfileById(permissionProfileId);
    const normalizedPermissions = (permissions ?? []).filter(types_1.isAppPermission);
    return {
        id: permissionProfileId,
        name: permissionProfileName?.trim() || canonicalProfile.name,
        permissions: normalizedPermissions.length ? [...normalizedPermissions] : [...canonicalProfile.permissions],
    };
}
function hasPermission(permissions, permission) {
    return permissions?.includes(permission) ?? false;
}
function hasAnyPermission(permissions, requiredPermissions) {
    return requiredPermissions.some(permission => hasPermission(permissions, permission));
}
