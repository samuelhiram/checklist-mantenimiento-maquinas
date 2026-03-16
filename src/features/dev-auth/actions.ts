'use server'

import { redirect } from 'next/navigation'
import type { FormActionState } from '@/types'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { establishDevAdminSession, getDevAdminFailureMessage } from '@/lib/auth/dev-admin'

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function loginDevAdminAction(
  _previousState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const email = getString(formData, 'email').toLowerCase()
  const password = getString(formData, 'password')

  if (!email || !password) {
    return { error: 'Correo y contrasena requeridos' }
  }

  const result = await establishDevAdminSession(email, password)

  if (!result.ok) {
    return { error: getDevAdminFailureMessage(result.reason) }
  }

  redirect(ROUTE_PATHS.dev.authAdmin)
}
