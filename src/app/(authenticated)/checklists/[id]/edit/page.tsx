// Route: /checklists/[id]/edit
// Access: operator | supervisor | admin
// Purpose: route entrypoint for the checklist edit screen.

import { ChecklistEditScreen } from '@/features/checklists/screens/ChecklistEditScreen'

export default function Page({ params }: { params: { id: string } }) {
  return <ChecklistEditScreen checklistId={params.id} />
}
