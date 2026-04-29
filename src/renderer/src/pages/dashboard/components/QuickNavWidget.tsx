import { motion } from 'framer-motion'
import { Card } from '@heroui-v3/react'
import {
  FileDown,
  FileUp,
  FileSearch,
  UserSquare2,
  CalendarRange,
  MoveRight,
  ExternalLink
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const QUICK_LINKS = [
  {
    category: 'VĂN BẢN',
    title: 'Văn bản đến đơn vị',
    path: '/vanbandendonvi',
    icon: <FileDown size={32} strokeWidth={1.5} />,
    color: 'blue',
    desc: 'Nhận & xử lý'
  },
  {
    category: 'VĂN BẢN',
    title: 'Văn bản đi đơn vị',
    path: '/vanbandidonvi',
    icon: <FileUp size={32} strokeWidth={1.5} />,
    color: 'emerald',
    desc: 'Soạn & gửi đi'
  },
  {
    category: 'VĂN BẢN',
    title: 'Văn bản nội bộ',
    path: '/vanbannoibo',
    icon: <FileSearch size={32} strokeWidth={1.5} />,
    color: 'amber',
    desc: 'Lưu hành nội bộ'
  },
  {
    category: 'HỒ SƠ',
    title: 'Hồ sơ nhân sự',
    path: '/hrm/nhan-vien',
    icon: <UserSquare2 size={32} strokeWidth={1.5} />,
    color: 'blue',
    desc: 'NS & Cán bộ'
  },
  {
    category: 'NGHỈ PHÉP',
    title: 'Đăng ký nghỉ phép',
    path: '/hrm/nghi-phep',
    icon: <CalendarRange size={32} strokeWidth={1.5} />,
    color: 'rose',
    desc: 'Khởi tạo đơn nhanh'
  }
]

const COLOR_MAP: Record<string, string> = {
  blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
  orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30',
  emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30',
  amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
  rose: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30'
}

const HOVER_BG_MAP: Record<string, string> = {
  blue: 'group-hover:bg-blue-600',
  orange: 'group-hover:bg-orange-600',
  emerald: 'group-hover:bg-emerald-600',
  amber: 'group-hover:bg-amber-600',
  rose: 'group-hover:bg-rose-600'
}

const TEXT_COLOR_MAP: Record<string, string> = {
  blue: 'text-blue-600 dark:text-blue-400',
  orange: 'text-orange-600 dark:text-orange-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  amber: 'text-amber-600 dark:text-amber-400',
  rose: 'text-rose-600 dark:text-rose-400'
}

export default function QuickNavWidget() {
  const navigate = useNavigate()

  const handleNavigate = (path: string, category: string) => {
    if (category === 'NGHỈ PHÉP') {
      const isMobile = window.innerWidth < 1024
      if (isMobile) {
        navigate('/hrm/nghi-phep/dang-ky')
      } else {
        navigate('/hrm/nghi-phep?action=create')
      }
    } else {
      navigate(path)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
      {QUICK_LINKS.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="h-full"
        >
          <Card
            onClick={() => handleNavigate(item.path, item.category)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleNavigate(item.path, item.category)
              }
            }}
            role="button"
            tabIndex={0}
            className="group flex flex-col rounded-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer overflow-hidden p-[1px] relative h-full"
          >
            {/* External Link Icon on Hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 z-20">
              <ExternalLink size={12} className="text-gray-400 dark:text-gray-500" />
            </div>

            <Card.Content className="flex flex-row items-center justify-between px-3 py-4 h-full gap-2 relative z-10">
              <div className="flex items-center gap-2">
                <div
                  className={`inline-flex justify-center items-center size-12 rounded-sm transition-all transform group-hover:rotate-6 group-hover:text-white ${COLOR_MAP[item.color]} ${HOVER_BG_MAP[item.color]}`}
                >
                  <div className="scale-75 sm:scale-90 md:scale-100">{item.icon}</div>
                </div>
                <div className="flex flex-col">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${TEXT_COLOR_MAP[item.color]}`}
                  >
                    {item.category}
                  </p>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 tracking-tight transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center justify-center size-10 rounded-sm bg-gray-50 dark:bg-gray-700 group-hover:text-white transition-all ${HOVER_BG_MAP[item.color]} text-gray-400`}
              >
                <MoveRight
                  size={18}
                  className="transform group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Card.Content>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
