import { Info, Cpu, Fingerprint, Activity, Gauge } from 'lucide-react'

export function MachineCreationGuide() {
  return (
    <div className="space-y-6 rounded-xl border border-surface-300 bg-surface-100/50 p-5 animate-in-delay-1">
      <div className="flex items-center gap-2 text-blue-400">
        <Info className="h-5 w-5" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wider">Guía de Registro</h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="mt-1 h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-surface-300 text-blue-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-tight">Identificación</h4>
            <p className="text-[11px] leading-relaxed text-slate-400 mt-1">
              Nombre descriptivo y código interno único para trazabilidad rápida en el inventario.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-1 h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-surface-300 text-cyan-400">
            <Fingerprint className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-tight">Datos Técnicos</h4>
            <p className="text-[11px] leading-relaxed text-slate-400 mt-1">
              Fabricante, modelo y número de serie para gestionar garantías y repuestos específicos.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-1 h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-surface-300 text-emerald-400">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-tight">Estado Operativo</h4>
            <p className="text-[11px] leading-relaxed text-slate-400 mt-1">
              Define si el activo entra en servicio inmediatamente o queda en reserva/mantenimiento.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-1 h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-surface-300 text-amber-400">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-tight">Prioridad</h4>
            <p className="text-[11px] leading-relaxed text-slate-400 mt-1">
              Impacto del activo en la producción. Define la urgencia de sus mantenimientos.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-surface-300">
        <p className="text-[10px] italic text-slate-500 text-center">
          Todos los campos marcados con * son mandatorios para el cumplimiento normativo.
        </p>
      </div>
    </div>
  )
}
