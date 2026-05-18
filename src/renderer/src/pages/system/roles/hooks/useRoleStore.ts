import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const INITIAL_ROLE_CLONE_VISIBLE_COLUMNS = [
    'stt',
    'ql_vai_tro_ten',
    'ql_vai_tro_mo_ta',
    'ql_vai_tro_ngay_tao',
    'actions'
]

interface RoleStore {
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
    activeRoleId: string | number | undefined
    setActiveRoleId: (id: string | number | undefined) => void
    reset: () => void
    isCollapsed: boolean
    setIsCollapsed: (isCollapsed: boolean) => void
    activeTab: string
    setActiveTab: (tab: string) => void
    isManagingMember: boolean
    setIsManagingMember: (isManaging: boolean) => void
    hasUnsavedChanges: boolean
    setHasUnsavedChanges: (has: boolean) => void
}

export const useRoleStore = create<RoleStore>()(
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
            visibleColumns: new Set(INITIAL_ROLE_CLONE_VISIBLE_COLUMNS),
            setVisibleColumns: (keys) => set({ visibleColumns: keys }),
            filter: {},
            setFilter: (filter) => set({ filter }),
            page: 1,
            setPage: (page) => set({ page }),
            limit: 10,
            setLimit: (limit) => set({ limit, page: 1 }),
            search: '',
            setSearch: (search) => set({ search }),
            sortDescriptors: [],
            setSortDescriptors: (sortDescriptors) => set({ sortDescriptors }),
            activeRoleId: undefined,
            setActiveRoleId: (activeRoleId) => set({ activeRoleId }),
            isCollapsed: false,
            setIsCollapsed: (isCollapsed) => set({ isCollapsed }),
            activeTab: 'info',
            setActiveTab: (activeTab) => set({ activeTab }),
            isManagingMember: false,
            setIsManagingMember: (isManagingMember) => set({ isManagingMember }),
            hasUnsavedChanges: false,
            setHasUnsavedChanges: (has) => set({ hasUnsavedChanges: has }),
            reset: () =>
                set({
                    columnWidths: {},
                    pinnedColumns: {
                        stt: 'left',
                        actions: 'right'
                    },
                    visibleColumns: new Set(INITIAL_ROLE_CLONE_VISIBLE_COLUMNS),
                    filter: {},
                    page: 1,
                    limit: 10,
                    search: '',
                    sortDescriptors: [],
                    activeRoleId: undefined,
                    isCollapsed: false,
                    activeTab: 'info',
                    isManagingMember: false,
                    hasUnsavedChanges: false
                })
        }),
        {
            name: 'role-clone-storage',
            partialize: (state) => ({
                columnWidths: state.columnWidths,
                pinnedColumns: state.pinnedColumns,
                visibleColumns: Array.from(state.visibleColumns),
                filter: state.filter,
                page: state.page,
                limit: state.limit,
                search: state.search,
                sortDescriptors: state.sortDescriptors,
                activeRoleId: state.activeRoleId,
                isCollapsed: state.isCollapsed,
                activeTab: state.activeTab,
                isManagingMember: state.isManagingMember
            }),
            merge: (persistedState: any, currentState) => {
                return {
                    ...currentState,
                    ...persistedState,
                    visibleColumns: new Set(persistedState.visibleColumns || INITIAL_ROLE_CLONE_VISIBLE_COLUMNS),
                    filter: persistedState.filter || {},
                    page: persistedState.page || 1,
                    limit: persistedState.limit || 10,
                    search: persistedState.search || '',
                    sortDescriptors: persistedState.sortDescriptors || [],
                    activeRoleId: persistedState.activeRoleId,
                    isCollapsed: persistedState.isCollapsed || false,
                    activeTab: persistedState.activeTab || 'info',
                    isManagingMember: persistedState.isManagingMember || false
                }
            }
        }
    )
)
