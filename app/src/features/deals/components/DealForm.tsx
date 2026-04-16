import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { dealSchema, type DealFormValues, STATUS_OPTIONS, PAYMENT_TYPE_OPTIONS, TRANSPORT_OPTIONS } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

interface Branch { id: string; name: string }
interface Partner { id: string; number: string; name: string }
interface Contact { id: string; first_name: string; last_name: string; phone?: string | null }

interface Props {
  initial?: Partial<DealFormValues>
  onSubmit: (values: DealFormValues) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

function Field({ label, name, register, error, type = 'text' }: {
  label: string
  name: string
  register: ReturnType<typeof useForm>['register']
  error?: string
  type?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <Input type={type} {...(register as (name: string) => object)(name)} className="h-8" />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

export function DealForm({ initial, onSubmit, onCancel, submitLabel = 'Зберегти' }: Props) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactSearch, setContactSearch] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: initial ?? {},
  })

  useEffect(() => {
    supabase.from('branches').select('id, name').then(({ data }) => setBranches(data ?? []))
    supabase.from('partners').select('id, number, name').order('number').then(({ data }) => setPartners(data ?? []))
  }, [])

  useEffect(() => {
    if (contactSearch.length < 2) return
    supabase
      .from('contacts')
      .select('id, first_name, last_name, phone')
      .or(`last_name.ilike.%${contactSearch}%,first_name.ilike.%${contactSearch}%,phone.ilike.%${contactSearch}%`)
      .limit(20)
      .then(({ data }) => setContacts(data ?? []))
  }, [contactSearch])

  const onValid = async (values: DealFormValues) => {
    await onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-4">
      {/* Контакт */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Кандидат</label>
        <input
          type="text"
          placeholder="Пошук за ПІБ або телефоном..."
          value={contactSearch}
          onChange={e => setContactSearch(e.target.value)}
          className="h-8 px-3 rounded-md bg-surface2 border border-border text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {contacts.length > 0 && (
          <div className="border border-border rounded-md bg-surface2 max-h-32 overflow-y-auto">
            {contacts.map(c => (
              <button
                key={c.id}
                type="button"
                className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-surface transition-colors"
                onClick={() => {
                  setContactSearch(`${c.last_name} ${c.first_name}`)
                  setContacts([])
                  ;(register('contact_id') as { onChange: (e: { target: { value: string } }) => void }).onChange({ target: { value: c.id } })
                }}
              >
                {c.last_name} {c.first_name} {c.phone ? `• ${c.phone}` : ''}
              </button>
            ))}
          </div>
        )}
        <input type="hidden" {...register('contact_id')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Філія */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Філія</label>
          <select {...register('branch_id')} className="h-8 px-3 rounded-md bg-surface2 border border-border text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">— оберіть —</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {/* Партнер */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Партнер</label>
          <select {...register('partner_id')} className="h-8 px-3 rounded-md bg-surface2 border border-border text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">— оберіть —</option>
            {partners.map(p => <option key={p.id} value={p.id}>№{p.number} {p.name}</option>)}
          </select>
        </div>

        {/* Статус */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Статус</label>
          <select {...register('status_adm')} className="h-8 px-3 rounded-md bg-surface2 border border-border text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">— оберіть —</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Вид оплати */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Вид оплати</label>
          <select {...register('payment_type')} className="h-8 px-3 rounded-md bg-surface2 border border-border text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">— оберіть —</option>
            {PAYMENT_TYPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <Field label="Країна роботи" name="vacancy_country" register={register} />
        <Field label="Назва проекту" name="project_name" register={register} />

        {/* Доїзд */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Доїзд</label>
          <select {...register('transport')} className="h-8 px-3 rounded-md bg-surface2 border border-border text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">— оберіть —</option>
            {TRANSPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <Field label="Синхронер" name="synchronizer" register={register} />
        <Field label="Дата реєстрації" name="registration_date" register={register} type="date" />
        <Field label="Дата заїзду" name="arrival_date" register={register} type="date" />
        <Field label="Група" name="group_id" register={register} />

        {/* Якісна подача */}
        <div className="flex items-center gap-2 pt-4">
          <input type="checkbox" id="quality_submission" {...register('quality_submission')} className="h-4 w-4" />
          <label htmlFor="quality_submission" className="text-sm text-gray-300">Якісна подача</label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Скасувати</Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  )
}
