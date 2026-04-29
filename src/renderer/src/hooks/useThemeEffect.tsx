import { useEffect } from 'react'
import { useThemeStore } from '../store/useThemeStore'

export const useThemeEffect = () => {
  const { mode, themeColor } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement

    // Apply Dark/Light mode
    if (mode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Apply Theme Color
    root.setAttribute('data-theme', themeColor)
  }, [mode, themeColor])
}
