import { motion, Variants } from 'framer-motion'
import { Card } from '@heroui-v3/react'
import { FilePlus, Plus, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const QUICK_ACTIONS = [
  {
    title: 'Soạn văn bản đến',
    icon: <FilePlus size={22} className="text-blue-600" />,
    path: '/vanbanden',
    bg: 'bg-blue-50'
  },
  {
    title: 'Soạn văn bản đi',
    icon: <Plus size={22} className="text-emerald-600" />,
    path: '/vanbandi',
    bg: 'bg-emerald-50'
  },
  {
    title: 'Soạn văn bản đi',
    subtitle: '(Của đơn vị)',
    icon: <Send size={22} className="text-sky-600" />,
    path: '/vanbandidonvi',
    bg: 'bg-sky-50'
  }
]

interface QuickActionsProps {
  variants?: Variants
}

export default function QuickActions({ variants }: QuickActionsProps) {
  const navigate = useNavigate()

  const handleNavigate = (path: string) => {
    navigate(path, { state: { openCreateModal: true } })
  }

  return (
    <motion.div variants={variants} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
        {QUICK_ACTIONS.map((action, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-full"
          >
            <Card
              onClick={() => handleNavigate(action.path)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  handleNavigate(action.path)
                }
              }}
              role="button"
              tabIndex={0}
              className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all duration-300 h-full min-h-[165px] cursor-pointer"
            >
              <Card.Content className="flex flex-col items-center justify-center p-0">
                <div
                  className={`w-14 h-14 rounded-2xl ${action.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                >
                  {action.icon}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 text-center group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </span>
                  {action.subtitle && (
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">
                      {action.subtitle}
                    </span>
                  )}
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
