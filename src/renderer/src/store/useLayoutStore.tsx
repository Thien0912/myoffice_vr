import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LayoutStore {
  // Global sidebar state
  isSidebarOpen: boolean
  toggleSidebar: () => void

  // Mobile listbox state
  listBox: boolean
  toggleListBox: () => void

  // Filter drawer state
  filterDrawer: boolean
  setFilterDrawer: (value: boolean) => void

  // Scroll position (if needed for preserving scroll)
  ScrollValue: number
  setScrollValue: (value: number) => void

  // Page specific layout mode (e.g. 'table' vs 'grid' vs 'new')
  // Using a simple map of pageKey -> layoutMode string
  pageModes: Record<string, string>
  setPageMode: (pageKey: string, mode: string) => void
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      listBox: false,
      toggleListBox: () => set((state) => ({ listBox: !state.listBox })),

      filterDrawer: false,
      setFilterDrawer: (value: boolean) => set({ filterDrawer: value }),

      ScrollValue: 0,
      setScrollValue: (value: number) => set({ ScrollValue: value }),

      pageModes: { vanbanden: 'table' },
      setPageMode: (pageKey, mode) =>
        set((state) => ({
          pageModes: {
            ...state.pageModes,
            [pageKey]: mode
          }
        }))
    }),
    { name: 'layout-storage' }
  )
)
