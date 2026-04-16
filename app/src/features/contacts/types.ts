import { z } from 'zod'

export const contactSchema = z.object({
  first_name: z.string().min(1, "Обов'язкове поле"),
  last_name: z.string().min(1, "Обов'язкове поле"),
  phone: z.string().nullable().optional(),
  viber: z.string().nullable().optional(),
  telegram: z.string().nullable().optional(),
  foreign_phone: z.string().nullable().optional(),
  email: z.string().email('Невірний email').nullable().optional().or(z.literal('')),
  age: z.coerce.number().int().min(16).max(80).nullable().optional(),
  birthdate: z.string().nullable().optional(),
  candidate_country: z.string().nullable().optional(),
  passport_type: z.string().nullable().optional(),
  passport_number: z.string().nullable().optional(),
  passport_valid_to: z.string().nullable().optional(),
  addr_country: z.string().nullable().optional(),
  addr_region: z.string().nullable().optional(),
  addr_city: z.string().nullable().optional(),
  addr_street: z.string().nullable().optional(),
  addr_zip: z.string().nullable().optional(),
  size_shirt: z.string().nullable().optional(),
  size_pants: z.string().nullable().optional(),
  size_shoes: z.string().nullable().optional(),
  height: z.coerce.number().int().min(140).max(220).nullable().optional(),
  emergency_name: z.string().nullable().optional(),
  emergency_phone: z.string().nullable().optional(),
  civil_status: z.string().nullable().optional(),
  pesel: z.string().nullable().optional(),
  bitrix_contact_id: z.string().nullable().optional(),
})

export type ContactFormValues = z.infer<typeof contactSchema>

export interface Contact extends ContactFormValues {
  id: string
  created_at: string
  updated_at: string
  extra: Record<string, unknown>
}
