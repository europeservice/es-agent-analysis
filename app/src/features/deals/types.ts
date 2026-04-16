import { z } from 'zod'

export const STATUS_OPTIONS = [
  'Новий',
  'В роботі',
  'Документи',
  'Заїхав',
  'Відмова',
  'Архів',
] as const

export const PAYMENT_TYPE_OPTIONS = [
  'Готівка',
  'Безготівка',
  'Змішана',
] as const

export const TRANSPORT_OPTIONS = [
  'Самостійно',
  'Організований',
  'Автобус',
  'Поїзд',
  'Літак',
] as const

export const dealSchema = z.object({
  contact_id: z.string().uuid().nullable().optional(),
  branch_id: z.string().uuid().nullable().optional(),
  partner_id: z.string().uuid().nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  payment_type: z.string().nullable().optional(),
  registration_date: z.string().nullable().optional(),
  arrival_date: z.string().nullable().optional(),
  transport: z.string().nullable().optional(),
  vacancy_country: z.string().nullable().optional(),
  project_name: z.string().nullable().optional(),
  synchronizer: z.string().nullable().optional(),
  quality_submission: z.boolean().nullable().optional(),
  status_adm: z.string().nullable().optional(),
  group_id: z.string().nullable().optional(),
})

export type DealFormValues = z.infer<typeof dealSchema>

export interface Deal extends DealFormValues {
  id: string
  created_at: string
  updated_at: string
  contact: {
    id: string
    first_name: string
    last_name: string
    phone?: string | null
    age?: number | null
    candidate_country?: string | null
  } | null
  branch: { id: string; name: string; code: string } | null
  partner: { id: string; number: string; name: string } | null
  payments?: { amount: number | null; status: string | null }[]
}
