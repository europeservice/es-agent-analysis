import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Contact } from '../types'

export interface ContactsFilter {
  search?: string
  page?: number
  pageSize?: number
}

export async function fetchContacts({ search, page = 0, pageSize = 50 }: ContactsFilter = {}) {
  let query = supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (search) {
    query = query.or(
      `last_name.ilike.%${search}%,first_name.ilike.%${search}%,phone.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query
  if (error) throw error
  return { data: data as Contact[], count: count ?? 0 }
}

export async function fetchContact(id: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Contact
}

export function useContacts(filter: ContactsFilter = {}) {
  return useQuery({
    queryKey: ['contacts', filter],
    queryFn: () => fetchContacts(filter),
  })
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => fetchContact(id),
    enabled: !!id,
  })
}
