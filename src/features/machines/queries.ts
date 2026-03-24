import { prisma } from '@/lib/prisma'
import { Prisma, MachineStatus as PrismaMachineStatus, PriorityLevel as PrismaPriorityLevel } from '@prisma/client'
import type { 
  Machine, 
  MachineStatus, 
  PriorityLevel, 
  Checklist, 
  Execution, 
  Finding,
  ChecklistStatus,
  ExecutionStatus,
  FindingStatus,
  FrequencyType,
  UserRole,
  JsonObject,
  ISODateString
} from '@/types'

type PrismaMachineWithCount = Prisma.MachineGetPayload<{
  include: { _count: { select: { checklists: true } } }
}>

/**
 * Maps a Prisma Machine record to the domain Machine interface.
 */
export function mapPrismaMachine(record: PrismaMachineWithCount): Machine {
  return {
    id: record.id,
    org_id: record.orgId,
    location_id: record.locationId || undefined,
    name: record.name,
    code: record.code || undefined,
    type: (record.type as Machine['type']) || 'machine',
    manufacturer: record.manufacturer || undefined,
    model: record.model || undefined,
    serial_number: record.serialNumber || undefined,
    status: (record.status as string) as MachineStatus,
    priority: (record.priority as string) as PriorityLevel,
    image_url: record.imageUrl || undefined,
    description: record.description || undefined,
    specs: (record.specs as JsonObject) || {},
    tags: record.tags,
    created_by: record.createdBy || undefined,
    created_at: (record.createdAt ?? new Date()).toISOString() as ISODateString,
    updated_at: (record.updatedAt ?? new Date()).toISOString() as ISODateString,
    _checklist_count: record._count?.checklists,
  }
}

export async function listMachines(orgId: string, filters: {
  search?: string
  status?: string
  type?: string
  priority?: string
} = {}): Promise<Machine[]> {
  const { search, status, type, priority } = filters

  const where: Prisma.MachineWhereInput = {
    orgId,
  }

  if (status && status !== 'all') {
    where.status = status as PrismaMachineStatus
  }

  if (type && type !== 'all') {
    where.type = type
  }

  if (priority && priority !== 'all') {
    where.priority = priority as PrismaPriorityLevel
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
    ]
  }

  const records = await prisma.machine.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { checklists: true },
      },
    },
  })

  return records.map(mapPrismaMachine)
}

export async function getMachineStats(orgId: string) {
  const [total, active, maintenance, critical] = await Promise.all([
    prisma.machine.count({ where: { orgId } }),
    prisma.machine.count({ where: { orgId, status: 'active' } }),
    prisma.machine.count({ where: { orgId, status: 'maintenance' } }),
    prisma.machine.count({ where: { orgId, priority: 'critical' } }),
  ])

  return { total, active, maintenance, critical }
}

export async function getMachineById(orgId: string, machineId: string): Promise<Machine | null> {
  const record = await prisma.machine.findFirst({
    where: {
      id: machineId,
      orgId,
    },
    include: {
      _count: {
        select: { checklists: true },
      },
    },
  })

  return record ? mapPrismaMachine(record) : null
}

export async function listChecklistsByMachine(orgId: string, machineId: string): Promise<Checklist[]> {
  const records = await prisma.checklist.findMany({
    where: { orgId, machineId },
    orderBy: { createdAt: 'desc' },
  })
  
  return records.map(record => ({
    id: record.id,
    org_id: record.orgId,
    machine_id: record.machineId,
    name: record.name,
    description: record.description || undefined,
    version: record.version ?? 1,
    status: (record.status as string) as ChecklistStatus,
    priority: (record.priority as string) as PriorityLevel,
    frequency: (record.frequency as string) as FrequencyType,
    frequency_cron: record.frequencyCron || undefined,
    estimated_min: record.estimatedMin ?? 0,
    required_role: (record.requiredRole as string) as UserRole,
    instructions: record.instructions || undefined,
    tags: record.tags,
    is_template: record.isTemplate ?? false,
    created_by: record.createdBy || undefined,
    updated_by: record.updatedBy || undefined,
    created_at: (record.createdAt ?? new Date()).toISOString() as ISODateString,
    updated_at: (record.updatedAt ?? new Date()).toISOString() as ISODateString,
    _item_count: 0
  } satisfies Checklist))
}

export type ExecutionWithChecklist = Execution & { checklist?: { name: string } }

export async function listExecutionsByMachine(orgId: string, machineId: string): Promise<ExecutionWithChecklist[]> {
  const records = await prisma.execution.findMany({
    where: { orgId, machineId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      checklist: { select: { name: true } }
    }
  })

  return records.map(record => ({
    id: record.id,
    org_id: record.orgId,
    checklist_id: record.checklistId,
    machine_id: record.machineId,
    assigned_to: record.assignedTo || undefined,
    executed_by: record.executedBy || undefined,
    reviewed_by: record.reviewedBy || undefined,
    status: (record.status as string) as ExecutionStatus,
    priority: (record.priority as string) as PriorityLevel,
    scheduled_at: record.scheduledAt?.toISOString() as ISODateString,
    started_at: record.startedAt?.toISOString() as ISODateString,
    completed_at: record.completedAt?.toISOString() as ISODateString,
    due_at: record.dueAt?.toISOString() as ISODateString,
    score: record.score !== null ? Number(record.score) : undefined,
    notes: record.notes || undefined,
    metadata: (record.metadata as JsonObject) || {},
    created_at: (record.createdAt ?? new Date()).toISOString() as ISODateString,
    updated_at: (record.updatedAt ?? new Date()).toISOString() as ISODateString,
    checklist: record.checklist ? { name: record.checklist.name } : undefined
  } as ExecutionWithChecklist))
}

export async function listFindingsByMachine(orgId: string, machineId: string): Promise<Finding[]> {
  const records = await prisma.finding.findMany({
    where: { orgId, machineId },
    orderBy: { createdAt: 'desc' },
  })

  return records.map(record => ({
    id: record.id,
    org_id: record.orgId,
    execution_id: record.executionId || undefined,
    machine_id: record.machineId,
    item_id: record.itemId || undefined,
    reported_by: record.reportedBy || undefined,
    assigned_to: record.assignedTo || undefined,
    title: record.title,
    description: record.description || undefined,
    severity: (record.severity as string) as PriorityLevel,
    status: (record.status as string) as FindingStatus,
    photos: record.photos,
    resolved_at: record.resolvedAt?.toISOString() as ISODateString,
    resolution_note: record.resolutionNote || undefined,
    created_at: (record.createdAt ?? new Date()).toISOString() as ISODateString,
    updated_at: (record.updatedAt ?? new Date()).toISOString() as ISODateString,
  } satisfies Finding))
}
