// Used by routes: list and overview screens that need compact operational metrics.
// Purpose: standardize stat tile layout so pages only describe data and tone.

import clsx from 'clsx'
import type { ReactNode } from 'react'

type ScreenStatTone = 'blue' | 'cyan' | 'emerald' | 'amber' | 'red' | 'rose' | 'violet' | 'neutral'

const TONE_STYLES: Record<ScreenStatTone, { text: string; surface: string }> = {
  blue: { text: 'text-blue-400', surface: 'bg-blue-500/10 border-blue-500/20' },
  cyan: { text: 'text-cyan-400', surface: 'bg-cyan-500/10 border-cyan-500/20' },
  emerald: { text: 'text-emerald-400', surface: 'bg-emerald-500/10 border-emerald-500/20' },
  amber: { text: 'text-amber-400', surface: 'bg-amber-500/10 border-amber-500/20' },
  red: { text: 'text-red-400', surface: 'bg-red-500/10 border-red-500/20' },
  rose: { text: 'text-rose-400', surface: 'bg-rose-500/10 border-rose-500/20' },
  violet: { text: 'text-violet-400', surface: 'bg-violet-500/10 border-violet-500/20' },
  neutral: { text: 'text-white', surface: 'bg-surface-200 border-surface-300' },
}

export interface ScreenStatItem {
  label: string
  value: string | number
  tone?: ScreenStatTone
  subtitle?: string
  icon?: ReactNode
}

export function ScreenStatsGrid({
  items,
  columnsClassName = 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
}: {
  items: ScreenStatItem[]
  columnsClassName?: string
}) {
  return (
    <div className={clsx('grid gap-3 animate-in-delay-1', columnsClassName)}>
      {items.map(item => {
        const tone = TONE_STYLES[item.tone ?? 'neutral']

        return (
          <div key={item.label} className={clsx('border rounded-xl p-4', tone.surface)}>
            {item.icon ? <div className={clsx('mb-3', tone.text)}>{item.icon}</div> : null}
            <p className={clsx('text-2xl font-display font-bold', tone.text)}>{item.value}</p>
            <p className="text-slate-400 text-xs mt-0.5">{item.label}</p>
            {item.subtitle ? <p className="text-slate-500 text-xs mt-1">{item.subtitle}</p> : null}
          </div>
        )
      })}
    </div>
  )
}
