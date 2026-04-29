import { create } from 'zustand'

interface SocketState {
  usersOnline: any[]
  setUsersOnline: (users: any[]) => void
}

export const useSocketStore = create<SocketState>((set) => ({
  usersOnline: [],
  setUsersOnline: (users) => set({ usersOnline: users })
}))
