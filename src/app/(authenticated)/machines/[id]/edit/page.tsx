// Route: /machines/[id]/edit
// Access: supervisor | admin
// Purpose: route entrypoint for the machine edit screen.

import { MachineEditScreen } from '@/features/machines/screens/MachineEditScreen'

export default function Page({ params }: { params: { id: string } }) {
  return <MachineEditScreen machineId={params.id} />
}
