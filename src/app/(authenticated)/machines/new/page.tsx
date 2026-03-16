// Route: /machines/new
// Access: supervisor | admin
// Purpose: route entrypoint for the machine creation screen.

import { MachineCreateScreen } from '@/features/machines/screens/MachineCreateScreen'

export default function Page() {
  return <MachineCreateScreen />
}
