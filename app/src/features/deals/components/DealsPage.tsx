import { useState } from 'react'
import { useDeals, type DealsFilter } from '../api/queries'
import { useCreateDeal } from '../api/mutations'
import { DealsTable } from './DealsTable'
import { DealCard } from './DealCard'
import { DealForm } from './DealForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProtectedField } from '@/components/protected/ProtectedField'
import { useAuth } from '@/hooks/useAuth'
import { can } from '@/lib/permissions'
import { Plus, Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { STATUS_OPTIONS } from '../types'
import type { Deal } from '../types'

const PAGE_SIZE = 50

export function DealsPage() {
  const { role } = useAuth()
  const showFinancial = can(role, 'payments', 'read')

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState<Deal | null>(null)

  const [filters, setFilters] = useState<Omit<DealsFilter, 'search' | 'page' | 'pageSize'>>({})

  const { data, isLoading } = useDeals({
    search: debouncedSearch,
    page,
    pageSize: PAGE_SIZE,
    ...filters,
  })

  const createDeal = useCreateDeal()

  function setFilter(key: keyof typeof filters, value: string) {
    setFilters(prev => ({ ...prev, [key]: value || undefined }))
    setPage(0)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <div className="relative min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="Пошук за ПІБ або телефоном…"
            className="pl-8 h-8"
          />
        </div>

        {/* Фільтр статусу */}
        <select
          value={filters.status ?? ''}
          onChange={e => setFilter('status', e.target.value)}
          className="h-8 px-2 rounded-md bg-surface2 border border-border text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Всі статуси</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Фільтр дати реєстрації */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>Реєстрація:</span>
          <input
            type="date"
            value={filters.registration_from ?? ''}
            onChange={e => setFilter('registration_from', e.target.value)}
            className="h-8 px-2 rounded-md bg-surface2 border border-border text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span>—</span>
          <input
            type="date"
            value={filters.registration_to ?? ''}
            onChange={e => setFilter('registration_to', e.target.value)}
            className="h-8 px-2 rounded-md bg-surface2 border border-border text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Скинути */}
        {(filters.status || filters.registration_from || filters.registration_to) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setFilters({}); setPage(0) }}
            className="text-xs text-gray-500 h-8"
          >
            Скинути
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500">{data?.count ?? 0} угод</span>
          <ProtectedField resource="deals" action="write">
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Нова угода
            </Button>
          </ProtectedField>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <DealsTable
          data={data?.data ?? []}
          count={data?.count ?? 0}
          page={page}
          pageSize={PAGE_SIZE}
          loading={isLoading}
          showFinancial={showFinancial}
          onPageChange={setPage}
          onRowClick={setSelected}
        />
      </div>

      {/* Deal Card */}
      <DealCard
        deal={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />

      {/* Create deal dialog */}
      <Dialog open={creating} onOpenChange={v => { if (!v) setCreating(false) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Нова угода</DialogTitle>
          </DialogHeader>
          <DealForm
            onSubmit={async values => {
              await createDeal.mutateAsync(values)
              setCreating(false)
            }}
            onCancel={() => setCreating(false)}
            submitLabel="Створити угоду"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
