import { createRoute } from '@tanstack/react-router'
import { Route as authRoute } from './_auth'
import { DealsPage } from '@/features/deals/components/DealsPage'

export const Route = createRoute({
  getParentRoute: () => authRoute,
  path: '/deals',
  component: DealsPage,
})
