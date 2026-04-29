import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const INITIAL_VISIBLE_COLUMNS = [
  'stt',
  'ten_nguoi_tao',
  'dang_hieu_luc',
  'so_hop_dong',
  'ho_va_ten',
  'ngay_bat_dau',
  'ngay_ket_thuc',
  'tong_phu_luc',
  'luong_co_ban',
  'muc_luong_bao_hiem',
  'muc_luong'
]

interface HopdongStore {
  columnWidths: Record<string, number>
  setColumnWidth: (uid: string, width: number) => void
  pinnedColumns: Record<string, 'left' | 'right' | undefined>
  setPinnedColumn: (uid: string, pin: 'left' | 'right' | undefined) => void
  visibleColumns: Set<string>
  setVisibleColumns: (keys: Set<string>) => void
  filter: Record<string, any>
  setFilter: (filter: Record<string, any>) => void
  page: number
  setPage: (page: number) => void
  limit: number
  setLimit: (limit: number) => void
  search: string
  setSearch: (search: string) => void
  sortDescriptors: { column: string; direction: 'ascending' | 'descending' }[]
  setSortDescriptors: (
    sortDescriptors: { column: string; direction: 'ascending' | 'descending' }[]
  ) => void
  reset: () => void
}

export const useHopdongStore = create<HopdongStore>()(
  persist(
    (set) => ({
      columnWidths: {},
      setColumnWidth: (uid, width) =>
        set((state) => ({
          columnWidths: { ...state.columnWidths, [uid]: width }
        })),
      pinnedColumns: {
        stt: 'left',
        so_hop_dong: 'left',
        ho_va_ten: 'left'
      },
      setPinnedColumn: (uid, pin) =>
        set((state) => ({
          pinnedColumns: { ...state.pinnedColumns, [uid]: pin }
        })),
      visibleColumns: new Set(INITIAL_VISIBLE_COLUMNS),
      setVisibleColumns: (keys) => set({ visibleColumns: keys }),
      filter: {},
      setFilter: (filter) => set({ filter }),
      page: 1,
      setPage: (page) => set({ page }),
      limit: 10,
      setLimit: (limit) => set({ limit }),
      search: '',
      setSearch: (search) => set({ search }),
      sortDescriptors: [],
      setSortDescriptors: (sortDescriptors) => set({ sortDescriptors }),
      reset: () =>
        set({
          columnWidths: {},
          pinnedColumns: {
            stt: 'left',
            so_hop_dong: 'left',
            ho_va_ten: 'left'
          },
          visibleColumns: new Set(INITIAL_VISIBLE_COLUMNS),
          filter: {},
          page: 1,
          limit: 10,
          search: '',
          sortDescriptors: []
        })
    }),
    {
      name: 'hopdong-storage', version: 1,
      partialize: (state) => ({
        columnWidths: state.columnWidths,
        pinnedColumns: state.pinnedColumns,
        visibleColumns: Array.from(state.visibleColumns),
        filter: state.filter,
        page: state.page,
        limit: state.limit,
        search: state.search,
        sortDescriptors: state.sortDescriptors
      }),
      merge: (persistedState: any, currentState) => {
        return {
          ...currentState,
          ...persistedState,
          visibleColumns: new Set(persistedState.visibleColumns || INITIAL_VISIBLE_COLUMNS),
          filter: persistedState.filter || {},
          page: persistedState.page || 1,
          limit: persistedState.limit || 10,
          search: persistedState.search || '',
          sortDescriptors: persistedState.sortDescriptors || []
        }
      }
    }
  )
)
