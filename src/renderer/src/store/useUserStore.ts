import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const INITIAL_USER_VISIBLE_COLUMNS = [
  'stt',
  'ql_nguoi_dung_ho_ten',
  'ql_nguoi_dung_email',
  'ql_nguoi_dung_is_admin',
  'id_don_vi',
  'role_ids',
  'active_flag',
  'actions'
]

interface UserStore {
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

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      columnWidths: {},
      setColumnWidth: (uid, width) =>
        set((state) => ({
          columnWidths: { ...state.columnWidths, [uid]: width }
        })),
      pinnedColumns: {
        stt: 'left',
        actions: 'right'
      },
      setPinnedColumn: (uid, pin) =>
        set((state) => ({
          pinnedColumns: { ...state.pinnedColumns, [uid]: pin }
        })),
      visibleColumns: new Set(INITIAL_USER_VISIBLE_COLUMNS),
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
            actions: 'right'
          },
          visibleColumns: new Set(INITIAL_USER_VISIBLE_COLUMNS),
          filter: {},
          page: 1,
          limit: 10,
          search: '',
          sortDescriptors: []
        })
    }),
    {
      name: 'user-storage',
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
          visibleColumns: new Set(persistedState.visibleColumns || INITIAL_USER_VISIBLE_COLUMNS),
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
