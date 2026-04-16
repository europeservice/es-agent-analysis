export interface FilterState {
  branch?: string
  responsible?: string
  status_adm?: string
  payment_status?: string
  vacancy_country?: string
  registration_date_from?: string
  registration_date_to?: string
  arrival_date_from?: string
  arrival_date_to?: string
}

export interface SortState {
  column: string
  order: 'asc' | 'desc'
}
