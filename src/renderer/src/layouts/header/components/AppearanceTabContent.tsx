import { ThemeColor, useThemeStore } from '@renderer/store/useThemeStore'
import { Check, Lock, Moon, Sun } from 'lucide-react'

export default function AppearanceTabContent() {
  const { mode, themeColor } = useThemeStore()

  const colors: { value: ThemeColor; label: string; class: string }[] = [
    { value: 'blue', label: 'Xanh dương', class: 'bg-blue-500' },
    { value: 'indigo', label: 'Xanh chàm', class: 'bg-indigo-500' },
    { value: 'green', label: 'Xanh lá', class: 'bg-green-500' },
    { value: 'orange', label: 'Cam', class: 'bg-orange-500' },
    { value: 'rose', label: 'Hồng', class: 'bg-rose-500' }
  ]

  return (
    <div className="space-y-10">
      {/* Chế độ Sáng / Tối */}
      <div className="space-y-4">
        <h3 className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Chế độ hiển thị
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            className={`
              relative cursor-pointer rounded-xl p-3 border-1.5 transition-all group flex items-center gap-4
              ${mode === 'light' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/40 hover:border-blue-200'}
            `}
          >
            <div
              className={`p-2 rounded-lg shadow-sm transition-all ${mode === 'light' ? 'bg-white text-orange-500 ring-2 ring-orange-50' : 'bg-gray-100 text-gray-400'}`}
            >
              <Sun size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-normal text-sm text-gray-800 dark:text-gray-200">
                Chế độ Sáng
              </span>
              <span className="text-[11px] text-gray-500 font-normal">Mặc định hệ thống</span>
            </div>
            {mode === 'light' && (
              <div className="ml-auto text-blue-500">
                <Check size={16} strokeWidth={3} />
              </div>
            )}
          </div>

          <div className="relative cursor-not-allowed rounded-xl p-3 border-1.5 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 flex items-center gap-4 opacity-60">
            <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-400">
              <Moon size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-normal text-sm text-gray-800 dark:text-gray-200">
                Chế độ Tối
              </span>
              <span className="text-[11px] text-gray-500 flex items-center gap-1 font-normal">
                <Lock size={10} /> Đang bảo trì
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Màu chủ đạo
        </h3>
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
          {colors.map((color) => (
            <div
              key={color.value}
              className={`
                group cursor-not-allowed relative w-10 h-10 rounded-full flex items-center justify-center opacity-50 transition-transform
                ${color.class}
                ${themeColor === color.value ? 'ring-4 ring-offset-2 ring-gray-200 dark:ring-gray-700 scale-110' : ''}
              `}
              title={`${color.label} (Đang bảo trì)`}
            >
              {themeColor === color.value && (
                <Check className="text-white" size={16} strokeWidth={3} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
