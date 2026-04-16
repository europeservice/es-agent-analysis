import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { AuthContextValue } from '@/hooks/useAuth'

interface RouterContext {
  auth: AuthContextValue
}

// Re-export type for use in route files
export type { RouterContext }

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
})
