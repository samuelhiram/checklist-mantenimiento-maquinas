import type { AuthUiState } from '@/types'
import { getCurrentSession } from './session'

export async function getInitialAuthState(): Promise<AuthUiState> {
  const session = await getCurrentSession()

  if (!session) {
    return {
      user: null,
      org: null,
      isAuthenticated: false,
    }
  }

  return {
    user: session.profile,
    org: session.org,
    isAuthenticated: true,
  }
}
