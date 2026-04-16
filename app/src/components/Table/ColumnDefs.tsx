import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import type { Candidate } from '@/types/candidate'
import { COLUMNS, STATUS_COLORS, FINANCIAL_COLUMNS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

const helper = createColumnHelper<Candidate>()

export function getColumnDefs(
  isFinancialVisible: boolean,
  onEdit: (c: Candidate) => void,
  onDelete: (c: Candidate) => void,
): ColumnDef<Candidate, unknown>[] {
  const dataCols = COLUMNS
    .filter((col) => !col.financial || isFinancialVisible)
    .map((col) =>
      helper.accessor(col.key as keyof Candidate, {
        id: col.key,
        header: col.label,
        enableSorting: col.sortable ?? false,
        cell: (info) => {
          const val = info.getValue()
          if (val == null || val === '') return <span className="text-gray-600">—</span>
          if (col.type === 'boolean') {
            return (val as boolean)
              ? <span className="text-green-400 text-xs">✓</span>
              : <span className="text-gray-600 text-xs">✗</span>
          }
          if (col.type === 'date') return formatDate(val as string)
          if (col.key === 'status_adm') {
            const color = STATUS_COLORS[val as string] ?? ''
            return (
              <span className={`inline-block px-1.5 py-0.5 text-xs rounded ${color}`}>
                {val as string}
              </span>
            )
          }
          if ((FINANCIAL_COLUMNS as readonly string[]).includes(col.key)) {
            return <span className="text-accent2 font-mono text-xs">{String(val)}</span>
          }
          return String(val)
        },
      })
    )

  const actionCol = helper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(row.original)}
          className="text-xs text-accent hover:text-accent/80 transition-colors"
        >
          Ред.
        </button>
        <button
          onClick={() => onDelete(row.original)}
          className="text-xs text-red-500 hover:text-red-400 transition-colors"
        >
          Вид.
        </button>
      </div>
    ),
  })

  return [...dataCols, actionCol] as ColumnDef<Candidate, unknown>[]
}
