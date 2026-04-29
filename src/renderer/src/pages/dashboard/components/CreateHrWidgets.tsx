import { useMemo } from 'react'
import { motion, Variants } from 'framer-motion'
import { Card } from '@heroui-v3/react'
import { UserSquare2, FileSignature, CalendarRange, ExternalLink, CreditCard, Clock, UserRoundPen, MessageSquareQuote } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { canAccess } from '@renderer/utils/permissions/permissions'
import { useProfileModalStore } from '@renderer/store/useProfileModalStore'

interface CreateHrWidgetsProps {
  variants?: Variants
  onOpenLeaveDrawer?: () => void
}

const HR_CONFIG = [
  {
    title: 'Hồ sơ nhân sự',
    path: '/hrm/nhan-vien',
    icon: <UserSquare2 size={28} strokeWidth={1.2} />,
    color: 'blue',
    description: 'Quản lý cán bộ, nhân viên',
    permission: 'nhanvien'
  },
  {
    title: 'Hợp đồng lao động',
    path: '/hrm/hop-dong',
    icon: <FileSignature size={28} strokeWidth={1.2} />,
    color: 'emerald',
    description: 'Hợp đồng & phụ lục',
    permission: 'hopdong'
  },
  {
    title: 'Đăng ký nghỉ phép',
    path: '/hrm/nghi-phep',
    icon: <CalendarRange size={28} strokeWidth={1.2} />,
    color: 'rose',
    description: 'Khởi tạo đơn nghỉ phép'
  },
  {
    title: 'In thẻ nhân viên',
    path: '/hrm/in-the',
    icon: <CreditCard size={28} strokeWidth={1.2} />,
    color: 'orange',
    description: 'In ấn thẻ nhân viên',
    permission: 'inthe'
  },
  {
    title: 'Đăng ký ngoài giờ',
    path: '/hrm/ngoai-gio?action=create_overtime',
    icon: <Clock size={28} strokeWidth={1.2} />,
    color: 'amber',
    description: 'Khởi tạo đơn ngoài giờ'
  },
  {
    title: 'Đề xuất',
    path: '/de-xuat',
    icon: <MessageSquareQuote size={28} strokeWidth={1.2} />,
    color: 'indigo',
    description: 'Nội dung đề xuất'
  },
  {
    title: 'Gửi yêu cầu chỉnh sửa',
    path: 'action:open_profile_request',
    icon: <UserRoundPen size={28} strokeWidth={1.2} />,
    color: 'cyan',
    description: 'Cập nhật thông tin cá nhân'
  }
]

const widgetVariants: Variants = {
  rest: { y: 0 },
  hover: {
    y: -5,
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  }
}

const iconVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.15,
    transition: { type: 'spring', stiffness: 300, damping: 18 }
  }
}

const COLOR_MAP: Record<string, string> = {
  blue: '#2563eb',
  emerald: '#10b981',
  rose: '#f43f5e',
  orange: '#f97316',
  amber: '#f59e0b',
  indigo: '#4f46e5',
  cyan: '#0891b2'
}

export default function CreateHrWidgets({
  variants: parentVariants,
  onOpenLeaveDrawer
}: CreateHrWidgetsProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const profileModal = useProfileModalStore()

  const handleNavigate = (path: string) => {
    if (path === 'action:open_profile_request') {
      profileModal.open('update-request', true)
      return
    }

    if (path === '/hrm/nghi-phep') {
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        navigate('/hrm/nghi-phep/dang-ky')
      } else {
        onOpenLeaveDrawer?.()
      }
      return
    }

    navigate(path)
  }

  const filteredHr = useMemo(() => {
    return HR_CONFIG.filter((item) => !item.permission || canAccess(item.permission))
  }, [user?.permissions])

  return (
    <div className="flex flex-wrap justify-start gap-2 sm:gap-4 w-full sm:w-fit">
      {filteredHr.map((item, index) => {
        const iconHex = COLOR_MAP[item.color] || '#3b82f6'

        return (
          <motion.div
            key={index}
            variants={parentVariants}
            className="w-[calc(50%-4px)] sm:w-[226px] flex-none"
          >
            <motion.div
              variants={widgetVariants}
              initial="rest"
              whileHover="hover"
              className="flex w-full h-full"
            >
              <Card
                onClick={() => handleNavigate(item.path)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleNavigate(item.path)
                  }
                }}
                role="button"
                tabIndex={0}
                className="border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all p-6 w-full flex flex-col group justify-between relative overflow-hidden cursor-pointer"
              >
                {/* External Link Icon on Hover */}
                <div
                  className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(item.path)
                  }}
                >
                  <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <ExternalLink size={16} className="text-gray-400 dark:text-gray-500" />
                  </div>
                </div>

                <Card.Content className="flex flex-col gap-5 text-left items-start h-full relative z-10 p-0">
                  <motion.div variants={iconVariants} className={`text-${item.color}-600 shrink-0`}>
                    {item.icon}
                  </motion.div>

                  <div className="space-y-1.5 grow">
                    <h3 className="text-[16px] font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </Card.Content>

                {/* ICON NỀN - THUẦN TÚY KHÔNG BORDER */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden hidden sm:block">
                  <div className="absolute top-1/2 -translate-y-1/10 right-2">
                    <motion.div
                      animate={{
                        y: [0, -12, 0],
                        rotate: [24, 28, 24]
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      style={{ color: iconHex }}
                      className="opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                    >
                      <div className="scale-[4.3]">{item.icon}</div>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}
