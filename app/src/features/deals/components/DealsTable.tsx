import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import type { Deal } from '../types'

const STATUS_COLORS: Record<string, string> = {
  'Новий':     'border-l-2 border-blue-500',
  'В роботі':  'border-l-2 border-yellow-500',
  'Документи': 'border-l-2 border-purple-500',
  'Заїхав':    'border-l-2 border-green-500',
  'Відмова':   'border-l-2 border-red-500',
  'Архів':     'border-l-2 border-gray-500',
}

interface Props {
  data: Deal[]
  count: number
  page: number
  pageSize: number
  loading: boolean
  showFinancial: boolean
  onPageChange: (page: number) => void
  onRowClick: (deal: Deal) => void
}

function buildColumns(showFinancial: boolean): ColumnDef<Deal>[] {
  const cols: ColumnDef<Deal>[] = [
    {
      id: 'branch',
      header: 'Філія',
      cell: ({ row }) => row.original.branch?.name ?? '—',
    },
    {
      id: 'name',
      header: 'ПІБ',
      cell: ({ row }) => {
        const c = row.original.contact
        if (!c) return '—'
        return <span className="font-medium text-white">{c.last_name} {c.first_name}</span>
      },
    },
    {
      id: 'phone',
      header: 'Телефон',
      cell: ({ row }) => row.original.contact?.phone ?? '—',
    },
    {
      id: 'age',
      header: 'Вік',
      cell: ({ row }) => row.original.contact?.age ?? '—',
    },
    {
      id: 'candidate_country',
      header: 'Країна канд.',
      cell: ({ row }) => row.original.contact?.candidate_country ?? '—',
    },
    {
      accessorKey: 'vacancy_country',
      header: 'Країна роботи',
      cell: info => info.getValue<string>() ?? '—',
    },
    {
      accessorKey: 'project_name',
      header: 'Проект',
      cell: info => info.getValue<string>() ?? '—',
    },
    {
      id: 'partner',
      header: 'Партнер №',
      cell: ({ row }) => row.original.partner?.number ?? '—',
    },
    {
      accessorKey: 'registration_date',
      header: 'Реєстрація',
      cell: info => info.getValue<string>() ?? '—',
    },
    {
      accessorKey: 'arrival_date',
      header: 'Заїзд',
      cell: info => info.getValue<string>() ?? '—',
    },
    {
      accessorKey: 'transport',
      header: 'Доїзд',
      cell: info => info.getValue<string>() ?? '—',
    },
    {
      accessorKey: 'payment_type',
      header: 'Вид оплати',
      cell: info => info.getValue<string>() ?? '—',
    },
    {
      accessorKey: 'status_adm',
      header: 'Статус',
      cell: info => {
        const v = info.getValue<string>() ?? '—'
        return <span className="text-xs font-medium">{v}</span>
      },
    },
    {
      accessorKey: 'quality_submission',
      header: 'Якісна',
      cell: info => info.getValue<boolean>() ? 'Так' : '—',
    },
  ]

  if (showFinancial) {
    cols.push(
      {
        id: 'payment_amount',
        header: 'Сума',
        cell: ({ row }) => {
          const p = row.original.payments?.[0]
          return p?.amount != null ? `${Number(p.amount).toFixed(0)} грн` : '—'
        },
      },
      {
        id: 'payment_status',
        header: 'Статус оплати',
        cell: ({ row }) => row.original.payments?.[0]?.status ?? '—',
      },
    )
  }

  return cols
}

export function DealsTable({ data, count, page, pageSize, loading, showFinancial, onPageChange, onRowClick }: Props) {
  const columns = buildColumns(showFinancial)

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
                  className={`border-b border-border hover:bg-surface2 cursor-pointer transition-colors ${STATUS_COLORS[row.original.status_adm ?? ''] ?? ''}`}
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
            {count} угод • сторінка {page + 1} з {totalPages}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 0}>←</Button>
            <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>→</Button>
          </div>
        </div>
      )}
    </div>
  )
}
