import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DaoTaoStore {
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
    }
    setFilters: (data: Partial<DaoTaoStore['filters']>) => void
    reset: () => void
}

const DEFAULT_VISIBLE_COLUMNS = [
    'stt',
    'ten_khoa_hoc',
    'noi_dung',
    'ngay_bat_dau',
    'ngay_ket_thuc',
    'trang_thai',
    'actions'
]

export const useDaoTaoStore = create<DaoTaoStore>()(
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
            },
            setFilters: (data) => set((state) => ({ filters: { ...state.filters, ...data } })),
            reset: () =>
                set((state) => ({
                    columnWidths: {},
                    pinnedColumns: {
                        stt: 'left',
                        actions: 'right'
                    },
                    sortDescriptors: [],
                    filters: {
                        page: 1,
                        length: state.filters.length,
                        searchValue: '',
                        initial_visible_columns: DEFAULT_VISIBLE_COLUMNS,
                    }
                }))
        }),
        {
            name: 'daotao-storage',
            partialize: (state) => ({
                columnWidths: state.columnWidths,
                pinnedColumns: state.pinnedColumns,
                sortDescriptors: state.sortDescriptors,
                filters: {
                    ...state.filters,
                    page: 1,
                    searchValue: '',
                }
            })
        }
    )
)
