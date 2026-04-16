import { useAuth } from './useAuth'
import { can, type Resource, type Action } from '@/lib/permissions'

export function usePermissions() {
  const { role } = useAuth()
  return {
    role,
    can: (resource: Resource, action: Action) => can(role, resource, action),
  }
}
