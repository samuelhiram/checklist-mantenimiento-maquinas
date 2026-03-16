"use strict";
// Used by routes: navigation feedback and tracked link primitives.
// Purpose: keep current-route comparison consistent across pathname and querystring aware surfaces.
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeNavigationHref = normalizeNavigationHref;
exports.getCurrentNavigationHref = getCurrentNavigationHref;
function normalizeNavigationHref(href) {
    return href.split('#')[0];
}
function getCurrentNavigationHref(pathname, searchParams) {
    const query = searchParams?.toString();
    if (!query) {
        return pathname;
    }
    return `${pathname}?${query}`;
}
