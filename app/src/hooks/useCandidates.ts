import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PAGE_SIZE } from '@/lib/constants'
import type { Candidate } from '@/types/candidate'
import type { FilterState, SortState } from '@/types/filters'

interface FetchParams {
  page: number
  sort: SortState
  filters: FilterState
  search: string
}

interface CandidatesResult {
  data: Candidate[]
  count: number
}

async function fetchCandidates(params: FetchParams): Promise<CandidatesResult> {
  const { page, sort, filters, search } = params

  let query = supabase
    .from('candidates')
    .select('*', { count: 'exact' })

  // Apply filters
  for (const [key, value] of Object.entries(filters)) {
    if (value === '' || value == null) continue
    if (key.endsWith('_from')) {
      query = query.gte(key.replace('_from', ''), value)
    } else if (key.endsWith('_to')) {
      query = query.lte(key.replace('_to', ''), value)
    } else {
      query = query.eq(key, value)
    }
  }

  // Apply search
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`
    )
  }

  query = query
    .order(sort.column, { ascending: sort.order === 'asc' })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  const { data, count, error } = await query

  if (error) throw error

  return { data: (data as Candidate[]) ?? [], count: count ?? 0 }
}

export function useCandidates(params: FetchParams) {
  return useQuery({
    queryKey: ['candidates', params],
    queryFn: () => fetchCandidates(params),
    placeholderData: (prev) => prev,
  })
}
