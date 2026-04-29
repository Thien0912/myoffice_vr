/**
 * Khi role thay đổi, invalidate tất cả queries để trigger refetch
 * Được gọi từ Header khi user change role thành công
 */
import { QueryClient } from '@tanstack/react-query'

/**
 * Invalidate tất cả React Query cache
 * Dùng khi role thay đổi để các trang hiện tại tự động call API lại
 */
export const invalidateAllQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries()
}
