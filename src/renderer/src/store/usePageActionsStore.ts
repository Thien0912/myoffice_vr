import { create } from 'zustand'
import { ReactNode } from 'react'

interface PageActionsStore {
    actions: ReactNode
    setActions: (actions: ReactNode) => void
    clearActions: () => void
}

export const usePageActionsStore = create<PageActionsStore>((set) => ({
    actions: null,
    setActions: (actions) => set({ actions }),
    clearActions: () => set({ actions: null })
}))
