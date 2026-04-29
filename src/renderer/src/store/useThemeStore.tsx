import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Định nghĩa các loại theme màu hỗ trợ
export type ThemeColor = 'blue' | 'indigo' | 'green' | 'orange' | 'rose'

// Interface cho state của Theme
interface ThemeState {
  mode: 'light' | 'dark'
  themeColor: ThemeColor
  setMode: (mode: 'light' | 'dark') => void
  setThemeColor: (color: ThemeColor) => void
}

// Tạo store với persist để lưu vào localStorage
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light', // Mặc định là sáng
      themeColor: 'blue', // Mặc định là màu xanh dương
      setMode: (mode) => set({ mode }),
      setThemeColor: (color) => set({ themeColor: color })
    }),
    {
      name: 'theme-storage' // Tên key trong localStorage
    }
  )
)
