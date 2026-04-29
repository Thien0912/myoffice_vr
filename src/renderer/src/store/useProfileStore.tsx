import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  INITIAL_VISIBLE_COLUMNS as HOPDONG_INITIAL_VISIBLE_COLUMNS,
  columns as HOPDONG_COLUMNS
} from '@renderer/api/hr/hopdongAxios'

interface StatisticalItem {
  title?: string
  count?: number | string
  percent?: string
  icons?: React.JSX.Element
}

interface FilterValues {
  searchValue: string | null
  selectedClassify: string
  tableColumn: TableColumn[]
  initial_visible_columns: string[]
  page: number
  length: number
  month: string | null
  year: string | null
  dateRange: {
    fromDate?: string
    toDate?: string
  }
  orders: object[]
}

interface TableColumn {
  uid: string
  name: string
  className?: string
  render?: (value: any, row?: any) => React.ReactNode
}

interface ProfileStore {
  showThead: boolean
  toggleThead: () => void
  statisticals: StatisticalItem[]
  setStatisticals: (data: StatisticalItem[]) => void

  // Bộ lọc chung
  filters: FilterValues
  setFilters: (data: Partial<FilterValues>) => void
  resetFilters: () => void
}

// ✨ Hàm tạo default filters chung
const currentYear = new Date().getFullYear()
const createDefaultFilters = (): FilterValues => ({
  searchValue: '',
  selectedClassify: 'all',
  tableColumn: [],
  initial_visible_columns: [],
  page: 1,
  length: 30,
  month: null,
  year: String(currentYear),
  dateRange: {
    fromDate: `${currentYear}-01-01`,
    toDate: `${currentYear}-12-31`
  },
  orders: []
})

// 🌟 useHosoStore giữ nguyên
export const useHosoStore = create<ProfileStore>()(
  persist(
    (set) => ({
      showThead: true,
      toggleThead: () => set((state) => ({ showThead: !state.showThead })),
      statisticals: [],
      setStatisticals: (data) => set(() => ({ statisticals: data })),

      filters: {
        ...createDefaultFilters(),
        initial_visible_columns: []
      },
      setFilters: (data) =>
        set((state) => ({
          filters: {
            ...state.filters,
            ...data,
            dateRange: {
              ...state.filters.dateRange,
              ...data.dateRange
            }
          }
        })),
      resetFilters: () => set({ filters: createDefaultFilters() })
    }),
    { name: 'hosoStore' }
  )
)

// 🌟 useHopdongStore mới, đã gộp column widths, pinned columns, visible columns...
interface HopdongStore {
  columnWidths: Record<string, number>
  setColumnWidth: (uid: string, width: number) => void
  pinnedColumns: Record<string, 'left' | 'right' | undefined>
  setPinnedColumn: (uid: string, pin: 'left' | 'right' | undefined) => void

  sortDescriptors: { column: string; direction: 'ascending' | 'descending' }[]
  setSortDescriptors: (
    sortDescriptors: { column: string; direction: 'ascending' | 'descending' }[]
  ) => void

  filters: FilterValues
  setFilters: (data: Partial<FilterValues>) => void
  resetFilters: () => void
}

export const useHopdongStore = create<HopdongStore>()(
  persist(
    (set) => {
      const createCustomFilters = (): FilterValues =>
        ({
          ...createDefaultFilters(),
          year: 'all',
          dateRange: { fromDate: undefined, toDate: undefined },
          tableColumn: HOPDONG_COLUMNS,
          initial_visible_columns: HOPDONG_INITIAL_VISIBLE_COLUMNS,
          loai_hop_dong: '',
          so_hop_dong: '',
          ngay_ky_tu: '',
          ngay_ky_den: '',
          ngay_ket_thuc_tu: '',
          ngay_ket_thuc_den: ''
        }) as FilterValues & Record<string, any>

      return {
        // Column config
        columnWidths: {},
        setColumnWidth: (uid, width) =>
          set((state) => ({ columnWidths: { ...state.columnWidths, [uid]: width } })),
        pinnedColumns: {
          // stt: 'left',
          // so_hop_dong: 'left',
          // ho_va_ten: 'left'
        },
        setPinnedColumn: (uid, pin) =>
          set((state) => ({ pinnedColumns: { ...state.pinnedColumns, [uid]: pin } })),

        sortDescriptors: [],
        setSortDescriptors: (sortDescriptors) => set({ sortDescriptors }),

        // Filters
        filters: createCustomFilters(),
        setFilters: (data) =>
          set((state) => {
            const nextFilters = {
              ...state.filters,
              ...data
            }

            // If data contains dateRange, we want to merge it carefully or replace it if it's explicitly null/empty
            if (data.dateRange) {
              nextFilters.dateRange = {
                ...state.filters.dateRange,
                ...data.dateRange
              }
            }

            return { filters: nextFilters }
          }),
        resetFilters: () => set({ filters: createCustomFilters() })
      }
    },
    { name: 'hopdongStore' }
  )
)
