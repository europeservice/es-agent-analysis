import { Outlet } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from './Sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/permissions'
import { LogOut } from 'lucide-react'

export function AppLayout() {
  const { user, role, signOut } = useAuth()

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="h-11 bg-surface border-b border-border flex items-center justify-end px-4 gap-3 shrink-0">
          {role && (
            <Badge className={ROLE_COLORS[role]}>
              {ROLE_LABELS[role]}
            </Badge>
          )}
          <span className="text-xs text-gray-500">{user?.email}</span>
          <Button variant="ghost" size="icon" onClick={signOut} title="Вийти">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
