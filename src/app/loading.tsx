// Route: global app fallback
// Access: public
// Purpose: display a shared loading shell during route-level suspense transitions.

import { RouteLoadingScreen } from '@/components/feedback/RouteLoadingScreen'

export default function Loading() {
  return <RouteLoadingScreen viewport="screen" variant="auth" />
}
