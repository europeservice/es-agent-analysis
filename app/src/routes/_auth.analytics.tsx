import { createRoute } from '@tanstack/react-router'
import { Route as authRoute } from './_auth'
import { AnalyticsPage } from '@/features/analytics/components/AnalyticsPage'

export const Route = createRoute({
  getParentRoute: () => authRoute,
  path: '/analytics',
  component: AnalyticsPage,
})
