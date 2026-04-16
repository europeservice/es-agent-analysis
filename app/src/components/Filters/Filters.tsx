import { useTableStore } from '@/store/tableStore'
import { STATUS_OPTIONS } from '@/lib/constants'

export function Filters() {
  const { filters, search, setFilter, setSearch, resetFilters } = useTableStore()

  const hasActive = search || Object.values(filters).some(Boolean)

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-surface border-b border-border">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Пошук по імені, телефону..."
        className="bg-surface2 border border-border rounded px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent w-52"
      />

      {/* Branch filter */}
      <input
        type="text"
        value={filters.branch ?? ''}
        onChange={(e) => setFilter('branch', e.target.value)}
        placeholder="Філія"
        className="bg-surface2 border border-border rounded px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent w-28"
      />

      {/* Status filter */}
      <select
        value={filters.status_adm ?? ''}
        onChange={(e) => setFilter('status_adm', e.target.value)}
        className="bg-surface2 border border-border rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent"
      >
        <option value="">Всі статуси</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Vacancy country */}
      <input
        type="text"
        value={filters.vacancy_country ?? ''}
        onChange={(e) => setFilter('vacancy_country', e.target.value)}
        placeholder="Країна вакансії"
        className="bg-surface2 border border-border rounded px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent w-36"
      />

      {/* Date range */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500">Реєстрація:</span>
        <input
          type="date"
          value={filters.registration_date_from ?? ''}
          onChange={(e) => setFilter('registration_date_from', e.target.value)}
          className="bg-surface2 border border-border rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
        />
        <span className="text-gray-600 text-xs">—</span>
        <input
          type="date"
          value={filters.registration_date_to ?? ''}
          onChange={(e) => setFilter('registration_date_to', e.target.value)}
          className="bg-surface2 border border-border rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
        />
      </div>

      {/* Reset */}
      {hasActive && (
        <button
          onClick={resetFilters}
          className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1.5 border border-border rounded transition-colors"
        >
          Скинути
        </button>
      )}
    </div>
  )
}
