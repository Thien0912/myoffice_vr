// store/useVanbandenStore.ts
import { columnVanban } from '@renderer/pages/document/components/table/TableColumns'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { INITIAL_VISIBLE_COLUMNS as VANBAN_DI_COLUMNS } from '@renderer/api/documents/vanbandiAxios'
import { INITIAL_VISIBLE_COLUMNS as VANBAN_DI_DONVI_COLUMNS } from '@renderer/api/documents/vanbandidonviAxios'
import { INITIAL_VISIBLE_COLUMNS as VANBAN_DEN_COLUMNS } from '@renderer/api/documents/vanbandenAxios'
import { INITIAL_VISIBLE_COLUMNS as VANBAN_DONVI_COLUMNS } from '@renderer/api/documents/vanbandendonviAxios'
import { INITIAL_VISIBLE_COLUMNS as VANBAN_NOIBO_COLUMNS } from '@renderer/api/documents/vanbannoiboAxios'

interface StatisticalItem {
  title?: string
  count?: number | string
  percent?: string
  icons?: React.JSX.Element
  classify?: string
}

// 👉 Interface mới cho bộ lọc
interface FilterValues {
  searchValue: string | null
  selectedClassify: string
  id_don_vi_xu_ly: string // Phòng ban
  id_loai?: string | number
  so_van_ban: string
  so_hieu_van_ban: string
  trich_yeu: string
  tableColumn: TableColumn[]
  initial_visible_columns: string[]
  page: number
  length: number
  month: string | null
  year: string | null
  sender: string[] // Người soạn
  dateRange: {
    fromProcess?: string
    toProcess?: string
    fromReceive?: string
    toReceive?: string
    fromDate?: string
    toDate?: string
  }
  orders: object[]
  sortOrder: '' | 'newest' | 'oldest'
  id_don_vi_soan: string // Đơn vị soạn (Văn bản nội bộ)
}

// Có thể nữa chia ra cho 2 văn bản đi và đến nếu cần
interface Create {
  ids_don_vi_xu_ly: string
  ids_ql_nguoi_dung: string
  ids_co_quan: string
}

interface TableColumn {
  uid: string
  name: string
  className?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row?: any) => React.ReactNode
}

interface VanbanStore {
  showThead: boolean
  toggleThead: () => void
  statisticals: StatisticalItem[]
  setStatisticals: (data: StatisticalItem[]) => void

  // 🆕 Bộ lọc
  filters: FilterValues
  setFilters: (data: Partial<FilterValues>) => void
  resetFilters: () => void

  // 🆕 Thêm văn bản
  create: Create
  setCreate: (data: Partial<Create>) => void
  resetCreate: () => void
}

const createDefaultFilters = (): FilterValues => {
  return {
    searchValue: '',
    selectedClassify: 'all',
    id_don_vi_xu_ly: '',
    id_loai: '',
    so_van_ban: '',
    so_hieu_van_ban: '',
    trich_yeu: '',
    tableColumn: columnVanban,
    initial_visible_columns: [],
    page: 1,
    length: 30,
    month: null,
    year: 'all_years',
    sender: [],
    dateRange: {
      fromProcess: '',
      toProcess: '',
      fromReceive: '',
      toReceive: '',
      fromDate: '',
      toDate: ''
    },
    orders: [],
    sortOrder: '',
    id_don_vi_soan: ''
  }
}

const defaultCreate: Create = {
  ids_don_vi_xu_ly: '',
  ids_ql_nguoi_dung: '',
  ids_co_quan: ''
}

