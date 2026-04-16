export type Role = 'director' | 'financier' | 'admin' | 'manager'
export type Resource = 'contacts' | 'leads' | 'deals' | 'vacancies' | 'payments' | 'analytics' | 'settings'
export type Action = 'read' | 'write' | 'delete'

const ALL: Role[] = ['director', 'financier', 'admin', 'manager']
const SENIOR: Role[] = ['director', 'admin', 'financier']
const MANAGERS: Role[] = ['director', 'admin']

export const PERMISSIONS: Record<Resource, Record<Action, Role[]>> = {
  contacts:  { read: ALL,    write: SENIOR,   delete: ['director'] },
  leads:     { read: ALL,    write: ALL,       delete: MANAGERS },
  deals:     { read: ALL,    write: ALL,       delete: MANAGERS },
  vacancies: { read: ALL,    write: MANAGERS,  delete: ['director'] },
  payments:  {
    read:   ['director', 'financier'],
    write:  ['director', 'financier'],
    delete: ['director'],
  },
  analytics: { read: SENIOR, write: [],        delete: [] },
  settings:  { read: SENIOR, write: MANAGERS,  delete: ['director'] },
}

export function can(role: Role | null | undefined, resource: Resource, action: Action): boolean {
  if (!role) return false
  return PERMISSIONS[resource][action].includes(role)
}

export const ROLE_LABELS: Record<Role, string> = {
  director:  'Директор',
  financier: 'Фінансист',
  admin:     'Адмін',
  manager:   'Менеджер',
}

export const ROLE_COLORS: Record<Role, string> = {
  director:  'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  financier: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
  admin:     'bg-gray-700/40 text-gray-300 border-gray-600',
  manager:   'bg-blue-500/10 text-blue-300 border-blue-500/30',
}
