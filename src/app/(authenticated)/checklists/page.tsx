// Route: /checklists
// Access: operator | supervisor | admin
// Purpose: route entrypoint for the checklists list screen.

import { ChecklistsListScreen } from '@/features/checklists/screens/ChecklistsListScreen'

export default function Page() {
  return <ChecklistsListScreen />
}
