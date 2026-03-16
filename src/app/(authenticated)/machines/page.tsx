// Route: /machines
// Access: operator | supervisor | admin
// Purpose: route entrypoint for the machines list screen.

import { MachinesListScreen } from '@/features/machines/screens/MachinesListScreen'

export default function Page() {
  return <MachinesListScreen />
}
