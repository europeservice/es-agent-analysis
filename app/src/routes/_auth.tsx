import { createRoute, redirect } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { AppLayout } from '@/components/layout/AppLayout'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  id: '_auth',
  beforeLoad: ({ context }) => {
    if (!context.auth.loading && !context.auth.user) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})