export const useVanbandenStore = create<VanbanStore>()(
  persist(
    (set) => ({
      showThead: true,
      toggleThead: () => set((state) => ({ showThead: !state.showThead })),
      statisticals: [],
      setStatisticals: (data) => set(() => ({ statisticals: data })),

      // 🆕 Lưu bộ lọc
      filters: {
        ...createDefaultFilters(),
        initial_visible_columns: VANBAN_DEN_COLUMNS
      },
      setFilters: (data) =>
        set((state) => {
          let yearDateRange = {}
          if (data.year) {
            if (data.year === 'all_years') {
              yearDateRange = { fromDate: '', toDate: '' }
            } else {
              yearDateRange = { fromDate: `${data.year}-01-01`, toDate: `${data.year}-12-31` }
            }
          }
          return {
            filters: {
              ...state.filters,
              ...data,
              dateRange: {
                ...state.filters.dateRange,
                ...yearDateRange,
                ...data.dateRange
              }
            }
          }
        }),
      resetFilters: () => set({ filters: createDefaultFilters() }),

      // 🆕 Lưu các trường khi thêm văn bản
      create: defaultCreate,
      setCreate: (data) => {
        set((state) => ({
          create: { ...state.create, ...data }
        }))
      },
      resetCreate: () => set({ create: defaultCreate })
    }),
    { name: 'vanbandenStore', version: 1 } // lưu vào localStorage
  )
)

export const useVanbandiStore = create<VanbanStore>()(
  persist(
    (set, get) => ({
      showThead: true,
      toggleThead: () => set((state) => ({ showThead: !state.showThead })),

      statisticals: [],
      setStatisticals: (data) => set(() => ({ statisticals: data })),

      filters: {
        ...createDefaultFilters(),
        initial_visible_columns: VANBAN_DI_COLUMNS,
        orders: [{ column: 'ngay_ky', direction: 'descending' }]
      },
      setFilters: (data) =>
        set((state) => {
          let yearDateRange = {}
          if (data.year) {
            if (data.year === 'all_years') {
              yearDateRange = { fromDate: '', toDate: '' }
            } else {
              yearDateRange = { fromDate: `${data.year}-01-01`, toDate: `${data.year}-12-31` }
            }
          }
          return {
            filters: {
              ...state.filters,
              ...data,
              dateRange: {
                ...state.filters.dateRange,
                ...yearDateRange,
                ...data.dateRange
              }
            }
          }
        }),
      resetFilters: () => set({ filters: createDefaultFilters() }),

      create: defaultCreate,

      setCreate: (data) => {
        const current = get().create

        const merged = {
          ...current,
          ...data
        }

        set({ create: merged })
      },

      resetCreate: () => set({ create: defaultCreate })
    }),
    { name: 'vanbandiStore', version: 1 }
  )
)

export const useVanbandendonviStore = create<VanbanStore>()(
  persist(
    (set, get) => ({
      showThead: true,
      toggleThead: () => set((state) => ({ showThead: !state.showThead })),

      statisticals: [],
      setStatisticals: (data) => set(() => ({ statisticals: data })),
      filters: {
        ...createDefaultFilters(),
        initial_visible_columns: VANBAN_DONVI_COLUMNS
      },
      setFilters: (data) =>
        set((state) => {
          let yearDateRange = {}
          if (data.year) {
            if (data.year === 'all_years') {
              yearDateRange = { fromDate: '', toDate: '' }
            } else {
              yearDateRange = { fromDate: `${data.year}-01-01`, toDate: `${data.year}-12-31` }
            }
          }
          return {
            filters: {
              ...state.filters,
              ...data,
              dateRange: {
                ...state.filters.dateRange,
                ...yearDateRange,
                ...data.dateRange
              }
            }
          }
        }),
      resetFilters: () => set({ filters: createDefaultFilters() }),

      create: defaultCreate,

      setCreate: (data) => {
        const current = get().create

        const merged = {
          ...current,
          ...data
        }

        set({ create: merged })
      },

      resetCreate: () => set({ create: defaultCreate })
    }),
    { name: 'vanbandendonviStore', version: 1 }
  )
)

