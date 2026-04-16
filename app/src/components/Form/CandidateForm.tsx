import { useState, useEffect, type FormEvent } from 'react'
import { COLUMNS, FINANCIAL_COLUMNS } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'
import { useCreateCandidate, useUpdateCandidate } from '@/hooks/useCandidateMutations'
import type { Candidate, CandidateInsert } from '@/types/candidate'

type FormData = Record<string, string | boolean>

function buildEmptyForm(): FormData {
  return COLUMNS.reduce<FormData>((acc, col) => {
    acc[col.key] = col.type === 'boolean' ? false : ''
    return acc
  }, {})
}

interface Props {
  candidate: Candidate | null
  onClose: () => void
}

export function CandidateForm({ candidate, onClose }: Props) {
  const { isFinancialVisible } = useAuth()
  const createMutation = useCreateCandidate()
  const updateMutation = useUpdateCandidate()

  const [form, setForm] = useState<FormData>(buildEmptyForm)
  const [error, setError] = useState('')

  const isLoading = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (candidate) {
      const data = COLUMNS.reduce<FormData>((acc, col) => {
        const val = candidate[col.key as keyof Candidate]
        if (val == null) {
          acc[col.key] = col.type === 'boolean' ? false : ''
        } else if (col.type === 'boolean') {
          acc[col.key] = Boolean(val)
        } else {
          acc[col.key] = String(val)
        }
        return acc
      }, {})
      setForm(data)
    }
  }, [candidate])

  const visibleColumns = COLUMNS.filter(
    (col) => isFinancialVisible || !(FINANCIAL_COLUMNS as readonly string[]).includes(col.key)
  )

  function handleChange(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    // Build payload: empty strings → null, numbers converted
    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => {
        if (v === '') return [k, null]
        if (k === 'age' || k === 'payment_amount') return [k, Number(v) || null]
        return [k, v]
      })
    ) as unknown as CandidateInsert

    try {
      if (candidate) {
        await updateMutation.mutateAsync({ id: candidate.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка збереження')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            {candidate ? 'Редагувати кандидата' : 'Новий кандидат'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg transition-colors">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visibleColumns.map((col) => (
              <div
                key={col.key}
                className={col.type === 'boolean' ? 'flex items-center gap-2 sm:col-span-2' : ''}
              >
                {col.type === 'boolean' ? (
                  <>
                    <input
                      type="checkbox"
                      id={col.key}
                      checked={!!form[col.key]}
                      onChange={(e) => handleChange(col.key, e.target.checked)}
                      className="w-4 h-4 accent-accent rounded"
                    />
                    <label htmlFor={col.key} className="text-sm text-gray-300">
                      {col.label}
                    </label>
                  </>
                ) : (
                  <>
                    <label className="block text-xs text-gray-400 mb-1">
                      {col.label}
                      {(col.key === 'first_name' || col.key === 'last_name') && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {col.type === 'select' ? (
                      <select
                        value={(form[col.key] as string) ?? ''}
                        onChange={(e) => handleChange(col.key, e.target.value)}
                        className="w-full bg-surface2 border border-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                      >
                        <option value="">—</option>
                        {col.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={
                          col.type === 'number' ? 'number'
                          : col.type === 'date' ? 'date'
                          : 'text'
                        }
                        value={(form[col.key] as string) ?? ''}
                        onChange={(e) => handleChange(col.key, e.target.value)}
                        required={col.key === 'first_name' || col.key === 'last_name'}
                        className="w-full bg-surface2 border border-border rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent"
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-400 mt-4 bg-red-900/20 border border-red-800/40 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 border border-border rounded hover:border-gray-500 transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-accent hover:bg-accent/90 text-white rounded disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
