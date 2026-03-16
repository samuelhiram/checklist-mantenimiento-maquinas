"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_VIEWS = void 0;
exports.getVisibleAppViews = getVisibleAppViews;
exports.getViewByHref = getViewByHref;
exports.getAdjacentViews = getAdjacentViews;
const permission_profiles_1 = require("../../lib/auth/permission-profiles");
const authorization_catalog_1 = require("../../lib/auth/authorization-catalog");
const routes_1 = require("./routes");
function defineAppView(input) {
    return {
        ...input,
        href: routes_1.INDEXABLE_ROUTE_PATHS[input.id],
    };
}
exports.APP_VIEWS = (0, authorization_catalog_1.getIndexableAuthorizationFeatures)().map(view => defineAppView({
    id: view.routeId,
    label: view.label,
    description: view.description,
    icon: view.icon,
    requiredPermission: view.requiredPermission,
}));
function getVisibleAppViews(permissions) {
    if (!permissions?.length) {
        return [];
    }
    return exports.APP_VIEWS.filter(view => (0, permission_profiles_1.hasPermission)(permissions, view.requiredPermission));
}
function getViewByHref(href) {
    return exports.APP_VIEWS.find(view => view.href === href) ?? null;
}
function getAdjacentViews(currentHref, permissions) {
    const visibleViews = getVisibleAppViews(permissions);
    const currentIndex = visibleViews.findIndex(view => view.href === currentHref);
    if (currentIndex === -1 || visibleViews.length < 2) {
        return {
            previous: null,
            next: null,
        };
    }
    const previousIndex = (currentIndex - 1 + visibleViews.length) % visibleViews.length;
    const nextIndex = (currentIndex + 1) % visibleViews.length;
    return {
        previous: visibleViews[previousIndex],
        next: visibleViews[nextIndex],
    };
}
