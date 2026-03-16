// Route: /findings/[id]
// Access: operator | supervisor | admin
// Purpose: route entrypoint for the finding detail screen.

import { FindingDetailScreen } from '@/features/findings/screens/FindingDetailScreen'

export default function Page({ params }: { params: { id: string } }) {
  return <FindingDetailScreen findingId={params.id} />
}
