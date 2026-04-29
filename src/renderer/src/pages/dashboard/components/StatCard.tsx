import { Card } from '@heroui-v3/react'
import { motion, Variants } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'

type StatCardProps = {
  label: string
  description?: string
  value: string
  icon: React.ReactNode
  color: string
  iconOverlay?: React.ReactNode
  percentage?: number
  isIncrease?: boolean
}
const cardVariants: Variants = {
  rest: {
    y: 0,
    scale: 1
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  }
}
const iconVariants: Variants = {
  show: {
    scale: 1
  },
  hover: {
    scale: 1.2,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 18
    }
  }
}

export default function StatCard({
  label = '[Trống]',
  description,
  value = '0',
  icon,
  iconOverlay,
  color = 'blue',
  percentage
}: StatCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      className="relative group"
    >
      <Card className="border border-gray-200 dark:border-gray-700 transition-colors duration-300 group-hover:border-blue-400 group-hover:shadow-lg group-hover:shadow-blue-500/10">
        <Card.Header>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
            {description && <small className="text-gray-400 hidden md:block">{description}</small>}
          </div>
        </Card.Header>

        <Card.Content>
          <div className="flex justify-between gap-2 relative">
            <div className="text-gray-800 dark:text-gray-100 text-3xl font-bold">{value}</div>
            <div className="relative w-14 h-14">
              <motion.div
                variants={iconVariants}
                className={`bg-${color}-100 dark:bg-${color}-900/30 border border-${color}-200 dark:border-${color}-800 p-2 rounded-sm`}
              >
                {icon}
              </motion.div>
            </div>
          </div>
        </Card.Content>

        <Card.Footer className="pt-0">
          {percentage && (
            <div className="text-[10px] flex items-center text-red-500 gap-1">
              {percentage > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}% Tỉ lệ so với
              tháng trước
            </div>
          )}
        </Card.Footer>
      </Card>

      {/* ICON NỀN - THUẦN TÚY KHÔNG BORDER */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 -translate-y-1/10 -right-2">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className={`text-${color}-600 dark:text-${color}-400 opacity-10 rotate-24 group-hover:opacity-20 transition-opacity duration-300`}
          >
            {iconOverlay || icon}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
