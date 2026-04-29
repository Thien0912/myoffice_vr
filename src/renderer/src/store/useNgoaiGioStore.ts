import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { OvertimeRequest } from '../pages/hr/overtime/types'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const DEFAULT_SEARCH = ''
const DEFAULT_FILTER: Record<string, any> = {}
const DEFAULT_SORT: any[] = []

type PersistedNgoaiGioState = {
  showTotalHoursColumn: boolean
  columnWidths: Record<string, number>
}

interface NgoaiGioState {
  page: number
  setPage: (page: number) => void
  limit: number
  setLimit: (limit: number) => void
  search: string
  setSearch: (search: string) => void
  filter: Record<string, any>
  setFilter: (filter: Record<string, any>) => void
  sortDescriptors: any[]
  setSortDescriptors: (sort: any[]) => void
  columnWidths: Record<string, number>
  setColumnWidth: (uid: string, width: number) => void
  isOpenDetail: boolean
  setIsOpenDetail: (isOpen: boolean) => void
  selectedRequest: OvertimeRequest | null
  setSelectedRequest: (request: OvertimeRequest | null) => void
  showTotalHoursColumn: boolean
  setShowTotalHoursColumn: (show: boolean) => void
  reset: () => void
}

export const useNgoaiGioStore = create<NgoaiGioState>()(
  persist(
    (set) => ({
      page: DEFAULT_PAGE,
      setPage: (page) => set({ page }),
      limit: DEFAULT_LIMIT,
      setLimit: (limit) => set({ limit }),
      search: DEFAULT_SEARCH,
      setSearch: (search) => set({ search, page: 1 }),
      filter: DEFAULT_FILTER,
      setFilter: (filter) => set({ filter, page: 1 }),
      sortDescriptors: DEFAULT_SORT,
      setSortDescriptors: (sortDescriptors) => set({ sortDescriptors }),
      columnWidths: {},
      setColumnWidth: (uid, width) =>
        set((state) => ({
          columnWidths: { ...state.columnWidths, [uid]: width }
        })),
      isOpenDetail: false,
      setIsOpenDetail: (isOpenDetail) => set({ isOpenDetail }),
      selectedRequest: null,
      setSelectedRequest: (selectedRequest) => set({ selectedRequest, isOpenDetail: !!selectedRequest }),
      showTotalHoursColumn: false,
      setShowTotalHoursColumn: (showTotalHoursColumn) => set({ showTotalHoursColumn }),
      reset: () =>
        set({
          page: DEFAULT_PAGE,
          limit: DEFAULT_LIMIT,
          search: DEFAULT_SEARCH,
          filter: DEFAULT_FILTER,
          sortDescriptors: DEFAULT_SORT,
          columnWidths: {},
          isOpenDetail: false,
          selectedRequest: null,
          showTotalHoursColumn: false
        })
    }),
    {
      name: 'ngoai-gio-storage',
      version: 2,
      migrate: (persistedState: any) => {
        const safe = persistedState ?? {}
        return {
          showTotalHoursColumn: !!safe.showTotalHoursColumn,
          columnWidths: safe.columnWidths && typeof safe.columnWidths === 'object' ? safe.columnWidths : {}
        }
      },
      partialize: (state): PersistedNgoaiGioState => ({
        columnWidths: state.columnWidths,
        showTotalHoursColumn: state.showTotalHoursColumn
      })
    }
  )
)
