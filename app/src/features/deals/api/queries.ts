import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Deal } from '../types'

export interface DealsFilter {
  search?: string
  status?: string
  branch_id?: string
  vacancy_country?: string
  registration_from?: string
  registration_to?: string
  arrival_from?: string
  arrival_to?: string
  page?: number
  pageSize?: number
}

const DEAL_SELECT = `
  *,
  contact:contacts(id, first_name, last_name, phone, age, candidate_country),
  branch:branches(id, name, code),
  partner:partners(id, number, name),
  payments(amount, status)
`

export async function fetchDeals({
  search,
  status,
  branch_id,
  vacancy_country,
  registration_from,
  registration_to,
  arrival_from,
  arrival_to,
  page = 0,
  pageSize = 50,
}: DealsFilter = {}) {
  let query = supabase
    .from('deals')
    .select(DEAL_SELECT, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (status) query = query.eq('status_adm', status)
  if (branch_id) query = query.eq('branch_id', branch_id)
  if (vacancy_country) query = query.ilike('vacancy_country', `%${vacancy_country}%`)
  if (registration_from) query = query.gte('registration_date', registration_from)
  if (registration_to) query = query.lte('registration_date', registration_to)
  if (arrival_from) query = query.gte('arrival_date', arrival_from)
  if (arrival_to) query = query.lte('arrival_date', arrival_to)

  const { data, error, count } = await query
  if (error) throw error

  let deals = data as Deal[]

  // Client-side search by contact name/phone
  if (search) {
    const s = search.toLowerCase()
    deals = deals.filter(d =>
      d.contact?.last_name?.toLowerCase().includes(s) ||
      d.contact?.first_name?.toLowerCase().includes(s) ||
      d.contact?.phone?.toLowerCase().includes(s) ||
      d.project_name?.toLowerCase().includes(s)
    )
  }

  return { data: deals, count: count ?? 0 }
}

export async function fetchDeal(id: string) {
  const { data, error } = await supabase
    .from('deals')
    .select(DEAL_SELECT)
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Deal
}

export function useDeals(filter: DealsFilter = {}) {
  return useQuery({
    queryKey: ['deals', filter],
    queryFn: () => fetchDeals(filter),
  })
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ['deals', id],
    queryFn: () => fetchDeal(id),
    enabled: !!id,
  })
}
