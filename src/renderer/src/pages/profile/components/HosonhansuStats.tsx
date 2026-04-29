import { AnimatePresence, motion, Variants } from 'framer-motion'
import { Award, Briefcase, GraduationCap, Users } from 'lucide-react'
import React, { useMemo } from 'react'
import CardThongKe from './CardThongKe'

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

interface HosonhansuStatsProps {
    showStatsCards: boolean
    statsResponse: any
}

const HosonhansuStats: React.FC<HosonhansuStatsProps> = ({ showStatsCards, statsResponse }) => {
    const hocViData = useMemo(() => {
        if (!statsResponse?.data?.hoc_vi) return []
        return statsResponse.data.hoc_vi.map((item: any) => ({
            label: item.trinh_do_dt,
            value: Number(item.so_luong)
        }))
    }, [statsResponse])

    const hocHamData = useMemo(() => {
        if (!statsResponse?.data?.hoc_ham) return []
        const data = statsResponse.data.hoc_ham
        return [
            { label: 'Giáo Sư', value: Number(data.tong_giao_su || 0) },
            { label: 'Phó Giáo Sư', value: Number(data.tong_pho_giao_su || 0) }
        ]
    }, [statsResponse])

    const chucVuData = useMemo(() => {
        if (!statsResponse?.data?.chuc_vu) return []
        const data = statsResponse.data.chuc_vu
        return [
            { label: 'Giảng Viên', value: Number(data.tong_giang_vien || 0) },
            { label: 'Nhân Viên', value: Number(data.tong_nhan_vien || 0) }
        ]
    }, [statsResponse])

    return (
        <AnimatePresence>
            {showStatsCards && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-2 px-4">
                        <motion.div variants={itemVariants} className="flex">
                            <CardThongKe
                                title="Tổng số hồ sơ"
                                icon={<Users size={28} />}
                                data={[{ label: 'Tổng số hồ sơ', value: Number(statsResponse?.data?.tong_ho_so || 0) }]}
                                color="primary"
                                className="w-full"
                            />
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex">
                            <CardThongKe
                                title="Học Hàm"
                                icon={<Award size={28} />}
                                data={hocHamData}
                                color="warning"
                                className="w-full"
                            />
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex">
                            <CardThongKe
                                title="Học Vị"
                                icon={<GraduationCap size={28} />}
                                data={hocViData}
                                color="success"
                                className="w-full"
                            />
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex">
                            <CardThongKe
                                title="Chức vụ"
                                icon={<Briefcase size={28} />}
                                data={chucVuData}
                                color="primary"
                                className="w-full"
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default HosonhansuStats
