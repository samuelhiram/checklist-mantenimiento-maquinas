// Route: /checklists/new
// Access: supervisor | admin
// Purpose: route entrypoint for the checklist creation screen.

import { ChecklistCreateScreen } from '@/features/checklists/screens/ChecklistCreateScreen'

export default function Page({
  searchParams,
}: {
  searchParams?: { machine?: string }
}) {
  return <ChecklistCreateScreen machineId={searchParams?.machine} />
}
