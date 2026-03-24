import { Cpu, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ScreenHeader } from '@/components/screen/ScreenHeader'
import { ScreenPage } from '@/components/screen/ScreenPage'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { requireMachineCreateAccess } from '@/lib/auth/authorization-guards'
import { MachineCreateForm } from '../components/MachineCreateForm'
import { MachineCreationGuide } from '../components/MachineCreationGuide'

export async function MachineCreateScreen() {
  await requireMachineCreateAccess()

  return (
    <ScreenPage>
      <div className="space-y-6">
        <ScreenHeader
          size="sm"
          title="Nueva Maquina"
          description="Registra un nuevo equipo o proceso en el sistema"
          icon={Cpu}
          accentClassName="text-blue-400"
          actions={
            <Link href={ROUTE_PATHS.machines.list} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al listado
            </Link>
          }
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MachineCreateForm />
          </div>
          <div className="lg:col-span-1">
            <MachineCreationGuide />
          </div>
        </div>
      </div>
    </ScreenPage>
  )
}
