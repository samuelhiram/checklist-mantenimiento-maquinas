// Route: /dev/login
// Access: public in development, credential-protected by environment variables
// Purpose: route entrypoint for the dev auth login screen.

import { redirect } from 'next/navigation'
import { DevLoginScreen } from '@/features/dev-auth/screens/DevLoginScreen'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { hasDevAdminSession } from '@/lib/auth/dev-admin'

export default async function Page() {
  const hasSession = await hasDevAdminSession()

  if (hasSession) {
    redirect(ROUTE_PATHS.dev.authAdmin)
  }

  return <DevLoginScreen />
}
