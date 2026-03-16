import { prisma } from '@/lib/prisma'
import { FormSubmitButton } from '@/components/feedback/FormSubmitButton'
import { getPermissionProfileOptions, resolvePermissionProfileIdFromRole } from '@/lib/auth/permission-profiles'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import { createAuthUserAction, deleteAuthUserAction, updateAuthIdentityAction } from './actions'

async function getDevOrganizations() {
  return prisma.organization.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })
}

async function getDevAuthIdentities() {
  return prisma.authIdentity.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      profileId: true,
      email: true,
      status: true,
      profile: {
        select: {
          fullName: true,
          department: true,
          role: true,
          organization: {
            select: {
              name: true,
            },
          },
          permissionProfile: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  })
}

type DevOrganization = Awaited<ReturnType<typeof getDevOrganizations>>[number]
type DevAuthIdentity = Awaited<ReturnType<typeof getDevAuthIdentities>>[number]
const permissionProfileOptions = getPermissionProfileOptions()

function IdentityCard({ identity }: { identity: DevAuthIdentity }) {
  const profileId = identity.profile.permissionProfile?.id || resolvePermissionProfileIdFromRole(identity.profile.role || 'operator')
  const permissionProfile =
    permissionProfileOptions.find(option => option.id === profileId) || identity.profile.permissionProfile

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-white font-medium">{identity.email}</p>
          <p className="text-sm text-slate-400">
            {identity.profile.fullName || 'Sin nombre'} - {permissionProfile?.name || 'Operador base'} -{' '}
            {identity.profile.organization?.name || 'Sin org'}
          </p>
        </div>
        <span className="text-xs px-2 py-1 rounded border border-surface-400 text-slate-300">{identity.status}</span>
      </div>

      <form action={updateAuthIdentityAction} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <input type="hidden" name="identityId" value={identity.id} />
        <input name="fullName" className="input" defaultValue={identity.profile.fullName || ''} placeholder="Nombre completo" />
        <input name="department" className="input" defaultValue={identity.profile.department || ''} placeholder="Departamento" />
        <select name="permissionProfileId" className="input" defaultValue={profileId}>
          {permissionProfileOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <select name="status" className="input" defaultValue={identity.status}>
          <option value="active">active</option>
          <option value="disabled">disabled</option>
          <option value="locked">locked</option>
        </select>
        <input name="password" className="input md:col-span-2 xl:col-span-3" placeholder="Nuevo password (opcional)" />
        <div className="flex justify-end">
          <FormSubmitButton className="btn-primary" type="submit" loadingLabel="Guardando...">Guardar</FormSubmitButton>
        </div>
      </form>

      <form action={deleteAuthUserAction} className="flex justify-end">
        <input type="hidden" name="profileId" value={identity.profileId} />
        <FormSubmitButton className="btn-danger" type="submit" loadingLabel="Eliminando...">Eliminar usuario</FormSubmitButton>
      </form>
    </div>
  )
}

export default async function DevAuthAdminPage() {
  const [rawOrganizations, identities]: [DevOrganization[], DevAuthIdentity[]] = await Promise.all([
    getDevOrganizations(),
    getDevAuthIdentities(),
  ])
  const organizations = rawOrganizations
  const defaultOrganization = organizations[0] ?? null

  return (
    <div className="min-h-screen bg-grid p-6 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dev Auth Admin</h1>
          <p className="text-sm text-slate-400 mt-1">CRUD tecnico minimo para testear cuentas, passwords y estados.</p>
        </div>
        <form action={ROUTE_PATHS.api.devAuthLogout} method="post">
          <FormSubmitButton className="btn-secondary" type="submit" loadingLabel="Cerrando...">Cerrar acceso dev</FormSubmitButton>
        </form>
      </div>

      <section className="card p-5">
        <h2 className="text-white font-semibold">Crear usuario de prueba</h2>
        <form action={createAuthUserAction} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
          <input name="email" className="input" placeholder="correo@empresa.com" required />
          <input name="password" className="input" placeholder="Password temporal" required />
          <input name="fullName" className="input" placeholder="Nombre completo" required />
          <input name="department" className="input" placeholder="Departamento" />
          <select name="permissionProfileId" className="input" defaultValue="operator_basic">
            {permissionProfileOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {defaultOrganization ? (
            <select name="orgId" className="input" defaultValue={defaultOrganization.id}>
              {organizations.map((org: DevOrganization) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          ) : (
            <>
              <input type="hidden" name="orgId" value="" />
              <div className="flex items-center rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                No hay organizaciones creadas. El primer usuario usara <span className="ml-1 font-mono">Dev Organization</span>.
              </div>
            </>
          )}
          <div className="md:col-span-2 xl:col-span-3 flex justify-end">
            <FormSubmitButton className="btn-primary" type="submit" loadingLabel="Creando...">Crear acceso</FormSubmitButton>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        {identities.map((identity: DevAuthIdentity) => (
          <IdentityCard key={identity.id} identity={identity} />
        ))}

        {identities.length === 0 ? (
          <div className="card p-8 text-center text-slate-400">No hay identidades creadas todavia.</div>
        ) : null}
      </section>
    </div>
  )
}
