'use server'

import { redirect } from 'next/navigation'
import type { FormActionState } from '@/types'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { establishPasswordSession, getAuthFailureMessage } from '@/lib/auth/session'

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function loginWithPasswordAction(
  _previousState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const email = getString(formData, 'email').toLowerCase()
  const password = getString(formData, 'password')

  if (!email || !password) {
    return { error: 'Correo y contrasena son requeridos' }
  }

  const result = await establishPasswordSession(email, password)

  if (!result.ok) {
    return { error: getAuthFailureMessage(result.reason) }
  }

  redirect(ROUTE_PATHS.auth.dashboard)
}
