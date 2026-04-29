import { CookieService } from '@renderer/utils/cookieService'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  active_flag?: string
  created_at?: string
  do_uu_tien_lanh_dao?: string
  email?: string
  id_don_vi?: string
  lan_dang_nhap_cuoi?: string
  loai?: string
  ma_don_vi?: string
  ql_nguoi_dung_avatar?: string
  ql_nguoi_dung_email?: string
  ql_nguoi_dung_ho_ten?: string
  ql_nguoi_dung_id?: string
  ql_nguoi_dung_is_admin?: string
  ql_nguoi_dung_la_lanh_dao?: string
  loai_lanh_dao?: string // LANH_DAO_DON_VI | LANH_DAO_TCHC
  ql_nguoi_dung_loai?: string
  ql_nguoi_dung_ngay_cap_nhat?: string
  ql_nguoi_dung_ngay_tao?: string
  ql_nguoi_dung_theadid?: string
  ql_nguoi_dung_token?: string
  ql_nguoi_dung_zalo_oa_uid?: string
  ql_nguoi_dung_zalo_uid?: string
  start_time?: number
  ten_don_vi?: string
  ten_don_vi_en?: string
  ten_viet_tat?: string
  updated_at?: string
  ten_cong_viec?: string
  organization_id?: string
  sub?: string
  ten_chuc_vu?: string
  ma_nhan_vien?: string
  id_nhan_vien?: string
  permissions?: string[]
  has_pin?: string | number | null
  pin_is_valid?: string | number | null
  vai_tro?: Array<{
    ql_nguoi_dung_id?: string
    ql_vai_tro_id?: string | number
    is_active?: string | number
    ql_ma_vai_tro?: string
    ql_vai_tro_ten?: string
    ten_vai_tro?: string
  }>
}

interface AuthState {
  SSORefreshToken: string
  user: User | null
  isAuthenticated: boolean
  isHrmVerified: boolean
  setUser: (user: User) => void
  logout: () => void
  setPermissions: (permissions: string[]) => void
  setHrmVerified: (verified: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      SSORefreshToken: '',
      user: null,
      isAuthenticated: false,
      isHrmVerified: false,
      setUser: (user: User) =>
        set({
          user,
          isAuthenticated: !!user
        }),
      logout: () => {
        CookieService.clearAll()
        return set({
          user: null,
          SSORefreshToken: '',
          isAuthenticated: false,
          isHrmVerified: false
        })
      },
      setPermissions: (permissions: string[]) =>
        set((state) => ({
          user: {
            ...(state.user as User),
            permissions
          }
        })),
      setHrmVerified: (verified: boolean) => set({ isHrmVerified: verified })
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isHrmVerified: state.isHrmVerified
      })
    }
  )
)
