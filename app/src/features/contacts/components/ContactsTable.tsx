import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import type { Contact } from '../types'

interface Props {
  data: Contact[]
  count: number
  page: number
  pageSize: number
  loading: boolean
  onPageChange: (page: number) => void
  onRowClick: (contact: Contact) => void
}

const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: 'last_name',
    header: "Прізвище",
    cell: info => <span className="font-medium text-white">{info.getValue<string>()}</span>,
  },
  {
    accessorKey: 'first_name',
    header: 'Імʼя',
  },
  {
    accessorKey: 'phone',
    header: 'Телефон',
    cell: info => info.getValue<string>() ?? '—',
  },
  {
    accessorKey: 'candidate_country',
    header: 'Країна',
    cell: info => info.getValue<string>() ?? '—',
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: info => info.getValue<string>() ?? '—',
  },
  {
    accessorKey: 'created_at',
    header: 'Додано',
    cell: info => new Date(info.getValue<string>()).toLocaleDateString('uk-UA'),
  },
]

export function ContactsTable({ data, count, page, pageSize, loading, onPageChange, onRowClick }: Props) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(count / pageSize),
  })

  const totalPages = Math.ceil(count / pageSize)

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface border-b border-border">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    className="text-left px-3 py-2 text-xs text-gray-500 font-medium whitespace-nowrap"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-gray-500 text-sm">
                  Нічого не знайдено
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="border-b border-border hover:bg-surface2 cursor-pointer transition-colors"
                  onClick={() => onRowClick(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-3 py-2.5 text-gray-300 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border shrink-0">
          <span className="text-xs text-gray-500">
            {count} контактів • сторінка {page + 1} з {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
            >
              →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
