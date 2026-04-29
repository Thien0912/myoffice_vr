import { create } from 'zustand'

interface ProfileModalStore {
  isOpen: boolean
  selectedTab: string
  isUpdateDrawerOpen: boolean
  open: (tab?: string, openUpdateDrawer?: boolean) => void
  close: () => void
  // State methods to allow ProfileModal to sync its local state to the store if needed
  setSelectedTab: (tab: string) => void
  setUpdateDrawerOpen: (isOpen: boolean) => void
}

export const useProfileModalStore = create<ProfileModalStore>((set) => ({
  isOpen: false,
  selectedTab: 'profile',
  isUpdateDrawerOpen: false,
  open: (tab = 'profile', openUpdateDrawer = false) =>
    set({
      isOpen: true,
      selectedTab: tab,
      isUpdateDrawerOpen: openUpdateDrawer
    }),
  close: () => set({ isOpen: false }),
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  setUpdateDrawerOpen: (isOpen) => set({ isUpdateDrawerOpen: isOpen })
}))
