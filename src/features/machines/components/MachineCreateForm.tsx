'use client'

import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import Link from 'next/link'
import { FormSubmitButton } from '@/components/feedback/FormSubmitButton'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { createMachine } from '../actions'
import { MACHINE_TYPE_LABEL, MACHINE_STATUS_CONFIG } from '../config'

export function MachineCreateForm() {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const result = await createMachine(formData)
    if (result.success) {
      router.push(ROUTE_PATHS.machines.list)
      router.refresh()
    } else if (result.error) {
      alert(result.error)
    }
  }

  return (
    <div className="w-full">
      <form action={handleSubmit} className="space-y-4 rounded-xl border border-surface-300 bg-surface-50 p-5 shadow-sm transition-all duration-300">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Main Info */}
          <div className="sm:col-span-2 space-y-1.5">
            <label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-tight">
              Nombre de la maquina <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Ej: Prensa Hidraulica P-01"
              className="w-full rounded-lg border border-surface-400 bg-surface-200 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="code" className="text-xs font-bold text-slate-400 uppercase tracking-tight">Codigo interno</label>
            <input
              type="text"
              id="code"
              name="code"
              placeholder="Ej: MC-PH-01"
              className="w-full rounded-lg border border-surface-400 bg-surface-200 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="type" className="text-xs font-bold text-slate-400 uppercase tracking-tight">Tipo de activo</label>
            <div className="relative">
              <select
                id="type"
                name="type"
                defaultValue="machine"
                className="w-full rounded-lg border border-surface-400 bg-surface-200 px-3 py-2 text-sm text-white focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 transition-all font-medium appearance-none"
              >
                {Object.entries(MACHINE_TYPE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Manufacturer, Model & Serial */}
          <div className="space-y-1.5">
            <label htmlFor="manufacturer" className="text-xs font-bold text-slate-400 uppercase tracking-tight">Fabricante</label>
            <input
              type="text"
              id="manufacturer"
              name="manufacturer"
              placeholder="Ej: Siemens"
              className="w-full rounded-lg border border-surface-400 bg-surface-200 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="model" className="text-xs font-bold text-slate-400 uppercase tracking-tight">Modelo</label>
            <input
              type="text"
              id="model"
              name="model"
              placeholder="Ej: S7-1200"
              className="w-full rounded-lg border border-surface-400 bg-surface-200 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 transition-all font-medium"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label htmlFor="serialNumber" className="text-xs font-bold text-slate-400 uppercase tracking-tight">Número de Serie</label>
            <input
              type="text"
              id="serialNumber"
              name="serialNumber"
              placeholder="Ej: SN-987654321"
              className="w-full rounded-lg border border-surface-400 bg-surface-200 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 transition-all font-medium"
            />
          </div>

          {/* Status & Priority */}
          <div className="space-y-1.5">
            <label htmlFor="status" className="text-xs font-bold text-slate-400 uppercase tracking-tight">Estado inicial</label>
            <select
              id="status"
              name="status"
              defaultValue="active"
              className="w-full rounded-lg border border-surface-400 bg-surface-200 px-3 py-2 text-sm text-white focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 transition-all font-medium appearance-none"
            >
              {Object.entries(MACHINE_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="priority" className="text-xs font-bold text-slate-400 uppercase tracking-tight">Prioridad operativa</label>
            <select
              id="priority"
              name="priority"
              defaultValue="medium"
              className="w-full rounded-lg border border-surface-400 bg-surface-200 px-3 py-2 text-sm text-white focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 transition-all font-medium appearance-none"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Critica</option>
            </select>
          </div>

          {/* Description */}
          <div className="sm:col-span-2 space-y-1.5">
            <label htmlFor="description" className="text-xs font-bold text-slate-400 uppercase tracking-tight">Descripcion / Notas</label>
            <textarea
              id="description"
              name="description"
              rows={2}
              placeholder="Detalles adicionales sobre la maquina..."
              className="w-full rounded-lg border border-surface-400 bg-surface-200 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 transition-all font-medium resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-300">
          <Link 
            href={ROUTE_PATHS.machines.list} 
            className="px-4 py-2 text-[13px] font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </Link>
          <FormSubmitButton 
            className="btn-primary px-6 py-2"
            trackingLabel="Guardando nueva maquina"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Maquina
          </FormSubmitButton>
        </div>
      </form>
    </div>
  )
}
