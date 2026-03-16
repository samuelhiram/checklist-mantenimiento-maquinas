// Route: /dev/login
// Access: public in development, credential-protected by environment variables
// Purpose: render the technical login for dev auth tooling while keeping the route entrypoint thin.

'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import type { FormActionState } from '@/types'
import { FormSubmitButton } from '@/components/feedback/FormSubmitButton'
import { ProtectedRoutesMenu } from '@/features/navigation/components/ProtectedRoutesMenu'
import { loginDevAdminAction } from '../actions'

const INITIAL_ACTION_STATE: FormActionState = {
  error: null,
}

export function DevLoginScreen() {
  const [state, formAction] = useFormState(loginDevAdminAction, INITIAL_ACTION_STATE)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center bg-grid p-4 ${
        process.env.NODE_ENV === 'development' ? 'pt-28' : ''
      }`}
    >
      {process.env.NODE_ENV === 'development' ? (
        <div className="absolute inset-x-0 top-0">
          <ProtectedRoutesMenu />
        </div>
      ) : null}
      <div className="card w-full max-w-md p-6">
        <h1 className="text-xl font-semibold text-white">Dev Auth Admin</h1>
        <p className="mt-1 text-sm text-slate-400">Acceso tecnico protegido por variables de entorno.</p>
        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="label">Correo</label>
            <input
              name="email"
              className="input"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Contrasena</label>
            <input
              name="password"
              type="password"
              className="input"
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
            />
          </div>
          {state.error ? <p className="text-sm text-rose-400">{state.error}</p> : null}
          <FormSubmitButton
            type="submit"
            className="btn-primary w-full justify-center"
            loadingLabel="Verificando..."
          >
            Entrar
          </FormSubmitButton>
        </form>
      </div>
    </div>
  )
}
