// Route: /findings
// Access: operator | supervisor | admin
// Purpose: route entrypoint for the findings list screen.

import { FindingsListScreen } from '@/features/findings/screens/FindingsListScreen'

export default function Page() {
  return <FindingsListScreen />
}
