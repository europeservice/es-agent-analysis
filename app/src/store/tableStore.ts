import { create } from 'zustand'
import type { FilterState, SortState } from '@/types/filters'
import { PAGE_SIZE } from '@/lib/constants'

interface TableStore {
  page: number
  sort: SortState
  filters: FilterState
  search: string

  setPage: (page: number) => void
  setSort: (column: string) => void
  setFilter: (key: keyof FilterState, value: string) => void
  setSearch: (value: string) => void
  resetFilters: () => void
}

const DEFAULT_SORT: SortState = { column: 'created_at', order: 'desc' }

export const useTableStore = create<TableStore>((set, get) => ({
  page: 0,
  sort: DEFAULT_SORT,
  filters: {},
  search: '',

  setPage: (page) => set({ page }),

  setSort: (column) => {
    const { sort } = get()
    if (sort.column === column) {
      set({ sort: { column, order: sort.order === 'asc' ? 'desc' : 'asc' }, page: 0 })
    } else {
      set({ sort: { column, order: 'asc' }, page: 0 })
    }
  },

  setFilter: (key, value) => {
    set((s) => ({ filters: { ...s.filters, [key]: value }, page: 0 }))
  },

  setSearch: (value) => set({ search: value, page: 0 }),

  resetFilters: () => set({ filters: {}, search: '', page: 0 }),
}))

export { PAGE_SIZE }
