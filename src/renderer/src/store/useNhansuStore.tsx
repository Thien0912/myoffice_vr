// store/useNhansuStore.tsx
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { columnNhansu } from '../pages/profile/components/table/TableColumns'

interface StatisticalItem {
  title?: string
  count?: number | string
  percent?: string
  icons?: React.JSX.Element
}

interface TableColumn {
  uid: string
  name: string
  className?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row?: any) => React.ReactNode
}

export interface FilterValues {
  searchValue: string | null
  selectedClassify: string
  ma_nhan_vien: string
  ho_ten: string
  email: string
  id_don_vi: string
  id_vi_tri_cong_viec: string
  trang_thai: string
  ngay_lam_chinh_thuc: string
  so_cccd: string
  ngay_sinh: string
  tableColumn: TableColumn[]
  initial_visible_columns: string[]
  page: number
  length: number
  dateRange: {
    fromDate?: string
    toDate?: string
  }
  orders: object[]
}

interface NhansuStore {
  showThead: boolean
  toggleThead: () => void
  statisticals: StatisticalItem[]
  setStatisticals: (data: StatisticalItem[]) => void

  sortDescriptors: { column: string; direction: 'ascending' | 'descending' }[]
  setSortDescriptors: (data: { column: string; direction: 'ascending' | 'descending' }[]) => void

  // 🆕 Bộ lọc
  filters: FilterValues
  setFilters: (data: Partial<FilterValues>) => void
  resetFilters: () => void

  // 🆕 Table state management
  columnWidths: Record<string, number>
  setColumnWidth: (uid: string, width: number) => void
  pinnedColumns: Record<string, 'left' | 'right' | undefined>
  setPinnedColumn: (uid: string, pin: 'left' | 'right' | undefined) => void
  visibleColumns: Set<string>
  setVisibleColumns: (columns: Set<string>) => void
  showStatsCards: boolean
  setShowStatsCards: (show: boolean) => void

  // Pagination helpers
  setPage: (page: number) => void
  setLength: (length: number) => void
}

// Cột mặc định cho bảng nhân sự
const INITIAL_VISIBLE_COLUMNS_NHANSU = [
  'stt',
  'ma_nhan_vien',
  'avatar',
  'ho_va_ten',
  'id_don_vi_cong_tac',
  'id_vi_tri_cong_viec',
  'trang_thai',
  'hoc_ham',
  'hoc_vi',
  // 'chuyen_nganh', // Ẩn cột ngành đào tạo
  'ngay_lam_chinh_thuc',
  // 'mst_ca_nhan', // Ẩn cột mã số thuế
  'email',
  'gioi_tinh',
  'ngay_sinh',
  'noi_dt'
]

// Default visible columns for table
const DEFAULT_VISIBLE_COLUMNS = new Set([
  'stt',
  'ma_nhan_vien',
  'avatar',
  'ho_va_ten',
  'id_don_vi_cong_tac',
  'id_vi_tri_cong_viec',
  'trang_thai',
  'hoc_ham',
  'hoc_vi',
  // 'chuyen_nganh', // Ẩn cột chuyên ngành
  'ngay_lam_chinh_thuc',
  // 'mst_ca_nhan', // Ẩn cột mã số thuế
  'email',
  'gioi_tinh',
  'ngay_sinh',
  'noi_dt'
])

// Tạo filter mặc định cho nhân sự
const createDefaultFilters = (): FilterValues => {
  return {
    searchValue: '',
    selectedClassify: 'all',
    ma_nhan_vien: '',
    ho_ten: '',
    email: '',
    id_don_vi: '',
    id_vi_tri_cong_viec: '',
    trang_thai: '',
    ngay_lam_chinh_thuc: '',
    so_cccd: '',
    ngay_sinh: '',
    tableColumn: columnNhansu,
    initial_visible_columns: INITIAL_VISIBLE_COLUMNS_NHANSU,
    page: 1,
    length: 10,
    dateRange: {
      // fromDate: `${currentYear}-01-01`,
      // toDate: `${currentYear}-12-31`
    },
    orders: []
  }
}

export const useNhansuStore = create<NhansuStore>()(
  persist(
    (set) => ({
      showThead: true,
      toggleThead: () => set((state) => ({ showThead: !state.showThead })),
      statisticals: [],
      setStatisticals: (data) => set(() => ({ statisticals: data })),

      sortDescriptors: [{ column: 'ma_nhan_vien', direction: 'descending' }],
      setSortDescriptors: (data) => set(() => ({ sortDescriptors: data })),

      // 🆕 Lưu bộ lọc
      filters: createDefaultFilters(),
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
      resetFilters: () => set({ filters: createDefaultFilters() }),

      // 🆕 Table state management
      columnWidths: {},
      setColumnWidth: (uid, width) =>
        set((state) => ({
          columnWidths: { ...state.columnWidths, [uid]: width }
        })),
      pinnedColumns: {},
      setPinnedColumn: (uid, pin) =>
        set((state) => ({
          pinnedColumns: { ...state.pinnedColumns, [uid]: pin }
        })),
      visibleColumns: DEFAULT_VISIBLE_COLUMNS,
      setVisibleColumns: (columns) => set({ visibleColumns: columns }),
      showStatsCards: true,
      setShowStatsCards: (show) => set({ showStatsCards: show }),

      setPage: (page) =>
        set((state) => ({
          filters: {
            ...state.filters,
            page
          }
        })),

      setLength: (length) =>
        set((state) => ({
          filters: {
            ...state.filters,
            length
          }
        }))
    }),
    {
      name: 'nhansuStore',
      partialize: (state) => ({
        sortDescriptors: state.sortDescriptors,
        filters: state.filters,
        columnWidths: state.columnWidths,
        pinnedColumns: state.pinnedColumns,
        visibleColumns: Array.from(state.visibleColumns),
        showStatsCards: state.showStatsCards,
        showThead: state.showThead
      }),
      merge: (persistedState: any, currentState) => {
        const visibleColumnsArray =
          persistedState?.visibleColumns || Array.from(DEFAULT_VISIBLE_COLUMNS)
        return {
          ...currentState,
          ...persistedState,
          filters: {
            ...currentState.filters,
            ...(persistedState?.filters || {})
          },
          sortDescriptors: persistedState?.sortDescriptors || currentState.sortDescriptors,
          visibleColumns: new Set(
            Array.isArray(visibleColumnsArray)
              ? visibleColumnsArray
              : Array.from(DEFAULT_VISIBLE_COLUMNS)
          )
        }
      }
    }
  )
)
