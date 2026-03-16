"use strict";
// Used by routes: sidebar, dev fast access, and other navigation surfaces.
// Purpose: keep active-route matching in one place so path rules do not drift.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isActiveNavigationPath = isActiveNavigationPath;
const routes_1 = require("./routes");
function isActiveNavigationPath(pathname, href) {
    if (href === routes_1.ROUTE_PATHS.auth.login) {
        return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
}
