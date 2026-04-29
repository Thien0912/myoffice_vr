import { AnimatePresence, motion, Variants } from 'framer-motion'
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react'
import StatCard from '@renderer/components/StatCard'

const containerVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}

interface ProposeStatsProps {
  show: boolean
  total: number
  pending: number
  approved: number
  rejected: number
  isLoading: boolean
}

export default function ProposeStats({
  show,
  total,
  pending,
  approved,
  rejected,
  isLoading
}: ProposeStatsProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex flex-col gap-2 flex-none px-0"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <motion.div variants={itemVariants} className="flex">
              <StatCard
                title="Tổng đề xuất"
                icon={<FileText />}
                data={[{ label: 'Tổng', value: total }]}
                color="primary"
                className="w-full"
                isLoading={isLoading}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="flex">
              <StatCard
                title="Chờ duyệt"
                icon={<Clock />}
                data={[{ label: 'Chờ duyệt', value: pending }]}
                color="warning"
                className="w-full"
                isLoading={isLoading}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="flex">
              <StatCard
                title="Đã duyệt"
                icon={<CheckCircle />}
                data={[{ label: 'Đã duyệt', value: approved }]}
                color="success"
                className="w-full"
                isLoading={isLoading}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="flex">
              <StatCard
                title="Từ chối"
                icon={<XCircle />}
                data={[{ label: 'Từ chối', value: rejected }]}
                color="danger"
                className="w-full"
                isLoading={isLoading}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
