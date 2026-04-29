import { motion, Variants } from 'framer-motion'
import CreateDocumentWidgets from './components/CreateDocumentWidgets'
import CreateHrWidgets from './components/CreateHrWidgets'
import { useState } from 'react'
import CreateLeaveRequestModal from '../hr/leave/components/CreateLeaveRequestModal'
import MinimizedDock from '@renderer/components/MinimizedDock'

// Animation Variants
const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  }
}

export default function DashboardPage() {
  // Lấy thông tin người dùng từ store (nếu sau này cần dùng)
  // const { user } = useAuthStore()

  // State quản lý modal nghỉ phép
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isLeaveModalMinimized, setIsLeaveModalMinimized] = useState(false)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-2 sm:gap-4 p-1"
    >
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center sm:items-start sm:w-fit gap-2 sm:gap-4">
        {/* 1. DOCUMENT ACTION WIDGETS SECTION (TOP) */}
        <motion.div variants={itemVariants} className="w-full">
          <CreateDocumentWidgets variants={itemVariants} />
        </motion.div>

        {/* 2. HR ACTION WIDGETS SECTION */}
        <motion.div variants={itemVariants} className="w-full">
          <CreateHrWidgets
            variants={itemVariants}
            onOpenLeaveDrawer={() => {
              setIsLeaveModalOpen(true)
              setIsLeaveModalMinimized(false)
            }}
          />
        </motion.div>
      </div>

      {/* 3. LEAVE REGISTRATION MODAL & DOCK */}
      <CreateLeaveRequestModal
        isOpen={isLeaveModalOpen && !isLeaveModalMinimized}
        onOpenChange={setIsLeaveModalOpen}
        onMinimize={() => setIsLeaveModalMinimized(true)}
        onSuccess={() => { }}
      />

      {isLeaveModalMinimized && (
        <MinimizedDock
          title="Đơn nghỉ phép mới"
          onClose={() => {
            setIsLeaveModalMinimized(false)
            setIsLeaveModalOpen(false)
          }}
          onRestore={() => setIsLeaveModalMinimized(false)}
        />
      )}

    </motion.div>
  )
}
