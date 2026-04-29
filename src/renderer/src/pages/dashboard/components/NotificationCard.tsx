import { motion, Variants } from 'framer-motion'
import { Card, Button } from '@heroui-v3/react'
import { MailPlus, MoveRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface NotificationCardProps {
  count: number
  variants?: Variants
}

export default function NotificationCard({ count, variants }: NotificationCardProps) {
  const navigate = useNavigate()
  // if (count === 0) return null

  return (
    <motion.div
      variants={variants}
      className="h-full"
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className="border border-gray-200 dark:border-gray-700 text-blue-900 dark:text-blue-100 bg-white dark:bg-gray-800 overflow-hidden relative h-full group hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
        <Card.Content className="flex flex-col sm:flex-row items-center justify-between relative z-10 px-6 py-3 h-full gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative">
              <div className="inline-flex justify-center items-center size-14 bg-blue-600 dark:bg-blue-500 rounded-sm text-white shrink-0">
                <MailPlus size={32} strokeWidth={1.5} />
              </div>
              <div className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
            </div>

            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                Thư mới hôm nay
              </p>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Hệ thống tiếp nhận
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 mx-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold rounded-sm border border-blue-100 dark:border-blue-800">
                  {count}
                </span>
                văn bản mới
              </div>
            </div>
          </div>

          <Button
            className="bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all px-4 h-8 shrink-0 group/btn"
            size="sm"
            onPress={() => navigate('/vanbanden')}
          >
            Kiểm tra
            <MoveRight
              size={16}
              className="ml-1.5 group-hover/btn:translate-x-1 transition-transform"
            />
          </Button>
        </Card.Content>
      </Card>
    </motion.div>
  )
}
