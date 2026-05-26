import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ViTriCongViecStore {
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
    setFilters: (data: Partial<ViTriCongViecStore['filters']>) => void
    reset: () => void
}

const DEFAULT_VISIBLE_COLUMNS = [
    'stt',
    'ten_cong_viec',
    'ten_cong_viec_en'
]

export const useViTriCongViecStore = create<ViTriCongViecStore>()(
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
                        length: state.filters.length, // Keep current length
                        searchValue: '',
                        initial_visible_columns: DEFAULT_VISIBLE_COLUMNS,
                    }
                }))
        }),
        {
            name: 'vitricongviec-storage',
            partialize: (state) => ({
                columnWidths: state.columnWidths,
                pinnedColumns: state.pinnedColumns,
                sortDescriptors: state.sortDescriptors,
                filters: {
                    ...state.filters,
                    page: 1
                }
            })
        }
    )
)
