// Route: /
// Access: public
// Purpose: route entrypoint for the primary login screen.

import { redirect } from 'next/navigation'
import { LoginScreen } from '@/features/auth/screens/LoginScreen'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { getCurrentSession } from '@/lib/auth/session'

export default async function Page() {
  const session = await getCurrentSession()

  if (session) {
    redirect(ROUTE_PATHS.auth.dashboard)
  }

  return <LoginScreen />
}
