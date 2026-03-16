'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthUiState } from '@/types'

const EMPTY_AUTH_STATE: AuthUiState = {
  user: null,
  org: null,
  isAuthenticated: false,
}

interface AuthContextValue {
  auth: AuthUiState
  setAuth: (nextState: AuthUiState) => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: AuthUiState
}) {
  const [auth, setAuth] = useState<AuthUiState>(initialState ?? EMPTY_AUTH_STATE)

  useEffect(() => {
    setAuth(initialState ?? EMPTY_AUTH_STATE)
  }, [initialState])

  const value = useMemo<AuthContextValue>(() => ({
    auth,
    setAuth,
    clearAuth: () => setAuth(EMPTY_AUTH_STATE),
  }), [auth])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

export function useAuthState() {
  return useAuth().auth
}