export const useVanbannoiboStore = create<VanbanStore>()(
  persist(
    (set, get) => ({
      showThead: true,
      toggleThead: () => set((state) => ({ showThead: !state.showThead })),

      statisticals: [],
      setStatisticals: (data) => set(() => ({ statisticals: data })),

      filters: {
        ...createDefaultFilters(),
        initial_visible_columns: VANBAN_NOIBO_COLUMNS
      },
      setFilters: (data) =>
        set((state) => {
          let yearDateRange = {}
          if (data.year) {
            if (data.year === 'all_years') {
              yearDateRange = { fromDate: '', toDate: '' }
            } else {
              yearDateRange = { fromDate: `${data.year}-01-01`, toDate: `${data.year}-12-31` }
            }
          }
          return {
            filters: {
              ...state.filters,
              ...data,
              dateRange: {
                ...state.filters.dateRange,
                ...yearDateRange,
                ...data.dateRange
              }
            }
          }
        }),
      resetFilters: () => set({ filters: createDefaultFilters() }),

      create: defaultCreate,

      setCreate: (data) => {
        const current = get().create

        const merged = {
          ...current,
          ...data
        }

        set({ create: merged })
      },

      resetCreate: () => set({ create: defaultCreate })
    }),
    {
      name: 'vanbannoiboStore', version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            ...persistedState,
            filters: {
              ...persistedState.filters,
              length: 30,
              initial_visible_columns: VANBAN_NOIBO_COLUMNS,
              id_don_vi_soan: ''
            }
          }
        }
        return persistedState
      }
    }
  )
)

export const useVanbandidonviStore = create<VanbanStore>()(
  persist(
    (set, get) => ({
      showThead: true,
      toggleThead: () => set((state) => ({ showThead: !state.showThead })),

      statisticals: [],
      setStatisticals: (data) => set(() => ({ statisticals: data })),

      filters: {
        ...createDefaultFilters(),
        initial_visible_columns: VANBAN_DI_DONVI_COLUMNS,
        orders: [{ column: 'ngay_ky', direction: 'descending' }]
      },
      setFilters: (data) =>
        set((state) => {
          let yearDateRange = {}
          if (data.year) {
            if (data.year === 'all_years') {
              yearDateRange = { fromDate: '', toDate: '' }
            } else {
              yearDateRange = { fromDate: `${data.year}-01-01`, toDate: `${data.year}-12-31` }
            }
          }
          return {
            filters: {
              ...state.filters,
              ...data,
              dateRange: {
                ...state.filters.dateRange,
                ...yearDateRange,
                ...data.dateRange
              }
            }
          }
        }),
      resetFilters: () => set({ filters: createDefaultFilters() }),

      create: defaultCreate,

      setCreate: (data) => {
        const current = get().create

        const merged = {
          ...current,
          ...data
        }

        set({ create: merged })
      },

      resetCreate: () => set({ create: defaultCreate })
    }),
    { name: 'vanbandidonviStore', version: 1 }
  )
)

export const useVanbandaxoaStore = create<VanbanStore>()(
  persist(
    (set, get) => ({
      showThead: true,
      toggleThead: () => set((state) => ({ showThead: !state.showThead })),

      statisticals: [],
      setStatisticals: (data) => set(() => ({ statisticals: data })),

      filters: {
        ...createDefaultFilters(),
        selectedClassify: 'all',
        initial_visible_columns: ['ten_nguoi_xoa', 'so_van_ban', 'so_hieu_van_ban', 'trich_yeu'],
        orders: [{ column: 'deleted_at', direction: 'descending' }]
      },
      setFilters: (data) =>
        set((state) => {
          let yearDateRange = {}
          if (data.year) {
            if (data.year === 'all_years') {
              yearDateRange = { fromDate: '', toDate: '' }
            } else {
              yearDateRange = { fromDate: `${data.year}-01-01`, toDate: `${data.year}-12-31` }
            }
          }
          return {
            filters: {
              ...state.filters,
              ...data,
              dateRange: {
                ...state.filters.dateRange,
                ...yearDateRange,
                ...data.dateRange
              }
            }
          }
        }),
      resetFilters: () =>
        set({
          filters: {
            ...createDefaultFilters(),
            selectedClassify: 'all',
            initial_visible_columns: [
              'ten_nguoi_xoa',
              'so_van_ban',
              'so_hieu_van_ban',
              'trich_yeu'
            ],
            orders: [{ column: 'deleted_at', direction: 'descending' }]
          }
        }),

      create: defaultCreate,

      setCreate: (data) => {
        const current = get().create

        const merged = {
          ...current,
          ...data
        }

        set({ create: merged })
      },

      resetCreate: () => set({ create: defaultCreate })
    }),
    { name: 'vanbandaxoaStore', version: 1 }
  )
)
