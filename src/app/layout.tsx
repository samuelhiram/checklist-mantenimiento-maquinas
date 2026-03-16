import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '@/components/ui/AppProviders'
import { Toaster } from 'react-hot-toast'
import { getInitialAuthState } from '@/lib/auth/state'

export const metadata: Metadata = {
  title: 'MaquinaCheck - Sistema de Procedimientos Industriales',
  description: 'Seguimiento de procedimientos y checklists para maquinas, procesos y servicios industriales',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialState = await getInitialAuthState()

  return (
    <html lang="es">
      <body>
        <AppProviders initialState={initialState}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#141929',
                color: '#e2e8f0',
                border: '1px solid #2d364d',
                fontFamily: 'Barlow, sans-serif',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#34d399', secondary: '#0a0e1a' } },
              error: { iconTheme: { primary: '#fb7185', secondary: '#0a0e1a' } },
            }}
          />
        </AppProviders>
      </body>
    </html>
  )
}
