import { useAuthStore } from '@renderer/store/useAuthStore'
import React from 'react'

const isModuleEnabled = (route: any): boolean => {
  if (import.meta.env.VITE_IS_FULL_SPA === 'true') return true
  const spaModules = (import.meta.env.VITE_SPA_MODULES || '').split(',').map((s: string) => s.trim().toLowerCase())
  
  // Nếu route không yêu cầu module cụ thể hoặc là route hệ thống (không có module key) -> Cho phép
  if (!route.module) return true
  
  return spaModules.includes(route.module.toLowerCase())
}

const canAccess = (route: any, user: any): boolean => {
  const permissions = user?.permissions || []

  // 1. Check Full Access (Admin bypass)
  if (user?.ql_nguoi_dung_is_admin === '1') {
    return true
  }

  // 2. Nếu route không định nghĩa permission -> Public access
  if (!route.permission || route.permission === false) {
    return true
  }

  // 3. Nếu route có permission (array) -> Check overlap with user permissions
  if (Array.isArray(route.permission)) {
    return route.permission.some((routePerm: string) =>
      permissions.some(
        (userPerm: string) => userPerm === routePerm || userPerm.startsWith(`${routePerm}.`)
      )
    )
  }

  return true
}

export const generateRouter = (routes: any[]) => {
  try {
    const { user } = useAuthStore.getState()

    return routes
      .map((r) => {
        const hasAccess = canAccess(r, user)
        const isEnabled = isModuleEnabled(r)

        if (!hasAccess || !isEnabled) {
          return null
        }

        return {
          path: r.path,
          index: r.index,
          element: r.Component ? React.createElement(r.Component) : undefined,
          children: r.children ? generateRouter(r.children) : undefined
        }
      })
      .filter(Boolean) as any[]
  } catch (error) {
    console.error(error)
    return []
  }
}

export const generateSidebar = (routes: any[]) => {
  try {
    const { user } = useAuthStore.getState()

    return routes
      .filter((r) => {
        const visible = r.title && !r.hide
        if (!visible) return false

        return canAccess(r, user) && isModuleEnabled(r)
      })
      .map((r) => ({
        title: r.title,
        abbre: r.abbre,
        icon: r.icon,
        path: r.path,
        children: r.children ? generateSidebar(r.children) : []
      }))
  } catch (error) {
    console.error(error)
    return []
  }
}
