// Route: /executions/[id]
// Access: operator | supervisor | admin
// Purpose: route entrypoint for the execution detail screen.

import { ExecutionDetailScreen } from '@/features/executions/screens/ExecutionDetailScreen'

export default function Page({ params }: { params: { id: string } }) {
  return <ExecutionDetailScreen executionId={params.id} />
}
