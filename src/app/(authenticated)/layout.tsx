import { AppShell } from '@/lib/auth/shell'

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
