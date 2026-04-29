import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ProposeInstance {
  id: string
  isOpen: boolean
  isMinimized: boolean
  type: 'create' | 'edit' | 'view'
  data?: any
}

interface ProposeStore {
  // Table State
  page: number
  limit: number
  search: string
  activeTab: string
  viewType: 'table' | 'list'
  sortDescriptors: { column: string; direction: 'ascending' | 'descending' }[]

  // UI State
  showStatsCards: boolean
  isCollapsed: boolean

  // Configuration State
  columnWidths: Record<string, number>
  pinnedColumns: Record<string, 'left' | 'right' | undefined>
  visibleColumns: string[]

  // Multimodal state
  instances: ProposeInstance[]

  // Statistical State
  statisticals: any[]
  setStatisticals: (data: any[]) => void

  // Filters
  filters: Record<string, any>
  setFilters: (data: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void

  // Actions
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setSearch: (search: string) => void
  setActiveTab: (tab: string) => void
  setViewType: (view: 'table' | 'list') => void
  setSortDescriptors: (sorts: { column: string; direction: 'ascending' | 'descending' }[]) => void
  setShowStatsCards: (show: boolean) => void
  setIsCollapsed: (collapsed: boolean) => void
  setColumnWidth: (uid: string, width: number) => void
  setColumnWidths: (widths: Record<string, number>) => void
  setPinnedColumn: (uid: string, pin: 'left' | 'right' | undefined) => void
  setPinnedColumns: (pinned: Record<string, 'left' | 'right' | undefined>) => void
  setVisibleColumns: (columns: string[]) => void

  // Instance Actions
  addInstance: (type: 'create' | 'edit' | 'view', data?: any) => string
  closeInstance: (id: string) => void
  minimizeInstance: (id: string) => void
  restoreInstance: (id: string) => void

  resetFilters: () => void
}

const DEFAULT_STATE = {
  page: 1,
  limit: 10,
  search: '',
  activeTab: 'all',
  viewType: 'list' as const,
  sortDescriptors: [],
  showStatsCards: true,
  isCollapsed: false,
  columnWidths: {},
  pinnedColumns: {
    stt: 'left' as const
  },
  visibleColumns: [], // Trống nghĩa là hiển thị tất cả mặc định
  statisticals: [],
  filters: {},
  instances: []
}

export const useProposeStore = create<ProposeStore>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setStatisticals: (data) => set({ statisticals: data }),
      setFilters: (data) =>
        set((state) => ({
          filters: typeof data === 'function' ? data(state.filters) : { ...state.filters, ...data },
          page: 1
        })),

      setPage: (page) => set({ page }),
      setLimit: (limit) => set({ limit, page: 1 }),
      setSearch: (search) => set({ search, page: 1 }),
      setActiveTab: (tab) => set({ activeTab: tab, page: 1 }),
      setViewType: (viewType) => set({ viewType }),
      setSortDescriptors: (sortDescriptors) => set({ sortDescriptors }),
      setShowStatsCards: (showStatsCards) => set({ showStatsCards }),
      setIsCollapsed: (isCollapsed) => set({ isCollapsed }),
      setColumnWidth: (uid, width) =>
        set((state) => ({
          columnWidths: { ...state.columnWidths, [uid]: width }
        })),
      setColumnWidths: (columnWidths) => set({ columnWidths }),
      setPinnedColumn: (uid, pin) =>
        set((state) => ({
          pinnedColumns: { ...state.pinnedColumns, [uid]: pin }
        })),
      setPinnedColumns: (pinnedColumns) => set({ pinnedColumns }),
      setVisibleColumns: (visibleColumns) => set({ visibleColumns }),

      // Instance Actions
      addInstance: (type, data) => {
        const newId = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        set((state) => ({
          instances: [...state.instances, { id: newId, isOpen: true, isMinimized: false, type, data }]
        }))
        return newId
      },
      closeInstance: (id) =>
        set((state) => ({
          instances: state.instances.filter((i) => i.id !== id)
        })),
      minimizeInstance: (id) =>
        set((state) => ({
          instances: state.instances.map((i) => (i.id === id ? { ...i, isOpen: false, isMinimized: true } : i))
        })),
      restoreInstance: (id) =>
        set((state) => ({
          instances: state.instances.map((i) => (i.id === id ? { ...i, isOpen: true, isMinimized: false } : i))
        })),

      resetFilters: () => set(DEFAULT_STATE)
    }),
    {
      name: 'propose-store',
      version: 2,
      partialize: (state) => ({
        page: state.page,
        limit: state.limit,
        search: state.search,
        activeTab: state.activeTab,
        viewType: state.viewType,
        sortDescriptors: state.sortDescriptors,
        showStatsCards: state.showStatsCards,
        isCollapsed: state.isCollapsed,
        columnWidths: state.columnWidths,
        pinnedColumns: state.pinnedColumns,
        visibleColumns: state.visibleColumns
        // NOTE: filters, instances, statisticals are intentionally excluded
        // filters must start fresh to avoid desync with filter UI (local state in ProposeToolbar)
      })
    }
  )
)
