import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { AuthContext, useAuthProvider } from '@/hooks/useAuth'
import './index.css'

// Route imports
import { Route as rootRoute } from '@/routes/__root'
import { Route as indexRoute } from '@/routes/index'
import { Route as loginRoute } from '@/routes/login'
import { Route as authRoute } from '@/routes/_auth'
import { Route as contactsRoute } from '@/routes/_auth.contacts'
import { Route as leadsRoute } from '@/routes/_auth.leads'
import { Route as dealsRoute } from '@/routes/_auth.deals'
import { Route as vacanciesRoute } from '@/routes/_auth.vacancies'
import { Route as paymentsRoute } from '@/routes/_auth.payments'
import { Route as analyticsRoute } from '@/routes/_auth.analytics'

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  authRoute.addChildren([
    contactsRoute,
    leadsRoute,
    dealsRoute,
    vacanciesRoute,
    paymentsRoute,
    analyticsRoute,
  ]),
])

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,      // 1 min
      retry: 1,
    },
  },
})

const router = createRouter({
  routeTree,
  context: {
    auth: {
      user: null,
      role: null,
      loading: true,
      signIn: async () => ({ error: null }),
      signOut: async () => {},
    },
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  const auth = useAuthProvider()
  return (
    <AuthContext.Provider value={auth}>
      <RouterProvider router={router} context={{ auth }} />
    </AuthContext.Provider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
