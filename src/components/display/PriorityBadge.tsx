// Used by routes: /machines, /checklists, /executions, /findings
// Purpose: standardize priority rendering across feature screens.

import type { PriorityLevel } from '@/types'

const PRIORITY_STYLES: Record<PriorityLevel, string> = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
}

const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  critical: 'Critico',
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
}

export function PriorityBadge({ level }: { level: PriorityLevel }) {
  return <span className={PRIORITY_STYLES[level]}>{PRIORITY_LABELS[level]}</span>
}
