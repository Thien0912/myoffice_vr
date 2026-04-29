// src/renderer/routes/index.ts
import { createBrowserRouter, createHashRouter } from 'react-router-dom'
import { ROUTES } from './route'
import { generateRouter, generateSidebar } from './generate'

export default function loadRoutes() {
  const isElectron = !!window.electron
  const base = import.meta.env.VITE_BASE_URL || '/'
  const routes = isElectron
    ? createHashRouter(generateRouter(ROUTES))
    : createBrowserRouter(generateRouter(ROUTES), { basename: base })

  const sidebars = generateSidebar(ROUTES[0].children || [])
  return { routes, sidebars }
}
