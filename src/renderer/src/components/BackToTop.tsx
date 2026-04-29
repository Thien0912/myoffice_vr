import { useEffect, useState, useRef, RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

interface BackToTopProps {
  /** Ref to the scroll container. */
  containerRef?: RefObject<HTMLElement | null>
  /** CSS selector to find scroll container (fallback if no ref). */
  containerSelector?: string
  threshold?: number
  zIndex?: number
  /** Bottom offset in px (default: 24) */
  bottom?: number
  /** Right offset in px (default: 24) */
  right?: number
}

export default function BackToTop({
  containerRef,
  containerSelector,
  threshold = 300,
  zIndex = 50,
  bottom = 24,
  right = 24
}: BackToTopProps) {
  const [visible, setVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const attachedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null

    const getContainer = (): HTMLElement | null =>
      containerRef?.current
      ?? (containerSelector ? document.querySelector<HTMLElement>(containerSelector) : null)
      ?? document.querySelector<HTMLElement>('[data-scroll-container="main"]')

    const handleScroll = (container: HTMLElement) => () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const maxScroll = scrollHeight - clientHeight
      setVisible(scrollTop > threshold)
      setScrollProgress(maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0)
    }

    const tryAttach = (): boolean => {
      const container = getContainer()
      if (!container) return false
      if (attachedRef.current === container) return true

      // Cleanup previous
      if (attachedRef.current) {
        attachedRef.current.removeEventListener('scroll', (attachedRef.current as any).__bttHandler)
      }

      const handler = handleScroll(container)
      ;(container as any).__bttHandler = handler
      container.addEventListener('scroll', handler, { passive: true })
      handler()
      attachedRef.current = container
      return true
    }

    if (!tryAttach()) {
      let attempts = 0
      intervalId = setInterval(() => {
        attempts++
        if (tryAttach() || attempts >= 30) {
          if (intervalId) clearInterval(intervalId)
        }
      }, 100)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
      if (attachedRef.current) {
        attachedRef.current.removeEventListener('scroll', (attachedRef.current as any).__bttHandler)
        attachedRef.current = null
      }
    }
  }, [containerRef, containerSelector, threshold])

  const scrollToTop = () => {
    const container = containerRef?.current
      ?? (containerSelector ? document.querySelector<HTMLElement>(containerSelector) : null)
      ?? document.querySelector<HTMLElement>('[data-scroll-container="main"]')
    container?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const circumference = 2 * Math.PI * 18
  const strokeDashoffset = circumference * (1 - scrollProgress)

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={scrollToTop}
          style={{ zIndex, bottom, right }}
          className="fixed w-11 h-11 flex items-center justify-center rounded-full
            bg-white dark:bg-gray-800 shadow-lg shadow-blue-500/15 dark:shadow-blue-400/10
            border border-gray-200/60 dark:border-gray-700/60
            hover:shadow-xl hover:shadow-blue-500/25 dark:hover:shadow-blue-400/20
            cursor-pointer group transition-shadow duration-300"
          title="Lên đầu trang"
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="2"
              className="text-gray-100 dark:text-gray-700" />
            <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              className="text-blue-500 dark:text-blue-400 transition-all duration-150" />
          </svg>
          <ArrowUp size={16}
            className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 relative z-10" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
