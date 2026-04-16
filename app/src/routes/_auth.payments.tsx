import { createRoute } from '@tanstack/react-router'
import { Route as authRoute } from './_auth'
import { PaymentsPage } from '@/features/payments/components/PaymentsPage'

export const Route = createRoute({
  getParentRoute: () => authRoute,
  path: '/payments',
  component: PaymentsPage,
})
