import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useCandidates } from '@/hooks/useCandidates'
import { useDeleteCandidate } from '@/hooks/useCandidateMutations'
import { useAuth } from '@/hooks/useAuth'
import { useTableStore, PAGE_SIZE } from '@/store/tableStore'
import { getColumnDefs } from './ColumnDefs'
import { CandidateForm } from '@/components/Form/CandidateForm'
import { Filters } from '@/components/Filters/Filters'
import type { Candidate } from '@/types/candidate'

export function CandidatesTable() {
  const { isFinancialVisible } = useAuth()
  const { page, sort, filters, search, setPage } = useTableStore()

  const { data, isFetching } = useCandidates({ page, sort, filters, search })
  const deleteMutation = useDeleteCandidate()

  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null)
  const [showForm, setShowForm] = useState(false)

  const candidates = data?.data ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  function handleEdit(c: Candidate) {
    setEditCandidate(c)
    setShowForm(true)
  }

  function handleDelete(c: Candidate) {
    if (window.confirm(`Видалити ${c.first_name} ${c.last_name}?`)) {
      deleteMutation.mutate(c.id)
    }
  }

  const columns = useMemo(
    () => getColumnDefs(isFinancialVisible, handleEdit, handleDelete),
    [isFinancialVisible]
  )

  const table = useReactTable({
    data: candidates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: totalPages,
  })

  const { setSort } = useTableStore()

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white">Кандидати</span>
          <span className="text-xs text-gray-500 font-mono">
            {isFetching ? 'завантаження...' : `${totalCount} записів`}
          </span>
        </div>
        <button
          onClick={() => { setEditCandidate(null); setShowForm(true) }}
          className="text-xs bg-accent hover:bg-accent/90 text-white px-3 py-1.5 rounded transition-colors"
        >
          + Додати
        </button>
      </div>

      <Filters />

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-surface border-b border-border">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const isSorted = sort.column === header.column.id
                  return (
                    <th
                      key={header.id}
                      onClick={canSort ? () => setSort(header.column.id) : undefined}
                      className={`text-left px-3 py-2 text-gray-400 font-medium whitespace-nowrap select-none ${canSort ? 'cursor-pointer hover:text-white' : ''}`}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {isSorted && (
                        <span className="ml-1 text-accent">
                          {sort.order === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/50 hover:bg-surface2/60 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 text-gray-300 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {candidates.length === 0 && !isFetching && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-600"
                >
                  Записів не знайдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-gray-400">
        <span>
          Сторінка {page + 1} з {totalPages || 1}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setPage(0)}
            disabled={page === 0}
            className="px-2 py-1 border border-border rounded disabled:opacity-30 hover:border-accent transition-colors"
          >
            «
          </button>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="px-2 py-1 border border-border rounded disabled:opacity-30 hover:border-accent transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="px-2 py-1 border border-border rounded disabled:opacity-30 hover:border-accent transition-colors"
          >
            ›
          </button>
          <button
            onClick={() => setPage(totalPages - 1)}
            disabled={page >= totalPages - 1}
            className="px-2 py-1 border border-border rounded disabled:opacity-30 hover:border-accent transition-colors"
          >
            »
          </button>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <CandidateForm
          candidate={editCandidate}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
