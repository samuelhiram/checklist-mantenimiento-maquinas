'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentSession } from '@/lib/auth/session'
import { ROUTE_PATHS } from '@/features/navigation/routes'
import type { MachineStatus, PriorityLevel } from '@/types'

export async function createMachine(formData: FormData) {
  const session = await getCurrentSession()
  if (!session?.org.id) {
    throw new Error('No autorizado')
  }

  const name = formData.get('name') as string
  const code = formData.get('code') as string
  const type = formData.get('type') as string
  const manufacturer = formData.get('manufacturer') as string
  const model = formData.get('model') as string
  const serialNumber = formData.get('serialNumber') as string
  const status = (formData.get('status') as MachineStatus) || 'active'
  const priority = (formData.get('priority') as PriorityLevel) || 'medium'
  const description = formData.get('description') as string

  if (!name) {
    return { error: 'El nombre es obligatorio' }
  }

  try {
    const machine = await prisma.machine.create({
      data: {
        orgId: session.org.id,
        name,
        code,
        type,
        manufacturer,
        model,
        serialNumber,
        status,
        priority,
        description,
        createdBy: session.profile.id,
      },
    })

    revalidatePath(ROUTE_PATHS.machines.list)
    return { success: true, id: machine.id }
  } catch (error) {
    console.error('Error creating machine:', error)
    return { error: 'Error al crear la maquina' }
  }
}
