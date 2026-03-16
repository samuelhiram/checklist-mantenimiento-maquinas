// Route: /
// Access: public
// Purpose: render the primary login flow while keeping the route entrypoint thin.

'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { Activity, Eye, EyeOff, Shield, Zap } from 'lucide-react'
import type { FormActionState } from '@/types'
import { FormSubmitButton } from '@/components/feedback/FormSubmitButton'
import { ProtectedRoutesMenu } from '@/features/navigation/components/ProtectedRoutesMenu'
import { loginWithPasswordAction } from '../actions'

const INITIAL_ACTION_STATE: FormActionState = {
  error: null,
}

export function LoginScreen() {
  const [state, formAction] = useFormState(loginWithPasswordAction, INITIAL_ACTION_STATE)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-grid p-4 ${
        process.env.NODE_ENV === 'development' ? 'pt-28' : ''
      }`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-900/10 blur-3xl" />
      </div>

      {process.env.NODE_ENV === 'development' ? (
        <div className="absolute inset-x-0 top-0 z-20">
          <ProtectedRoutesMenu />
        </div>
      ) : null}

      <div className="relative z-10 w-full max-w-md animate-in">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-surface-400 bg-surface-100 shadow-glow-cyan">
            <Activity className="h-8 w-8 text-accent-cyan" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-white">MAQUINACHECK</h1>
          <p className="mt-1 text-sm text-slate-400">Sistema de Procedimientos Industriales</p>
          <div className="accent-line mt-4 h-px rounded" />
        </div>

        <div className="card p-6 shadow-2xl">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
            <Shield className="h-4 w-4 text-accent-cyan" />
            Acceso al Sistema
          </h2>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="label">Correo Electronico</label>
              <input
                name="email"
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="usuario@empresa.com"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Contrasena</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="********"
                  className="input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(current => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {state.error ? <p className="text-sm text-rose-400">{state.error}</p> : null}

            <FormSubmitButton
              type="submit"
              loadingLabel="Verificando..."
              className="btn-primary w-full justify-center py-2.5 text-base"
            >
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Ingresar al Sistema
              </span>
            </FormSubmitButton>
          </form>

          <div className="mt-6 border-t border-surface-300 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Referencia local</p>
            <p className="mt-2 text-sm text-slate-400">
              Esta pantalla ya no precarga cuentas demo. Para probar acceso, crea usuarios desde{' '}
              <span className="font-mono text-accent-cyan">/dev/auth-admin</span> y usa sus credenciales reales.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">Industrias Acero Norte S.A. - v1.0.0</p>
      </div>
    </div>
  )
}
