import type { Checklist, Execution, Machine } from '@/types'
import { getDemoOrganization } from './queries'

// Demo/mock entities must be built through typed factories.
// This keeps mock creation aligned with domain contracts and avoids `as Model`.
function nowIso() {
  return new Date().toISOString()
}

export function buildDraftChecklist(data: Partial<Checklist>): Checklist {
  const timestamp = nowIso()
  const organization = getDemoOrganization()

  return {
    id: `cl-${Date.now()}`,
    org_id: data.org_id ?? organization.id,
    machine_id: data.machine_id ?? '',
    name: data.name ?? 'Checklist sin nombre',
    version: 1,
    status: 'draft',
    priority: data.priority ?? 'medium',
    frequency: data.frequency ?? 'manual',
    estimated_min: data.estimated_min ?? 15,
    required_role: data.required_role ?? 'operator',
    tags: data.tags ?? [],
    is_template: false,
    created_at: timestamp,
    updated_at: timestamp,
    description: data.description,
    frequency_cron: data.frequency_cron,
    instructions: data.instructions,
    created_by: data.created_by,
    updated_by: data.updated_by,
    machine: data.machine,
    items: data.items,
    _item_count: data._item_count ?? 0,
  }
}

export function buildMachine(data: Partial<Machine>): Machine {
  const timestamp = nowIso()
  const organization = getDemoOrganization()

  return {
    id: `mach-${Date.now()}`,
    org_id: data.org_id ?? organization.id,
    name: data.name ?? 'Maquina sin nombre',
    type: data.type ?? 'machine',
    status: data.status ?? 'active',
    priority: data.priority ?? 'medium',
    specs: data.specs ?? {},
    tags: data.tags ?? [],
    created_at: timestamp,
    updated_at: timestamp,
    location_id: data.location_id,
    code: data.code,
    manufacturer: data.manufacturer,
    model: data.model,
    serial_number: data.serial_number,
    image_url: data.image_url,
    description: data.description,
    created_by: data.created_by,
    location: data.location,
    checklists: data.checklists,
    _checklist_count: data._checklist_count,
    _open_findings: data._open_findings,
    _last_execution: data._last_execution,
  }
}

export function buildPendingExecution(
  data: Pick<Execution, 'checklist_id' | 'machine_id' | 'priority' | 'scheduled_at' | 'assigned_to'>
): Execution {
  const timestamp = nowIso()
  const organization = getDemoOrganization()

  return {
    id: `exec-${Date.now()}`,
    org_id: organization.id,
    checklist_id: data.checklist_id,
    machine_id: data.machine_id,
    assigned_to: data.assigned_to,
    status: 'pending',
    priority: data.priority,
    scheduled_at: data.scheduled_at,
    metadata: {},
    created_at: timestamp,
    updated_at: timestamp,
  }
}
