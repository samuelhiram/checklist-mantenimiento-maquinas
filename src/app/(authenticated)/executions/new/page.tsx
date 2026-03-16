// Route: /executions/new
// Access: operator | supervisor | admin
// Purpose: route entrypoint for the execution creation screen.

import { ExecutionCreateScreen } from '@/features/executions/screens/ExecutionCreateScreen'

export default function Page({
  searchParams,
}: {
  searchParams?: { checklist?: string }
}) {
  return <ExecutionCreateScreen checklistId={searchParams?.checklist} />
}
