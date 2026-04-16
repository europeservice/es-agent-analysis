import { useEffect, useState } from 'react'
import { useUpdateDeal } from '../api/mutations'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { can } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { X, ChevronRight } from 'lucide-react'
import type { Deal } from '../types'
import { STATUS_OPTIONS, PAYMENT_TYPE_OPTIONS, TRANSPORT_OPTIONS } from '../types'

interface PipelineStage {
  id: string
  name: string
  order_pos: number
  is_success: boolean
  is_failure: boolean
}

interface Props {
  deal: Deal | null
  open: boolean
  onClose: () => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 px-4 border-b border-gray-100 last:border-0">
      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</span>
      <div className="text-sm text-gray-800 font-medium">{children}</div>
    </div>
  )
}

function EditableField({
  label, value, onSave, type = 'text',
}: {
  label: string
  value: string | null | undefined
  onSave: (v: string) => void
  type?: string
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value ?? '')

  useEffect(() => { setVal(value ?? '') }, [value])

  return (
    <div className="flex flex-col gap-0.5 py-2.5 px-4 border-b border-gray-100 last:border-0">
      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</span>
      {editing ? (
        <input
          autoFocus
          type={type}
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={() => { onSave(val); setEditing(false) }}
          onKeyDown={e => { if (e.key === 'Enter') { onSave(val); setEditing(false) } if (e.key === 'Escape') setEditing(false) }}
          className="text-sm text-gray-800 font-medium bg-blue-50 border border-blue-200 rounded px-1 py-0.5 outline-none"
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          className="text-sm text-gray-800 font-medium cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 -ml-1 transition-colors"
        >
          {value || <span className="text-gray-300 italic">—</span>}
        </span>
      )}
    </div>
  )
}

