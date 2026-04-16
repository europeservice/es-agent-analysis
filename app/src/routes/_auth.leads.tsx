import { createRoute } from '@tanstack/react-router'
import { Route as authRoute } from './_auth'
import { LeadsPage } from '@/features/leads/components/LeadsPage'

export const Route = createRoute({
  getParentRoute: () => authRoute,
  path: '/leads',
  component: LeadsPage,
})
