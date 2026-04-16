import { createRoute } from '@tanstack/react-router'
import { Route as authRoute } from './_auth'
import { VacanciesPage } from '@/features/vacancies/components/VacanciesPage'

export const Route = createRoute({
  getParentRoute: () => authRoute,
  path: '/vacancies',
  component: VacanciesPage,
})
