// Used by routes: root layout.
// Purpose: compose client-side providers that should wrap the whole app.

'use client'

import type { AuthUiState } from '@/types'
import { AsyncUiProvider } from '@/components/feedback/AsyncUiProvider'
import { AuthProvider } from './AuthProvider'

export function AppProviders({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: AuthUiState
}) {
  return (
    <AuthProvider initialState={initialState}>
      <AsyncUiProvider>
        {children}
      </AsyncUiProvider>
    </AuthProvider>
  )
}
