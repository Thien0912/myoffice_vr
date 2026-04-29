import { useLocation, useNavigate, matchPath } from 'react-router-dom'
import { ROUTES } from '@renderer/routes/route'

export interface BreadcrumbItem {
  label: string
  path: string
  description?: string
  isLast: boolean
  onClick?: () => void
}

/**
 * Tìm đường dẫn (trail) từ cấu trúc ROUTES dựa trên pathname hiện tại.
 */
const getBreadcrumbTrail = (
  routes: any[],
  targetPath: string,
  parentPath = ''
): BreadcrumbItem[] | null => {
  for (const route of routes) {
    let currentPath = parentPath

    if (route.path !== undefined) {
      const routePath = route.path.startsWith('/') ? route.path : `/${route.path}`
      currentPath =
        (parentPath === '/' ? routePath : parentPath + routePath).replace(/\/+$/, '') || '/'
    }

    // 1. Kiểm tra xem route hiện tại có nằm trên đường dẫn dẫn tới targetPath không
    const isExactMatch = matchPath({ path: currentPath, end: true }, targetPath)
    const isIndexMatch = route.index && parentPath === targetPath
    const isPatternMatch = matchPath({ path: currentPath, end: false }, targetPath)

    // Nếu không khớp và không phải index route, bỏ qua
    if (!isPatternMatch && !route.index) continue

    // 2. Tìm kiếm trong con
    let childrenTrail: BreadcrumbItem[] | null = null
    if (route.children && route.children.length > 0) {
      childrenTrail = getBreadcrumbTrail(route.children, targetPath, currentPath)
    }

    // 3. Kiểm tra khớp chính xác hoặc khớp index hoặc tìm thấy trong con
    if (isExactMatch || isIndexMatch || childrenTrail !== null) {
      const trail: BreadcrumbItem[] = []
      const finalChildrenTrail = childrenTrail || []

      // Chỉ thêm vào breadcrumb nếu có title và KHÔNG phải là trang chủ (sẽ add riêng ở đầu)
      if (route.title && route.title !== 'Trang chủ') {
        trail.push({
          label: route.title,
          path: isExactMatch || isIndexMatch ? targetPath : currentPath,
          description: route.description,
          isLast: finalChildrenTrail.length === 0
        })
      }

      return [...trail, ...finalChildrenTrail]
    }
  }
  return null
}

export const useBreadcrumbMap = (): BreadcrumbItem[] => {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // 1. Luôn bắt đầu với Trang chủ
  const breadcrumbItems: BreadcrumbItem[] = []

  // Tìm thông tin trang chủ từ ROUTES
  const mainLayout = ROUTES.find((r) => r.path === '/')
  const homeRoute = mainLayout?.children?.find((r: any) => r.index)

  breadcrumbItems.push({
    label: homeRoute?.title || 'Trang chủ',
    path: '/',
    description: homeRoute?.description,
    isLast: pathname === '/'
  })

  // 2. Lấy các phần còn lại từ trail (loại bỏ nếu trail chứa trang chủ để tránh lặp)
  if (pathname !== '/') {
    const trail = getBreadcrumbTrail(ROUTES, pathname)
    if (trail) {
      breadcrumbItems.push(...trail)
    }
  }

  // 3. Chuẩn hóa isLast và logic click
  return breadcrumbItems.map((item, index) => {
    const isLast = index === breadcrumbItems.length - 1

    // Không cho click nếu là mục cuối
    // Nếu path là của một grouping route (path: undefined), ta thường không chuyển trang được
    // trừ khi có link cụ thể.
    return {
      ...item,
      isLast,
      onClick: !isLast ? () => navigate(item.path) : undefined
    }
  })
}
