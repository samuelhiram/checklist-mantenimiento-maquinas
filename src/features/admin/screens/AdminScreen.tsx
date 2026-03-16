// Route: /admin
// Access: admin
// Purpose: render the administrative reference view while keeping the route entrypoint thin.

'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { BarChart3, Building2, ClipboardList, Cpu, Info, PlayCircle, Settings, Shield, Users } from 'lucide-react'
import { useAuthState } from '@/components/ui/AuthProvider'
import { getAppAccessSnapshot } from '@/lib/auth/authorization'
import {
  getDemoOrganization,
  listDemoChecklists,
  listDemoExecutions,
  listDemoMachines,
  listDemoProfiles,
} from '@/lib/demo/queries'
import type { Profile } from '@/types'

type AdminTab = 'overview' | 'users' | 'org'

const roleConfig = {
  admin: { label: 'Administrador', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  supervisor: { label: 'Supervisor', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  operator: { label: 'Operador', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
} as const

const tabs: Array<{ key: AdminTab; label: string; icon: React.ElementType }> = [
  { key: 'overview', label: 'Resumen', icon: BarChart3 },
  { key: 'users', label: 'Usuarios', icon: Users },
  { key: 'org', label: 'Organizacion', icon: Building2 },
]

function UserRow({ profile }: { profile: Profile }) {
  const role = roleConfig[profile.role]

  return (
    <div className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-200">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-surface-400 text-sm font-bold text-white">
        {profile.full_name.split(' ').map(name => name[0]).join('').slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-200">{profile.full_name}</p>
        <p className="text-xs text-slate-500">{profile.department || '-'}</p>
      </div>
      <span className={clsx('rounded-lg border px-2 py-1 text-xs font-semibold', role.color, role.bg)}>
        {role.label}
      </span>
    </div>
  )
}

export function AdminScreen() {
  const { user } = useAuthState()
  const access = getAppAccessSnapshot(user)
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const adminAccess = access.administration
  const accessLabel = user?.permission_profile_name || (adminAccess.view ? 'Administrador del sistema' : 'Acceso restringido')
  const profiles = listDemoProfiles()
  const machines = listDemoMachines()
  const checklists = listDemoChecklists()
  const executions = listDemoExecutions()
  const organization = getDemoOrganization()

  const stats = [
    { label: 'Maquinas', value: machines.length, icon: Cpu, color: 'text-blue-400' },
    { label: 'Checklists', value: checklists.length, icon: ClipboardList, color: 'text-violet-400' },
    { label: 'Ejecuciones', value: executions.length, icon: PlayCircle, color: 'text-cyan-400' },
    { label: 'Usuarios', value: profiles.length, icon: Users, color: 'text-rose-400' },
  ]

  return (
    <div className="min-h-full space-y-5 bg-grid p-6">
      <div className="flex items-start justify-between animate-in">
        <div>
          <h1 className="font-display flex items-center gap-2 text-2xl font-bold tracking-wide text-white">
            <Settings className="h-6 w-6 text-slate-400" />
            Administracion
          </h1>
          <p className="mt-1 text-sm text-slate-400">Vista reducida para referencia local.</p>
        </div>
        <div
          className={clsx(
            'flex items-center gap-2 rounded-lg border px-3 py-1.5',
            adminAccess.view ? 'border-rose-500/20 bg-rose-500/10 text-rose-400' : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
          )}
        >
          <Shield className="h-4 w-4" />
          <span className="text-sm font-semibold">{accessLabel}</span>
        </div>
      </div>

      <div className="flex gap-2 animate-in-delay-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'border border-accent-cyan/30 bg-accent-cyan/15 text-accent-cyan'
                : 'border border-surface-300 bg-surface-200 text-slate-400 hover:border-surface-500'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-5 animate-in">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map(stat => (
              <div key={stat.label} className="card p-5">
                <stat.icon className={clsx('mb-3 h-5 w-5', stat.color)} />
                <p className={clsx('font-display text-3xl font-bold', stat.color)}>{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="card border-dashed border-surface-500 p-5">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-cyan" />
              <div>
                <p className="font-medium text-white">Contenido demo minimo</p>
                <p className="mt-1 text-sm text-slate-400">
                  Se retiraron accesos, formularios y acciones ficticias para dejar esta vista liviana y menos costosa
                  de mantener.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'users' ? (
        <div className="card animate-in">
          <div className="border-b border-surface-300 p-5">
            <h2 className="font-display flex items-center gap-2 text-base font-bold tracking-wide text-white">
              <Users className="h-4 w-4 text-rose-400" />
              Usuarios ({profiles.length})
            </h2>
          </div>
          <div className="divide-y divide-surface-300">
            {profiles.map(profile => (
              <UserRow key={profile.id} profile={profile} />
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'org' ? (
        <div className="card p-6 animate-in">
          <h2 className="font-display mb-5 flex items-center gap-2 text-base font-bold tracking-wide text-white">
            <Building2 className="h-4 w-4 text-blue-400" />
            Organizacion de referencia
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className="label">Nombre</label>
              <input defaultValue={organization.name} className="input" disabled />
            </div>
            <div>
              <label className="label">Slug</label>
              <input defaultValue={organization.slug} className="input font-mono" disabled />
            </div>
            <div>
              <label className="label">Plan</label>
              <input defaultValue={organization.plan} className="input" disabled />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
