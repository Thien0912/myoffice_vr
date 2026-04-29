import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface NhanVienTuCapNhatFilters {
    page: number
    length: number
    searchValue: string
    initial_visible_columns: string[]
    dateRange: {
        fromDate: string
        toDate: string
    }
}

interface NhanVienTuCapNhatState {
    filters: NhanVienTuCapNhatFilters
    setFilters: (newFilters: Partial<NhanVienTuCapNhatFilters>) => void
    resetFilters: () => void
    columnWidths: Record<string, number>
    setColumnWidth: (uid: string, width: number) => void
    pinnedColumns: Record<string, 'left' | 'right' | undefined>
    setPinnedColumn: (uid: string, pin: 'left' | 'right' | undefined) => void
    sortDescriptors: { column: string; direction: 'ascending' | 'descending' }[]
    setSortDescriptors: (sorts: { column: string; direction: 'ascending' | 'descending' }[]) => void
    showStatsCards: boolean
    setShowStatsCards: (show: boolean) => void
}

const INITIAL_FILTERS: NhanVienTuCapNhatFilters = {
    page: 1,
    length: 10,
    searchValue: '',
    initial_visible_columns: ['stt', 'ma_nhan_vien', 'ho_va_ten', 'trang_thai', 'ql_nguoi_dung_ho_ten', 'du_lieu', 'ngay_tao'],
    dateRange: {
        fromDate: '',
        toDate: ''
    }
}

export const useNhanVienTuCapNhatStore = create<NhanVienTuCapNhatState>()(
    persist(
        (set) => ({
            filters: INITIAL_FILTERS,
            setFilters: (newFilters) =>
                set((state) => ({ filters: { ...state.filters, ...newFilters, page: newFilters.page || state.filters.page } })),
            resetFilters: () => set({ filters: INITIAL_FILTERS }),
            columnWidths: {},
            setColumnWidth: (uid, width) =>
                set((state) => ({ columnWidths: { ...state.columnWidths, [uid]: width } })),
            pinnedColumns: {},
            setPinnedColumn: (uid, pin) =>
                set((state) => ({ pinnedColumns: { ...state.pinnedColumns, [uid]: pin } })),
            sortDescriptors: [],
            setSortDescriptors: (sorts) => set({ sortDescriptors: sorts }),
            showStatsCards: true,
            setShowStatsCards: (show) => set({ showStatsCards: show })
        }),
        {
            name: 'nhan-vien-tu-cap-nhat-storage', version: 1,
            storage: createJSONStorage(() => localStorage)
        }
    )
)
