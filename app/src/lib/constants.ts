import type { UserRole } from '@/types/auth'

export const ROLES: Record<string, UserRole> = {
  HEAD_ADMIN: 'head_admin',
  FINANCIER: 'financier',
  ADMIN: 'admin',
}

export const STATUS_OPTIONS = [
  'Новий',
  'В роботі',
  'Документи',
  'Заїхав',
  'Відмова',
  'Архів',
] as const

export const PAYMENT_STATUS_OPTIONS = [
  'Не виплачено',
  'Очікує',
  'Виплачено',
] as const

export const STATUS_COLORS: Record<string, string> = {
  'Новий': 'bg-blue-900/30 border-l-2 border-blue-400',
  'В роботі': 'bg-yellow-900/30 border-l-2 border-yellow-400',
  'Документи': 'bg-purple-900/30 border-l-2 border-purple-400',
  'Заїхав': 'bg-green-900/30 border-l-2 border-green-400',
  'Відмова': 'bg-red-900/30 border-l-2 border-red-400',
  'Архів': 'bg-gray-800/50 border-l-2 border-gray-500',
}

export interface ColumnMeta {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'boolean'
  options?: readonly string[]
  financial?: boolean
  sortable?: boolean
}

export const COLUMNS: ColumnMeta[] = [
  { key: 'branch', label: 'Філія', type: 'text', sortable: true },
  { key: 'responsible', label: 'Відповідальний', type: 'text', sortable: true },
  { key: 'payment_type', label: 'Вид оплати', type: 'text' },
  { key: 'registration_date', label: 'Дата реєстрації', type: 'date', sortable: true },
  { key: 'first_name', label: "Ім'я", type: 'text', sortable: true },
  { key: 'last_name', label: 'Прізвище', type: 'text', sortable: true },
  { key: 'phone', label: 'Телефон', type: 'text' },
  { key: 'age', label: 'Вік', type: 'number', sortable: true },
  { key: 'candidate_country', label: 'Країна кандидата', type: 'text' },
  { key: 'vacancy_country', label: 'Країна вакансії', type: 'text', sortable: true },
  { key: 'project_name', label: 'Назва проекту', type: 'text' },
  { key: 'partner_number', label: 'Партнер №', type: 'text' },
  { key: 'arrival_date', label: 'Дата заїзду', type: 'date', sortable: true },
  { key: 'transport', label: 'Доїзд', type: 'text' },
  { key: 'synchronizer', label: 'СИНХРОНЕР', type: 'text' },
  { key: 'status_adm', label: 'Статус (Adm)', type: 'select', options: STATUS_OPTIONS, sortable: true },
  { key: 'quality_submission', label: 'Якісна подача', type: 'boolean' },
  { key: 'payment_amount', label: 'Сума виплати', type: 'number', financial: true, sortable: true },
  { key: 'payment_status', label: 'Статус виплати', type: 'select', options: PAYMENT_STATUS_OPTIONS, financial: true },
]

export const FINANCIAL_COLUMNS = ['payment_amount', 'payment_status'] as const

export const PAGE_SIZE = 25
