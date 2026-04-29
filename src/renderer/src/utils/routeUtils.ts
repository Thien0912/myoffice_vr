import { ROUTES } from '../routes/route'
import { matchPath } from 'react-router-dom'

export const findRouteByPath = (pathname: string): any => {
  let found = null

  const traverse = (routes: any[], parentPath = '') => {
    for (const route of routes) {
      if (found) return

      let currentPath = ''
      if (route.path === undefined) {
        currentPath = parentPath
      } else {
        const routePath = route.path.startsWith('/') ? route.path : `/${route.path}`
        currentPath =
          (parentPath === '/' ? routePath : parentPath + routePath).replace(/\/+$/, '') || '/'
      }

      // Check match. We use matchPath to handle parameters if needed,
      // but simplistic string matching for exact paths works for this specific case if parameters aren't involved in the layout decision.
      // However, better to use matchPath for robustness.
      // matchPath requires a pattern.

      if (route.path !== undefined || route.index) {
        if (matchPath({ path: currentPath, end: true }, pathname)) {
          found = route
          return
        }
      }

      if (route.children) {
        traverse(route.children, currentPath)
      }
    }
  }

  traverse(ROUTES)
  return found
}
