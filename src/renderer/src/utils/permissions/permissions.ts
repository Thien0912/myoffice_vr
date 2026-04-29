import { useAuthStore } from '@renderer/store/useAuthStore'

/**
 * Kiểm tra xem người dùng hiện tại có quyền truy cập cụ thể hay không.
 * Data quyền được lấy từ store auth (user.permissions).
 *
 * @param permissionKey Mã quyền cần kiểm tra (Ví dụ: 'vanbannoibo.update')
 * @returns boolean True nếu có quyền, False nếu không.
 */
export const canAccess = (permissionKey: string): boolean => {
  const { user } = useAuthStore.getState()

  if (!user) return false

  // Nếu là Admin -> Luôn có quyền (bypass mọi filter)
  if (user.ql_nguoi_dung_is_admin === '1') return true

  // Kiểm tra mã quyền cụ thể trong danh sách
  return user.permissions?.includes(permissionKey) ?? false
}

/**
 * Kiểm tra xem user có ÍT NHẤT MỘT trong các quyền được liệt kê.
 * @param permissionKeys Mảng các mã quyền
 */
export const hasAnyPermission = (permissionKeys: string[]): boolean => {
  const { user } = useAuthStore.getState()

  if (!user) return false

  // Nếu là Admin -> Luôn có quyền
  if (user.ql_nguoi_dung_is_admin === '1') return true

  return permissionKeys.some((key) => user.permissions?.includes(key))
}

/**
 * Kiểm tra xem user có TẤT CẢ các quyền được liệt kê.
 * @param permissionKeys Mảng các mã quyền
 */
export const hasAllPermissions = (permissionKeys: string[]): boolean => {
  const { user } = useAuthStore.getState()

  if (!user) return false

  // Nếu là Admin -> Luôn có quyền
  if (user.ql_nguoi_dung_is_admin === '1') return true

  return permissionKeys.every((key) => user.permissions?.includes(key))
}
