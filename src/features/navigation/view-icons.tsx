// Used by routes: /dashboard, /machines, /checklists, /executions, /findings, /admin
// Purpose: centralize icon mapping for the shared view registry.

import type { ElementType } from 'react'
import {
  AlertTriangle,
  ClipboardList,
  Cpu,
  LayoutDashboard,
  PlayCircle,
  Settings,
} from 'lucide-react'

export type AppViewIconKey =
  | 'dashboard'
  | 'machines'
  | 'checklists'
  | 'executions'
  | 'findings'
  | 'admin'

export const APP_VIEW_ICONS: Record<AppViewIconKey, ElementType> = {
  dashboard: LayoutDashboard,
  machines: Cpu,
  checklists: ClipboardList,
  executions: PlayCircle,
  findings: AlertTriangle,
  admin: Settings,
}
