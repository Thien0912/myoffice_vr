import StatCard from '@renderer/components/StatCard'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { CheckCircle, Clock, FileText, XCircle } from 'lucide-react'

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

interface NhanVienTuCapNhatStatsProps {
    show: boolean
    total: number
    pending: number
    approved: number
    rejected: number
    isLoading: boolean
}

export default function NhanVienTuCapNhatStats({
    show,
    total,
    pending,
    approved,
    rejected,
    isLoading
}: NhanVienTuCapNhatStatsProps) {
    return (
        <AnimatePresence mode="wait">
            {show && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col gap-2 flex-none px-6"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <motion.div variants={itemVariants} className="flex">
                            <StatCard
                                title="Tổng yêu cầu"
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
