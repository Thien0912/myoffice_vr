import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface IntheFilters {
    page: number
    length: number
    searchValue: string
    idDonvi: string
}

interface IntheState {
    filters: IntheFilters
    setFilters: (newFilters: Partial<IntheFilters>) => void
    resetFilters: () => void
    columnWidths: Record<string, number>
    setColumnWidth: (uid: string, width: number) => void
    pinnedColumns: Record<string, 'left' | 'right' | undefined>
    setPinnedColumn: (uid: string, pin: 'left' | 'right' | undefined) => void
    sortDescriptors: { column: string; direction: 'ascending' | 'descending' }[]
    setSortDescriptors: (sorts: { column: string; direction: 'ascending' | 'descending' }[]) => void
    activeEmployee: any | null
    setActiveEmployee: (employee: any | null) => void
}

const INITIAL_FILTERS: IntheFilters = {
    page: 1,
    length: 25,
    searchValue: '',
    idDonvi: ''
}

export const useIntheStore = create<IntheState>()(
    persist(
        (set) => ({
            filters: INITIAL_FILTERS,
            setFilters: (newFilters) =>
                set((state) => ({
                    filters: { ...state.filters, ...newFilters }
                })),
            resetFilters: () => set({ filters: INITIAL_FILTERS }),
            columnWidths: {},
            setColumnWidth: (uid, width) =>
                set((state) => ({ columnWidths: { ...state.columnWidths, [uid]: width } })),
            pinnedColumns: {
                stt: 'left',
                ma_nhan_vien: 'left',
                ho_va_ten: 'left'
            },
            setPinnedColumn: (uid, pin) =>
                set((state) => ({ pinnedColumns: { ...state.pinnedColumns, [uid]: pin } })),
            sortDescriptors: [{ column: 'ma_nhan_vien', direction: 'descending' }],
            setSortDescriptors: (sorts) => set({ sortDescriptors: sorts }),
            activeEmployee: null,
            setActiveEmployee: (employee) => set({ activeEmployee: employee })
        }),
        {
            name: 'inthe-storage', version: 1,
            storage: createJSONStorage(() => localStorage)
        }
    )
)
