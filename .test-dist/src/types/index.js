"use strict";
// ============================================================
// Types - MaquinaCheck
// ============================================================
// This file is the canonical domain typing entry point for the app.
// New feature work should prefer extending this file with:
// 1. domain interfaces
// 2. literal-union constants
// 3. runtime guards for untrusted strings from forms, params, or the database
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITEM_TYPES = exports.ORGANIZATION_PLANS = exports.PERMISSION_PROFILE_IDS = exports.APP_PERMISSIONS = exports.PERMISSION_OPERATIONS = void 0;
exports.isOrganizationPlan = isOrganizationPlan;
exports.isItemType = isItemType;
exports.isAppPermission = isAppPermission;
exports.isPermissionProfileId = isPermissionProfileId;
exports.isPermissionOperation = isPermissionOperation;
__exportStar(require("./system"), exports);
const authorization_catalog_1 = require("../lib/auth/authorization-catalog");
exports.PERMISSION_OPERATIONS = [
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
];
exports.APP_PERMISSIONS = (0, authorization_catalog_1.buildPermissionIdsFromCatalog)(authorization_catalog_1.AUTHORIZATION_FEATURE_CATALOG);
exports.PERMISSION_PROFILE_IDS = (0, authorization_catalog_1.buildCatalogIds)(authorization_catalog_1.AUTHORIZATION_PROFILE_CATALOG);
exports.ORGANIZATION_PLANS = ['free', 'pro', 'enterprise'];
exports.ITEM_TYPES = ['check', 'measure', 'photo', 'text', 'number', 'select'];
// Runtime guards are required whenever raw strings cross into domain types.
function isOrganizationPlan(value) {
    return exports.ORGANIZATION_PLANS.some(plan => plan === value);
}
function isItemType(value) {
    return exports.ITEM_TYPES.some(itemType => itemType === value);
}
function isAppPermission(value) {
    return exports.APP_PERMISSIONS.some(permission => permission === value);
}
function isPermissionProfileId(value) {
    return exports.PERMISSION_PROFILE_IDS.some(profileId => profileId === value);
}
function isPermissionOperation(value) {
    return exports.PERMISSION_OPERATIONS.some(operation => operation === value);
}
