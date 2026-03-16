// Route: /dashboard
// Access: operator | supervisor | admin
// Purpose: render the operational overview while keeping the route entrypoint thin.

'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { Activity, AlertTriangle, BarChart3, ClipboardList, Cpu, PlayCircle, TrendingUp, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthState } from '@/components/ui/AuthProvider'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { getDemoDashboardStats } from '@/lib/demo/queries'

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  trend,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  sub?: string
  color: string
  trend?: string
}) {
  return (
    <div className="card p-5 animate-in">
      <div className="mb-3 flex items-start justify-between">
        <div className={clsx('flex h-9 w-9 items-center justify-center rounded-lg', color)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        {trend ? (
          <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        ) : null}
      </div>
      <p className="font-display text-3xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-400">{label}</p>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </div>
  )
}

export function DashboardScreen() {
  const { user } = useAuthState()
  const stats = getDemoDashboardStats()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos dias' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="min-h-full space-y-6 bg-grid p-6">
      <div className="flex items-start justify-between animate-in">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-white">
            {greeting}, {user?.full_name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: es })} - Panel base
          </p>
        </div>
        <Link href={ROUTE_PATHS.executions.create} className="btn-primary">
          <Zap className="h-4 w-4" />
          Nueva ejecucion
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Cpu}
          label="Maquinas"
          value={`${stats.active_machines}/${stats.total_machines}`}
          sub={`${stats.machines_in_maintenance} en mantenimiento`}
          color="bg-blue-500/15 text-blue-400"
        />
        <StatCard
          icon={ClipboardList}
          label="Checklists"
          value={stats.total_checklists}
          sub="Referencia minima"
          color="bg-violet-500/15 text-violet-400"
        />
        <StatCard
          icon={PlayCircle}
          label="Ejecuciones"
          value={stats.executions_today}
          sub={`${stats.executions_pending} pendientes`}
          color="bg-cyan-500/15 text-accent-cyan"
        />
        <StatCard
          icon={AlertTriangle}
          label="Hallazgos"
          value={stats.open_findings}
          sub={`${stats.critical_findings} criticos`}
          color="bg-amber-500/15 text-amber-400"
        />
      </div>

      <div className="card p-6 animate-in-delay-2">
        <div className="flex items-start gap-3">
          <Activity className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-cyan" />
          <div>
            <h2 className="font-display text-base font-bold tracking-wide text-white">Contenido demo reducido</h2>
            <p className="mt-1 text-sm text-slate-400">
              El tablero ya no renderiza listas ficticias extensas. Se dejo solo la capa minima de referencia para no
              sobrecargar el front mientras se conectan modulos reales.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={ROUTE_PATHS.machines.list} className="btn-secondary text-sm">
                <Cpu className="h-4 w-4" />
                Maquinas
              </Link>
              <Link href={ROUTE_PATHS.executions.list} className="btn-secondary text-sm">
                <PlayCircle className="h-4 w-4" />
                Ejecuciones
              </Link>
              <Link href={ROUTE_PATHS.findings.list} className="btn-secondary text-sm">
                <BarChart3 className="h-4 w-4" />
                Hallazgos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
