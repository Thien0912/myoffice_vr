import { create } from 'zustand'

export interface OnlineUser {
    socketId: string
    user_id: string | number
    name: string
    email: string
    [key: string]: any
}

interface OnlineStoreState {
    users: OnlineUser[]
    setUsers: (users: OnlineUser[]) => void
}

export const useOnlineStore = create<OnlineStoreState>((set) => ({
    users: [],
    setUsers: (users) => set({ users }),
}))
