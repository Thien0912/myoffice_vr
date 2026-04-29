import { AnimatePresence, motion } from 'framer-motion'
import { useState, useEffect, ReactNode } from 'react'

interface ResponsiveSidebarProps {
  /** The actual sidebar content component */
  sidebar: ReactNode
  /** Main content of the page */
  children: ReactNode
  /** State whether sidebar is collapsed */
  isCollapsed: boolean
  /** Callback to close sidebar (usually on mobile backdrop click) */
  onClose: () => void
  /** Breakpoint for mobile view (default is 1024 for lg) */
  breakpoint?: number
  /** Width when expanded on desktop (default 256) */
  expandedWidth?: number
  /** Width when collapsed on desktop (default 80) */
  collapsedWidth?: number
  /** Width on mobile (default 280) */
  mobileWidth?: number
}

/**
 * A reusable layout component that handles responsive sidebar behavior:
 * - Slide-in drawer with backdrop on mobile.
 * - Flex layout with smooth transitions on desktop.
 * - Uses Framer Motion for consistent animations.
 */
export default function ResponsiveSidebar({
  sidebar,
  children,
  isCollapsed,
  onClose,
  breakpoint = 1024,
  expandedWidth = 236,
  collapsedWidth = 80,
  mobileWidth = 250
}: ResponsiveSidebarProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  return (
    <div className="flex">
      {/* Sidebar Section */}
      <AnimatePresence mode="wait">
        {(!isMobile || (isMobile && !isCollapsed)) && (
          <>
            {/* Mobile Backdrop */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[20] backdrop-blur-[1px]"
                onClick={onClose}
              />
            )}

            {/* Sidebar Motion Container */}
            <motion.div
              initial={isMobile ? { x: -mobileWidth, opacity: 0 } : { width: isCollapsed ? collapsedWidth : expandedWidth, opacity: 1 }}
              animate={isMobile ? { x: 0, opacity: 1 } : { width: isCollapsed ? collapsedWidth : expandedWidth, opacity: 1 }}
              exit={isMobile ? { x: -mobileWidth, opacity: 0 } : { width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={`
                z-[30] shrink-0 overflow-hidden
                ${isMobile ? 'fixed top-0 left-0 bottom-0 shadow-2xl' : 'sticky top-0 h-full'}
              `}
              style={{ width: isMobile ? mobileWidth : undefined }}
            >
              {sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Section */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
