"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const permission_profiles_1 = require("../src/lib/auth/permission-profiles");
const href_state_1 = require("../src/features/navigation/href-state");
const path_matching_1 = require("../src/features/navigation/path-matching");
const routes_1 = require("../src/features/navigation/routes");
const views_1 = require("../src/features/navigation/views");
function flattenRouteTemplates(input) {
    return Object.values(input).flatMap(value => {
        if (typeof value === 'string') {
            return value;
        }
        return flattenRouteTemplates(value);
    });
}
function collectFilesystemPageRoutes(appDir, routePrefix = '') {
    const routes = [];
    const pageFile = node_path_1.default.join(appDir, 'page.tsx');
    if (node_fs_1.default.existsSync(pageFile)) {
        routes.push(routePrefix || '/');
    }
    for (const entry of node_fs_1.default.readdirSync(appDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
            continue;
        }
        const routeSegment = isRouteGroupDirectory(entry.name) ? '' : entry.name;
        const childPrefix = routeSegment ? `${routePrefix}/${routeSegment}`.replace('//', '/') : routePrefix;
        routes.push(...collectFilesystemPageRoutes(node_path_1.default.join(appDir, entry.name), childPrefix));
    }
    return routes;
}
function isRouteGroupDirectory(entryName) {
    return (entryName.startsWith('(') && entryName.endsWith(')')) || entryName.startsWith('@');
}
function collectFilesystemPageFiles(appDir) {
    const pageFiles = [];
    const pageFile = node_path_1.default.join(appDir, 'page.tsx');
    if (node_fs_1.default.existsSync(pageFile)) {
        pageFiles.push(pageFile);
    }
    for (const entry of node_fs_1.default.readdirSync(appDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
            continue;
        }
        pageFiles.push(...collectFilesystemPageFiles(node_path_1.default.join(appDir, entry.name)));
    }
    return pageFiles;
}
(0, node_test_1.default)('app view registry keeps unique ids and hrefs', () => {
    const ids = new Set(views_1.APP_VIEWS.map(view => view.id));
    const hrefs = new Set(views_1.APP_VIEWS.map(view => view.href));
    strict_1.default.equal(ids.size, views_1.APP_VIEWS.length);
    strict_1.default.equal(hrefs.size, views_1.APP_VIEWS.length);
    for (const view of views_1.APP_VIEWS) {
        strict_1.default.ok(view.label.length > 0);
        strict_1.default.ok(view.description.length > 0);
        strict_1.default.ok(view.href.startsWith('/'));
        strict_1.default.ok(view.requiredPermission.length > 0);
    }
});
(0, node_test_1.default)('page route templates stay aligned with the filesystem', () => {
    const appDir = node_path_1.default.resolve(__dirname, '..', '..', 'src', 'app');
    const declaredRoutes = flattenRouteTemplates(routes_1.PAGE_ROUTE_TEMPLATES).sort();
    const filesystemRoutes = collectFilesystemPageRoutes(appDir).sort();
    strict_1.default.deepEqual(declaredRoutes, filesystemRoutes);
});
(0, node_test_1.default)('route entrypoints stay thin and delegate to feature screens', () => {
    const appDir = node_path_1.default.resolve(__dirname, '..', '..', 'src', 'app');
    const allowedInlinePages = new Set([node_path_1.default.join(appDir, 'dev', 'auth-admin', 'page.tsx')]);
    const pageFiles = collectFilesystemPageFiles(appDir);
    for (const pageFile of pageFiles) {
        if (allowedInlinePages.has(pageFile)) {
            continue;
        }
        const source = node_fs_1.default.readFileSync(pageFile, 'utf8');
        strict_1.default.match(source, /from ['"]@\/features\/.+\/screens\/.+['"]/, `${node_path_1.default.relative(appDir, pageFile)} should import a feature screen`);
        strict_1.default.ok(!source.includes("'use client'") && !source.includes('"use client"'), `${node_path_1.default.relative(appDir, pageFile)} should stay server-side and thin`);
    }
});
(0, node_test_1.default)('app view registry stays aligned with canonical indexable routes', () => {
    const registeredIds = views_1.APP_VIEWS.map(view => view.id).sort();
    const canonicalIds = Object.keys(routes_1.INDEXABLE_ROUTE_PATHS).sort();
    strict_1.default.deepEqual(registeredIds, canonicalIds);
    for (const view of views_1.APP_VIEWS) {
        strict_1.default.equal(view.href, routes_1.INDEXABLE_ROUTE_PATHS[view.id]);
    }
});
(0, node_test_1.default)('operator, supervisor and admin see the expected view set', () => {
    const operatorPermissions = (0, permission_profiles_1.resolvePermissionProfileFromRole)('operator').permissions;
    const supervisorPermissions = (0, permission_profiles_1.resolvePermissionProfileFromRole)('supervisor').permissions;
    const adminPermissions = (0, permission_profiles_1.resolvePermissionProfileFromRole)('admin').permissions;
    strict_1.default.deepEqual((0, views_1.getVisibleAppViews)(operatorPermissions).map(view => view.href), ['/dashboard', '/machines', '/checklists', '/executions', '/findings']);
    strict_1.default.deepEqual((0, views_1.getVisibleAppViews)(supervisorPermissions).map(view => view.href), ['/dashboard', '/machines', '/checklists', '/executions', '/findings']);
    strict_1.default.deepEqual((0, views_1.getVisibleAppViews)(adminPermissions).map(view => view.href), ['/dashboard', '/machines', '/checklists', '/executions', '/findings', '/admin']);
});
(0, node_test_1.default)('view lookup resolves known routes and ignores unknown ones', () => {
    strict_1.default.equal((0, views_1.getViewByHref)('/machines')?.id, 'machines');
    strict_1.default.equal((0, views_1.getViewByHref)('/missing'), null);
});
(0, node_test_1.default)('adjacent view cycle wraps correctly for operator navigation', () => {
    const operatorPermissions = (0, permission_profiles_1.resolvePermissionProfileFromRole)('operator').permissions;
    const fromDashboard = (0, views_1.getAdjacentViews)('/dashboard', operatorPermissions);
    strict_1.default.equal(fromDashboard.previous?.href, '/findings');
    strict_1.default.equal(fromDashboard.next?.href, '/machines');
    const fromFindings = (0, views_1.getAdjacentViews)('/findings', operatorPermissions);
    strict_1.default.equal(fromFindings.previous?.href, '/executions');
    strict_1.default.equal(fromFindings.next?.href, '/dashboard');
});
(0, node_test_1.default)('adjacent view cycle includes admin route for admin role', () => {
    const adminPermissions = (0, permission_profiles_1.resolvePermissionProfileFromRole)('admin').permissions;
    const fromAdmin = (0, views_1.getAdjacentViews)('/admin', adminPermissions);
    strict_1.default.equal(fromAdmin.previous?.href, '/findings');
    strict_1.default.equal(fromAdmin.next?.href, '/dashboard');
});
(0, node_test_1.default)('adjacent view cycle returns empty neighbors for unknown or insufficient context', () => {
    const operatorPermissions = (0, permission_profiles_1.resolvePermissionProfileFromRole)('operator').permissions;
    const unknownRoute = (0, views_1.getAdjacentViews)('/not-registered', operatorPermissions);
    strict_1.default.equal(unknownRoute.previous, null);
    strict_1.default.equal(unknownRoute.next, null);
    const withoutPermissions = (0, views_1.getAdjacentViews)('/dashboard', null);
    strict_1.default.equal(withoutPermissions.previous, null);
    strict_1.default.equal(withoutPermissions.next, null);
});
(0, node_test_1.default)('active route matching handles exact and nested paths without string drift', () => {
    strict_1.default.equal((0, path_matching_1.isActiveNavigationPath)('/dashboard', routes_1.INDEXABLE_ROUTE_PATHS.dashboard), true);
    strict_1.default.equal((0, path_matching_1.isActiveNavigationPath)('/executions/exec-1', routes_1.INDEXABLE_ROUTE_PATHS.executions), true);
    strict_1.default.equal((0, path_matching_1.isActiveNavigationPath)('/executions-archive', routes_1.INDEXABLE_ROUTE_PATHS.executions), false);
});
(0, node_test_1.default)('tracked navigation keeps querystrings for comparisons while ignoring hashes', () => {
    strict_1.default.equal((0, href_state_1.normalizeNavigationHref)('/executions?machine=m-1#top'), '/executions?machine=m-1');
    strict_1.default.equal((0, href_state_1.getCurrentNavigationHref)('/executions', { toString: () => 'machine=m-1' }), '/executions?machine=m-1');
    strict_1.default.equal((0, href_state_1.getCurrentNavigationHref)('/executions', { toString: () => '' }), '/executions');
});
