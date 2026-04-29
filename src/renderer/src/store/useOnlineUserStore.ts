import { create } from 'zustand'

export interface OnlineUser {
  ql_nguoi_dung_id: number | string
  ql_nguoi_dung_ho_ten: string
  ql_nguoi_dung_avatar: string
  ten_don_vi: string
  ten_cong_viec: string
  color?: string
  activity?: {
    type: string
    description: string
    path?: string
  }
}


interface OnlineUserStore {
  users: OnlineUser[]
  setUsers: (users: OnlineUser[]) => void
}

export const useOnlineUserStore = create<OnlineUserStore>((set) => ({
  users: [],
  setUsers: (users) => set({ users })
}))
