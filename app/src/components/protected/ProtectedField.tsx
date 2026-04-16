import { usePermissions } from '@/hooks/usePermissions'
import type { Resource, Action } from '@/lib/permissions'

interface Props {
  resource: Resource
  action: Action
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Renders children only if the current user has permission.
 * Use for hiding financial fields, action buttons, etc.
 *
 * @example
 * <ProtectedField resource="payments" action="read">
 *   <PaymentAmount value={deal.amount} />
 * </ProtectedField>
 */
export function ProtectedField({ resource, action, children, fallback = null }: Props) {
  const { can } = usePermissions()
  return can(resource, action) ? <>{children}</> : <>{fallback}</>
}
