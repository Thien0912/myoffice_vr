import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp } from 'lucide-react'

interface FormCollapseProps {
  title: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
  /** Render anything in the right side of the header (before chevron) */
  headerRight?: React.ReactNode
  /** Icon element displayed in a colored circle before the title */
  icon?: React.ReactNode
  /** Background color class for the icon circle (e.g. 'bg-blue-50') */
  iconBg?: string
  /** Text color class for the icon (e.g. 'text-blue-500') */
  iconColor?: string
  /** Item count displayed as a badge next to the title */
  count?: number
  /** Meta text displayed between title and headerRight (e.g. "3 items • Updated ...") */
  meta?: string
  /** Label for the add button. If provided, an outline "Thêm mới" button is rendered */
  onAdd?: () => void
  /** Custom label for the add button (default: "Thêm mới") */
  addLabel?: string
  className?: string
  titleClassName?: string
  contentClassName?: string
}

export const FormCollapse: React.FC<FormCollapseProps> = ({
  title,
  children,
  defaultExpanded = true,
  headerRight,
  icon,
  iconBg = 'bg-blue-50',
  iconColor = 'text-blue-500',
  count,
  meta,
  onAdd,
  addLabel = 'Thêm mới',
  className = '',
  titleClassName = 'px-4 md:px-6',
  contentClassName = 'px-4 md:px-6 py-4'
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div
      className={`bg-white overflow-hidden border border-gray-100 ${className}`}
    >
      {/* ── Header ── */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          flex items-center justify-between w-full py-3.5
          hover:bg-gray-50/60 transition-colors cursor-pointer
          bg-white
          ${titleClassName}
        `}
      >
        {/* Left: icon + title + count */}
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div
              className={`
                w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                ${iconBg} ${iconColor}
              `}
            >
              {icon}
            </div>
          )}

          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="text-[16px] md:text-[17px] font-semibold text-gray-800 truncate"
              style={{ fontFamily: "'Roboto', sans-serif" }}
            >
              {title}
            </span>

            {count !== undefined && count > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-blue-50 text-blue-600 h-5 flex items-center justify-center min-w-[22px] shrink-0">
                {count}
              </span>
            )}
          </div>
        </div>

        {/* Right: meta + add button + headerRight + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          {meta && (
            <span className="text-xs text-gray-400 hidden sm:block whitespace-nowrap">
              {meta}
            </span>
          )}

          {onAdd && (
            <div onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={onAdd}
                className="
                  text-xs font-medium text-blue-500
                  border border-blue-200 rounded-lg
                  px-3 py-1.5
                  hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600
                  active:scale-[0.97]
                  transition-all cursor-pointer
                  whitespace-nowrap
                "
              >
                {addLabel}
              </button>
            </div>
          )}

          {headerRight && (
            <div onClick={(e) => e.stopPropagation()}>{headerRight}</div>
          )}

          <motion.div
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="text-gray-400"
          >
            <ChevronUp size={18} strokeWidth={2} />
          </motion.div>
        </div>
      </button>

      {/* ── Content ── */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="overflow-hidden bg-white"
      >
        <div className={`border-t border-gray-50 ${contentClassName}`}>
          {children}
        </div>
      </motion.div>
    </div>
  )
}
