import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NghiPhepState {
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
  showStatsCards: boolean
  setShowStatsCards: (show: boolean) => void
  showQuotaGrid: boolean
  setShowQuotaGrid: (show: boolean) => void
  quotaYear: number
  setQuotaYear: (year: number) => void
  month: number
  setMonth: (month: number) => void
  year: number
  setYear: (year: number) => void
  visibleColumns: string[]
  setVisibleColumns: (columns: string[]) => void
  columnWidths: Record<string, number>
  setColumnWidths: (widths: Record<string, number>) => void
  pinnedColumns: Record<string, 'left' | 'right' | undefined>
  setPinnedColumns: (pinned: Record<string, 'left' | 'right' | undefined>) => void
  loaiOrder: string[]
  setLoaiOrder: (order: string[]) => void
  unitOrder: Record<string, string[]>
  setUnitOrder: (loai: string, order: string[]) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  reset: () => void
}

export const useNghiPhepStore = create<NghiPhepState>()(
  persist(
    (set) => ({
      page: 1,
      setPage: (page) => set({ page }),
      limit: 10,
      setLimit: (limit) => set({ limit }),
      search: '',
      setSearch: (search) => set({ search, page: 1 }),
      filter: {},
      setFilter: (filter) => set({ filter, page: 1 }),
      sortDescriptors: [],
      setSortDescriptors: (sortDescriptors) => set({ sortDescriptors }),
      showStatsCards: false,
      setShowStatsCards: (showStatsCards) => set({ showStatsCards }),
      showQuotaGrid: true,
      setShowQuotaGrid: (showQuotaGrid) => set({ showQuotaGrid }),
      quotaYear: new Date().getFullYear(),
      setQuotaYear: (quotaYear) => set({ quotaYear }),
      month: 0,
      setMonth: (month) => set({ month, page: 1 }),
      year: new Date().getFullYear(),
      setYear: (year) => set({ year, page: 1 }),
      visibleColumns: [], // Empty means show all by default or default set
      setVisibleColumns: (visibleColumns) => set({ visibleColumns }),
      columnWidths: {},
      setColumnWidths: (columnWidths) => set({ columnWidths }),
      pinnedColumns: {},
      setPinnedColumns: (pinnedColumns) => set({ pinnedColumns }),
      loaiOrder: [],
      setLoaiOrder: (loaiOrder) => set({ loaiOrder }),
      unitOrder: {},
      setUnitOrder: (loai, order) => set((state) => ({
        unitOrder: { ...state.unitOrder, [loai]: order }
      })),
      activeTab: 'tab1',
      setActiveTab: (activeTab) => set({ activeTab }),
      reset: () =>
        set({
          page: 1,
          limit: 10,
          search: '',
          filter: {},
          sortDescriptors: [],
          showStatsCards: false,
          showQuotaGrid: true,
          quotaYear: new Date().getFullYear(),
          month: 0,
          year: new Date().getFullYear(),
          visibleColumns: [],
          columnWidths: {},
          pinnedColumns: {},
          loaiOrder: [],
          unitOrder: {},
          activeTab: 'tab1'
        })
    }),
    {
      name: 'nghi-phep-storage',
      version: 4,
      migrate: (persistedState: any, version: number) => {
        // Khi cần update version, thêm logic migration tại đây
        if (version < 4) {
          persistedState.showStatsCards = false
          persistedState.showQuotaGrid = true
        }
        return persistedState as NghiPhepState
      },
      partialize: (state) => ({
        showStatsCards: state.showStatsCards,
        showQuotaGrid: state.showQuotaGrid,
        quotaYear: state.quotaYear,
        filter: state.filter,
        search: state.search,
        month: state.month,
        year: state.year,
        page: state.page,
        limit: state.limit,
        sortDescriptors: state.sortDescriptors,
        visibleColumns: state.visibleColumns,
        columnWidths: state.columnWidths,
        pinnedColumns: state.pinnedColumns,
        loaiOrder: state.loaiOrder,
        unitOrder: state.unitOrder,
        activeTab: state.activeTab
      })
    }
  )
)