function SelectField({
  label, value, options, onSave,
}: {
  label: string
  value: string | null | undefined
  options: readonly string[]
  onSave: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 px-4 border-b border-gray-100 last:border-0">
      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</span>
      <select
        value={value ?? ''}
        onChange={e => onSave(e.target.value)}
        className="text-sm text-gray-800 font-medium bg-transparent border-none outline-none cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 -ml-1 transition-colors"
      >
        <option value="">—</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export function DealCard({ deal, open, onClose }: Props) {
  const { role } = useAuth()
  const showFinancial = can(role, 'payments', 'read')
  const canEdit = can(role, 'deals', 'write')
  const updateDeal = useUpdateDeal()

  const [stages, setStages] = useState<PipelineStage[]>([])
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([])
  const [partners, setPartners] = useState<{ id: string; number: string; name: string }[]>([])

  useEffect(() => {
    supabase
      .from('pipeline_stages')
      .select('id, name, order_pos, is_success, is_failure')
      .eq('pipeline_id', '00000000-0000-0000-0000-000000000001')
      .order('order_pos')
      .then(({ data }) => setStages(data ?? []))

    supabase.from('branches').select('id, name').then(({ data }) => setBranches(data ?? []))
    supabase.from('partners').select('id, number, name').order('number').then(({ data }) => setPartners(data ?? []))
  }, [])

  if (!open || !deal) return null

  async function save(field: string, value: string | boolean | null) {
    if (!deal) return
    await updateDeal.mutateAsync({ id: deal.id, values: { [field]: value || null } })
  }

  const currentStageIdx = stages.findIndex(s => s.id === deal.stage_id)

  const contact = deal.contact
  const payment = deal.payments?.[0]

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-3xl h-full bg-white flex flex-col shadow-2xl">

        {/* ── Pipeline ── */}
        <div className="flex items-center overflow-x-auto bg-white border-b border-gray-200 shrink-0 px-2 py-2 gap-0 scrollbar-none">
          {stages.map((stage, i) => {
            const isDone = currentStageIdx > i
            const isActive = currentStageIdx === i
            const isFailure = stage.is_failure
            return (
              <button
                key={stage.id}
                onClick={() => canEdit && save('stage_id', stage.id)}
                title={stage.name}
                className={[
                  'flex items-center justify-center h-8 px-3 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap shrink-0 transition-colors',
                  'clip-path-chevron',
                  i === 0 ? 'rounded-l' : '',
                  isActive
                    ? isFailure ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
                    : isDone
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200',
                ].join(' ')}
                style={{
                  clipPath: i === 0
                    ? 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)'
                    : i === stages.length - 1
                      ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 8px 50%)'
                      : 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%, 8px 50%)',
                  marginLeft: i === 0 ? 0 : 2,
                }}
              >
                {stage.name}
              </button>
            )
          })}
        </div>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {contact ? `${contact.last_name} ${contact.first_name}` : 'Угода'}
            </h2>
            {contact?.phone && (
              <span className="text-sm text-gray-500">{contact.phone}</span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 divide-x divide-gray-100">

            {/* Ліва колонка — угода */}
            <div>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Угода</span>
              </div>

              {/* Філія */}
              <div className="flex flex-col gap-0.5 py-2.5 px-4 border-b border-gray-100">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Філія</span>
                <select
                  value={deal.branch_id ?? ''}
                  onChange={e => canEdit && save('branch_id', e.target.value)}
                  disabled={!canEdit}
                  className="text-sm text-gray-800 font-medium bg-transparent border-none outline-none cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 -ml-1"
                >
                  <option value="">—</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              {/* Партнер */}
              <div className="flex flex-col gap-0.5 py-2.5 px-4 border-b border-gray-100">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Партнер</span>
                <select
                  value={deal.partner_id ?? ''}
                  onChange={e => canEdit && save('partner_id', e.target.value)}
                  disabled={!canEdit}
                  className="text-sm text-gray-800 font-medium bg-transparent border-none outline-none cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 -ml-1"
                >
                  <option value="">—</option>
                  {partners.map(p => <option key={p.id} value={p.id}>№{p.number} {p.name}</option>)}
                </select>
              </div>

              <SelectField
                label="Статус (Adm)"
                value={deal.status_adm}
                options={STATUS_OPTIONS}
                onSave={v => canEdit && save('status_adm', v)}
              />
              <SelectField
                label="Вид оплати"
                value={deal.payment_type}
                options={PAYMENT_TYPE_OPTIONS}
                onSave={v => canEdit && save('payment_type', v)}
              />
              <SelectField
                label="Доїзд"
                value={deal.transport}
                options={TRANSPORT_OPTIONS}
                onSave={v => canEdit && save('transport', v)}
              />
              <EditableField label="Дата реєстрації" value={deal.registration_date} type="date" onSave={v => canEdit && save('registration_date', v)} />
              <EditableField label="Дата заїзду" value={deal.arrival_date} type="date" onSave={v => canEdit && save('arrival_date', v)} />
              <EditableField label="Країна роботи" value={deal.vacancy_country} onSave={v => canEdit && save('vacancy_country', v)} />
              <EditableField label="Назва проекту" value={deal.project_name} onSave={v => canEdit && save('project_name', v)} />
              <EditableField label="Синхронер" value={deal.synchronizer} onSave={v => canEdit && save('synchronizer', v)} />
              <EditableField label="Група" value={deal.group_id} onSave={v => canEdit && save('group_id', v)} />

              {/* Якісна подача */}
              <div className="flex items-center gap-3 py-2.5 px-4 border-b border-gray-100">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Якісна подача</span>
                <input
                  type="checkbox"
                  checked={deal.quality_submission ?? false}
                  onChange={e => canEdit && save('quality_submission', String(e.target.checked))}
                  disabled={!canEdit}
                  className="h-4 w-4 accent-blue-600"
                />
              </div>
            </div>

            {/* Права колонка — кандидат + фінанси */}
            <div>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Кандидат</span>
              </div>

              <Field label="ПІБ">
                {contact ? `${contact.last_name} ${contact.first_name}` : '—'}
              </Field>
              <Field label="Телефон">{contact?.phone ?? '—'}</Field>
              <Field label="Вік">{contact?.age ?? '—'}</Field>
              <Field label="Країна кандидата">{contact?.candidate_country ?? '—'}</Field>

              {showFinancial && (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 mt-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Фінанси</span>
                  </div>
                  <Field label="Сума виплати">
                    {payment?.amount != null ? `${Number(payment.amount).toFixed(2)} грн` : '—'}
                  </Field>
                  <Field label="Статус виплати">{payment?.status ?? '—'}</Field>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100 shrink-0 bg-gray-50">
          <Button variant="outline" size="sm" onClick={onClose}>Закрити</Button>
        </div>
      </div>
    </div>
  )
}
