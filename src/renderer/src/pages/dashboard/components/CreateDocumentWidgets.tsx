import { useMemo } from 'react'
import { motion, Variants } from 'framer-motion'
import { Card } from '@heroui-v3/react'
import { FilePlus, Send, FolderLock, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { canAccess } from '@renderer/utils/permissions/permissions'

interface CreateDocumentWidgetsProps {
  variants?: Variants
  allowedTypes?: string[]
}

const DOCUMENTS_CONFIG = [
  {
    type: 'vanbanden',
    title: 'Văn bản đến',
    path: '/vanbanden',
    icon: <FilePlus size={28} strokeWidth={1.2} />,
    color: 'blue',
    description: 'Tiếp nhận văn bản mới',
    permission: 'vanbanden'
  },
  {
    type: 'vanbandi',
    title: 'Văn bản đi',
    path: '/vanbandi',
    icon: <Send size={28} strokeWidth={1.2} />,
    color: 'emerald',
    description: 'Khởi tạo văn bản đi',
    permission: 'vanbandi'
  },
  {
    type: 'vanbandendonvi',
    title: 'Văn bản đến đơn vị',
    path: '/vanbandendonvi',
    icon: <FilePlus size={28} strokeWidth={1.2} />,
    color: 'sky',
    description: 'Xử lý văn bản đơn vị',
    permission: 'vanbandendonvi'
  },
  {
    type: 'vanbandidonvi',
    title: 'Văn bản đi đơn vị',
    path: '/vanbandidonvi',
    icon: <Send size={28} strokeWidth={1.2} />,
    color: 'indigo',
    description: 'Văn bản đi của đơn vị',
    permission: 'vanbandidonvi'
  },
  {
    type: 'vanbannoibo',
    title: 'Văn bản nội bộ',
    path: '/vanbannoibo',
    icon: <FolderLock size={28} strokeWidth={1.2} />,
    color: 'amber',
    description: 'Lưu hành nội bộ',
    permission: 'vanbannoibo'
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
  sky: '#0ea5e9',
  indigo: '#6366f1',
  amber: '#f59e0b'
}

export default function CreateDocumentWidgets({
  variants: parentVariants,
  allowedTypes
}: CreateDocumentWidgetsProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const handleNavigate = (path: string) => {
    navigate(path, { state: { openCreateModal: true } })
  }

  // Lọc các widget dựa trên quyền (canAccess) và allowedTypes nếu có
  const filteredDocs = useMemo(() => {
    let docs = DOCUMENTS_CONFIG.filter((doc) => canAccess(doc.permission))

    if (allowedTypes) {
      docs = docs.filter((doc) => allowedTypes.includes(doc.type))
    }

    return docs
  }, [allowedTypes, user?.permissions])

  return (
    <div className="flex flex-wrap justify-start gap-2 sm:gap-4 w-full sm:w-fit">
      {filteredDocs.map((doc, index) => {
        const iconHex = COLOR_MAP[doc.color] || '#3b82f6'

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
              className="flex h-full"
            >
              <Card
                onClick={() => handleNavigate(doc.path)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleNavigate(doc.path)
                  }
                }}
                role="button"
                tabIndex={0}
                className="border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all p-6 w-full flex flex-col group justify-between relative overflow-hidden cursor-pointer"
              >
                {/* External Link Icon on Hover */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 z-20">
                  <ExternalLink size={14} className="text-gray-400 dark:text-gray-500" />
                </div>

                <Card.Content className="flex flex-col gap-5 text-left items-start h-full relative z-10 p-0">
                  <motion.div variants={iconVariants} className={`text-${doc.color}-600 shrink-0`}>
                    {doc.icon}
                  </motion.div>

                  <div className="space-y-1.5 grow">
                    <h3 className="text-[16px] font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight line-clamp-1">
                      {doc.title}
                    </h3>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium line-clamp-2">
                      {doc.description}
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
                      <div className="scale-[4.3]">{doc.icon}</div>
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
