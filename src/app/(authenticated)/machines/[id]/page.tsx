// Route: /machines/[id]
// Access: operator | supervisor | admin
// Purpose: route entrypoint for the machine detail screen.

import { MachineDetailScreen } from '@/features/machines/screens/MachineDetailScreen'

export default function Page({ params }: { params: { id: string } }) {
  return <MachineDetailScreen machineId={params.id} />
}
