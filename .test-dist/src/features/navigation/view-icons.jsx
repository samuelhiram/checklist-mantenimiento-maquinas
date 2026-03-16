"use strict";
// Used by routes: /dashboard, /machines, /checklists, /executions, /findings, /admin
// Purpose: centralize icon mapping for the shared view registry.
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_VIEW_ICONS = void 0;
const lucide_react_1 = require("lucide-react");
exports.APP_VIEW_ICONS = {
    dashboard: lucide_react_1.LayoutDashboard,
    machines: lucide_react_1.Cpu,
    checklists: lucide_react_1.ClipboardList,
    executions: lucide_react_1.PlayCircle,
    findings: lucide_react_1.AlertTriangle,
    admin: lucide_react_1.Settings,
};
