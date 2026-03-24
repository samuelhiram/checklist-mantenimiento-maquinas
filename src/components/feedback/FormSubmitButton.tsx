// Used by routes: any server action form that needs a reusable pending submit state.
// Purpose: bridge React form pending state with the shared async button treatment.

'use client'

import { useFormStatus } from 'react-dom'
import { AsyncButton, type AsyncButtonProps } from './AsyncButton'

export function FormSubmitButton({ type = 'submit', ...props }: Omit<AsyncButtonProps, 'loading'>) {
  const { pending } = useFormStatus()

  return <AsyncButton {...props} type={type} loading={pending} />
}
