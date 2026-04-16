import { Link, useRouterState } from '@tanstack/react-router'
import {
  Users, Funnel, Handshake, Briefcase, CreditCard, BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePermissions } from '@/hooks/usePermissions'

const NAV = [
  { to: '/contacts', label: 'Контакти',  icon: Users,     resource: 'contacts'  },
  { to: '/leads',    label: 'Ліди',       icon: Funnel,    resource: 'leads'     },
  { to: '/deals',    label: 'Угоди',      icon: Handshake, resource: 'deals'     },
  { to: '/vacancies',label: 'Вакансії',   icon: Briefcase, resource: 'vacancies' },
  { to: '/payments', label: 'Фінанси',    icon: CreditCard,resource: 'payments'  },
  { to: '/analytics',label: 'Аналітика',  icon: BarChart3, resource: 'analytics' },
] as const

export function Sidebar() {
  const { can } = usePermissions()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  return (
    <aside className="w-52 min-w-52 bg-surface border-r border-border flex flex-col">
      <div className="px-4 py-4 border-b border-border">
        <span className="font-mono font-semibold text-white text-sm tracking-tight">
          EuropeService
        </span>
        <span className="block text-xs text-gray-600 font-mono">CRM v2</span>
      </div>

      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {NAV.map(({ to, label, icon: Icon, resource }) => {
          if (!can(resource, 'read')) return null
          const active = pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors',
                active
                  ? 'bg-accent/15 text-accent'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface2'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
