import { motion, Variants } from 'framer-motion'
import { Card } from '@heroui-v3/react'
import { CalendarRange, MoveRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

interface LeaveRegistrationWidgetProps {
  variants?: Variants
}

export default function LeaveRegistrationWidget({ variants }: LeaveRegistrationWidgetProps) {
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 1024
    const handleResize = () => setIsMobile(checkMobile())
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleAction = () => {
    if (isMobile) {
      navigate('/hrm/nghi-phep/dang-ky')
    } else {
      navigate('/hrm/nghi-phep?action=create')
    }
  }

  return (
    <motion.div
      variants={variants}
      className="h-full"
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card
        onClick={handleAction}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleAction()
          }
        }}
        role="button"
        tabIndex={0}
        className="border border-gray-200 dark:border-gray-700 text-blue-900 dark:text-blue-100 bg-white dark:bg-gray-800 overflow-hidden relative h-full group hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer"
      >
        <Card.Content className="flex flex-row items-center justify-between relative z-10 px-6 py-3 h-full gap-4">
          <div className="flex items-center gap-4">
            <div className="inline-flex justify-center items-center size-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-sm group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-6">
              <CalendarRange size={32} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">
                NGHỈ PHÉP
              </p>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 tracking-tight transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Đăng ký nghỉ phép
              </h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                Khởi tạo đơn trực tuyến
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center size-10 rounded-sm bg-gray-50 dark:bg-gray-700 group-hover:bg-blue-600 text-gray-400 group-hover:text-white transition-all">
            <MoveRight
              size={18}
              className="transform group-hover:translate-x-1 transition-transform"
            />
          </div>
        </Card.Content>
      </Card>
    </motion.div>
  )
}
