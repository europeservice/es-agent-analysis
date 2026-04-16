import { createRoute } from '@tanstack/react-router'
import { Route as authRoute } from './_auth'
import { ContactsPage } from '@/features/contacts/components/ContactsPage'

export const Route = createRoute({
  getParentRoute: () => authRoute,
  path: '/contacts',
  component: ContactsPage,
})
