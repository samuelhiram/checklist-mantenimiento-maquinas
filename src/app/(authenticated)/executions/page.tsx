// Route: /executions
// Access: operator | supervisor | admin
// Purpose: route entrypoint for the executions list screen.

import { ExecutionsListScreen } from '@/features/executions/screens/ExecutionsListScreen'

export default function Page() {
  return <ExecutionsListScreen />
}
