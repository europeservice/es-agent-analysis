import { Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const ROLE_LABELS: Record<string, string> = {
  head_admin: 'Головний адмін',
  financier: 'Фінансист',
  admin: 'Адмін',
}

const ROLE_COLORS: Record<string, string> = {
  head_admin: 'bg-accent/20 text-indigo-300 border-accent/40',
  financier: 'bg-accent2/10 text-teal-300 border-accent2/30',
  admin: 'bg-gray-700/40 text-gray-300 border-gray-600',
}

export function Layout() {
  const { user, role, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-bg text-white font-sans">
      <header className="bg-surface border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="font-mono font-semibold text-white text-sm">EuropeService</span>
          <span className="text-gray-600 text-xs font-mono">CRM</span>
        </div>

        <div className="flex items-center gap-3">
          {role && (
            <span className={`text-xs px-2 py-0.5 rounded border font-mono ${ROLE_COLORS[role] ?? ''}`}>
              {ROLE_LABELS[role] ?? role}
            </span>
          )}
          <span className="text-xs text-gray-400">{user?.email}</span>
          <button
            onClick={signOut}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Вийти
          </button>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
