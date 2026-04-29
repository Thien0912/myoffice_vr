import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DonviStore {
  columnWidths: Record<string, number>
  setColumnWidth: (uid: string, width: number) => void
  pinnedColumns: Record<string, 'left' | 'right' | undefined>
  setPinnedColumn: (uid: string, pin: 'left' | 'right' | undefined) => void
  sortDescriptors: { column: string; direction: 'ascending' | 'descending' }[]
  setSortDescriptors: (
    sortDescriptors: { column: string; direction: 'ascending' | 'descending' }[]
  ) => void

  filters: {
    page: number
    length: number
    searchValue: string
    initial_visible_columns: string[]
    selectedClassify: string
  }
  setFilters: (data: Partial<DonviStore['filters']>) => void
  reset: () => void
}

const DEFAULT_VISIBLE_COLUMNS = [
  'stt',
  'ten_don_vi',
  'ten_viet_tat',
  'loai',
  'email',
  'nguoi_co_quyen_van_thu',
  'actions'
]

export const useDonviStore = create<DonviStore>()(
  persist(
    (set) => ({
      columnWidths: {},
      setColumnWidth: (uid, width) =>
        set((state) => ({ columnWidths: { ...state.columnWidths, [uid]: width } })),
      pinnedColumns: {
        stt: 'left',
        actions: 'right'
      },
      setPinnedColumn: (uid, pin) =>
        set((state) => ({ pinnedColumns: { ...state.pinnedColumns, [uid]: pin } })),
      sortDescriptors: [],
      setSortDescriptors: (sortDescriptors) => set({ sortDescriptors }),
      filters: {
        page: 1,
        length: 10,
        searchValue: '',
        initial_visible_columns: DEFAULT_VISIBLE_COLUMNS,
        selectedClassify: 'all'
      },
      setFilters: (data) => set((state) => ({ filters: { ...state.filters, ...data } })),
      reset: () =>
        set({
          columnWidths: {},
          pinnedColumns: {
            stt: 'left',
            actions: 'right'
          },
          sortDescriptors: [],
          filters: {
            page: 1,
            length: 10,
            searchValue: '',
            initial_visible_columns: DEFAULT_VISIBLE_COLUMNS,
            selectedClassify: 'all'
          }
        })
    }),
    {
      name: 'donvi-storage'
      // partialize: (state) => ({ // Optional: select which fields to persist
      //     columnWidths: state.columnWidths,
      //     pinnedColumns: state.pinnedColumns,
      //     sortDescriptors: state.sortDescriptors,
      //     filters: state.filters
      // })
    }
  )
)
