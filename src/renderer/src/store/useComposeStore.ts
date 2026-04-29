import { create } from 'zustand'

export type ComposeItem = {
  id: string
  type: 'vanbanden' | 'vanbandi' | 'vanbannoibo' | 'vanbandidonvi'
  isOpen: boolean
  isMinimized: boolean
  formData: Record<string, any>
  fileGroups: Record<string, File[]>
}

export type ComposeState = {
  items: ComposeItem[]
  // Actions
  onOpen: (type: 'vanbanden' | 'vanbandi' | 'vanbannoibo' | 'vanbandidonvi') => void
  onClose: (id: string) => void
  onMinimize: (id: string) => void
  onRestore: (id: string) => void
  setFormData: (id: string, data: Record<string, any> | ((prev: any) => any)) => void
  setFileGroups: (id: string, files: Record<string, File[]>) => void
  reset: (id: string) => void
}

export const useComposeStore = create<ComposeState>((set) => ({
  items: [],

  onOpen: (type) =>
    set((state) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newItem: ComposeItem = {
        id,
        type,
        isOpen: true,
        isMinimized: false,
        formData: {},
        fileGroups: {}
      }
      return { items: [...state.items, newItem] }
    }),

  onClose: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id)
    })),

  onMinimize: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, isOpen: false, isMinimized: true } : item
      )
    })),

  onRestore: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, isOpen: true, isMinimized: false } : item
      )
    })),

  setFormData: (id, data) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id === id) {
          const newData = typeof data === 'function' ? data(item.formData) : data
          return { ...item, formData: { ...item.formData, ...newData } }
        }
        return item
      })
    })),

  setFileGroups: (id, files) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, fileGroups: { ...item.fileGroups, ...files } } : item
      )
    })),

  reset: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id)
    }))
}))
