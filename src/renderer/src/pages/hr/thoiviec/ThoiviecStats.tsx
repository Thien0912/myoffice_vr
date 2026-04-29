import StatCard from '@renderer/components/StatCard'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { FileClock, Users, UserX } from 'lucide-react'

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

interface ThoiviecStatsProps {
    show?: boolean
    stats?: {
        TONG?: number | string
        DANG_LAM_THU_TUC_THOI_VIEC?: number | string
        NGHI_VIEC?: number | string
    }
    isLoading?: boolean
}

export default function ThoiviecStats({ show = true, stats, isLoading = false }: ThoiviecStatsProps) {
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
                                title="Tổng số hồ sơ"
                                icon={<Users size={28} />}
                                data={[{ label: 'Tổng số hồ sơ', value: Number(stats?.TONG || 0) }]}
                                color="primary"
                                className="w-full"
                                isLoading={isLoading}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex">
                            <StatCard
                                title="Đang xử lý"
                                icon={<FileClock size={28} />}
                                data={[{ label: 'Đang làm thủ tục', value: Number(stats?.DANG_LAM_THU_TUC_THOI_VIEC || 0) }]}
                                color="warning"
                                className="w-full"
                                isLoading={isLoading}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex">
                            <StatCard
                                title="Đã nghỉ việc"
                                icon={<UserX size={28} />}
                                data={[{ label: 'Nghỉ việc', value: Number(stats?.NGHI_VIEC || 0) }]}
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

