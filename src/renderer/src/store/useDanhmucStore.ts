import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DanhmucStore {
    activeTab: string
    selectedSubItem: string
    setActiveTab: (tab: string) => void
    setSelectedSubItem: (item: string) => void
}

export const useDanhmucStore = create<DanhmucStore>()(
    persist(
        (set) => ({
            activeTab: '',
            selectedSubItem: '',
            setActiveTab: (tab) => set({ activeTab: tab }),
            setSelectedSubItem: (item) => set({ selectedSubItem: item })
        }),
        {
            name: 'danhmucStorage', version: 1
        }
    )
)
