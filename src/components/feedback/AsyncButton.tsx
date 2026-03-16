// Used by routes: any client-side action that needs a shared loading button treatment.
// Purpose: standardize disabled, spinner, and aria-busy behavior for async buttons.

'use client'

import clsx from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

export interface AsyncButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingLabel?: ReactNode
  spinnerClassName?: string
}

export function AsyncButton({
  children,
  className,
  disabled,
  loading = false,
  loadingLabel,
  spinnerClassName,
  type = 'button',
  ...props
}: AsyncButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      data-loading={loading ? 'true' : 'false'}
      className={clsx(className, (disabled || loading) && 'cursor-not-allowed', loading && 'opacity-80')}
    >
      {loading ? (
        <>
          <LoadingSpinner className={spinnerClassName} />
          <span>{loadingLabel ?? children}</span>
        </>
      ) : children}
    </button>
  )
}
