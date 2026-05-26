import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CaLamViecStore {
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
    setFilters: (data: Partial<CaLamViecStore['filters']>) => void
    reset: () => void
}

const DEFAULT_VISIBLE_COLUMNS = [
    'stt',
    'ca_lam_viec',
    'check_in',
    'check_out',
    'no_leave_day'
]

export const useCaLamViecStore = create<CaLamViecStore>()(
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
            name: 'calamviec-storage',
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
