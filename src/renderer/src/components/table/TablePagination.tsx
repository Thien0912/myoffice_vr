import { Pagination } from '@heroui-v3/react'
import { useEffect, useState } from 'react'

// --- TableLimitSelector ---
export interface TableLimitSelectorProps {
  limit: number
  total: number
  filtered?: number
  onChangeLimit: (limit: number) => void
  className?: string
}

export function TableLimitSelector({
  limit,
  total,
  filtered,
  onChangeLimit,
  className = ''
}: TableLimitSelectorProps) {
  return (
    <div
      className={`flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ${className}`}
    >
      <span className="hidden sm:inline whitespace-nowrap">Hiển thị</span>
      <select
        className="bg-transparent outline-none font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5"
        value={limit}
        onChange={(e) => onChangeLimit(Number(e.target.value))}
      >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
      <span className="hidden sm:inline whitespace-nowrap">dòng / trang</span>
      <span className="text-gray-300 dark:text-gray-600">|</span>
      <span className="whitespace-nowrap">
        {filtered !== undefined ? `Lọc (${filtered})/` : ''}
        {total}
        <span className="hidden sm:inline"> dòng</span>
      </span>
    </div>
  )
}

// --- TablePaginationControl ---
export interface TablePaginationControlProps {
  page: number
  total: number
  limit: number
  onChangePage: (page: number) => void
  className?: string
}

export function TablePaginationControl({
  page,
  total,
  limit,
  onChangePage,
  className = ''
}: TablePaginationControlProps) {
  const totalPages = Math.ceil(total / limit) || 1
  const [isMobile, setIsMobile] = useState(false)
  const [jumpValue, setJumpValue] = useState('')

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Helper to generate visible page numbers with MUI-style consistent width
  const getPageNumbers = () => {
    // Mobile optimization: User wants only 1 page shown
    if (isMobile) return [page]

    const totalPageCount = totalPages
    const siblingCount = 1
    const totalVisible = 7 // 1(first) + 1(last) + 1(current) + 2(siblings) + 2(ellipses)

    if (totalPageCount <= totalVisible) {
      return Array.from({ length: totalPageCount }, (_, i) => i + 1)
    }

    const leftSiblingIndex = Math.max(page - siblingCount, 1)
    const rightSiblingIndex = Math.min(page + siblingCount, totalPageCount)

    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 1

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
      return [...leftRange, '...', totalPageCount]
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPageCount - rightItemCount + i + 1
      )
      return [1, '...', ...rightRange]
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      )
      return [1, '...', ...middleRange, '...', totalPageCount]
    }

    return []
  }

  const handleJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const targetPage = Number(jumpValue)
      if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
        onChangePage(targetPage)
      }
      setJumpValue('')
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Pagination size="sm" className="gap-1">
        <Pagination.Content className="gap-0.5">
          {/* First page */}
          <Pagination.Item>
            <button
              disabled={page === 1}
              onClick={() => onChangePage(1)}
              className="min-w-8 sm:min-w-10 h-8 px-2 sm:px-3 rounded-md bg-transparent dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-100 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {'<<'}
            </button>
          </Pagination.Item>

          <Pagination.Item>
            <Pagination.Previous
              isDisabled={page === 1}
              onPress={() => onChangePage(Math.max(1, page - 1))}
              className="min-w-8 sm:min-w-10 h-8 px-2 sm:px-3 rounded-md bg-transparent dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-100"
            >
              <Pagination.PreviousIcon />
            </Pagination.Previous>
          </Pagination.Item>

          {getPageNumbers().map((pageNum, idx) =>
            typeof pageNum === 'string' ? (
              <Pagination.Item key={`ellipsis-${idx}`}>
                <span className="flex items-center justify-center min-w-8 sm:min-w-10 h-8 px-2 text-gray-400 dark:text-gray-500 text-sm">...</span>
              </Pagination.Item>
            ) : (
              <Pagination.Item key={pageNum}>
                <Pagination.Link
                  isActive={pageNum === page}
                  onPress={() => onChangePage(pageNum as number)}
                  className={`min-w-8 sm:min-w-10 h-8 px-2 sm:px-3 rounded-md text-sm font-bold transition-all ${
                    pageNum === page
                      ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                      : 'bg-transparent hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </Pagination.Link>
              </Pagination.Item>
            )
          )}

          <Pagination.Item>
            <Pagination.Next
              isDisabled={page >= totalPages}
              onPress={() => onChangePage(Math.min(totalPages, page + 1))}
              className="min-w-8 sm:min-w-10 h-8 px-2 sm:px-3 rounded-md bg-transparent dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-100"
            >
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>

          {/* Last page */}
          <Pagination.Item>
            <button
              disabled={page >= totalPages}
              onClick={() => onChangePage(totalPages)}
              className="min-w-8 sm:min-w-10 h-8 px-2 sm:px-3 rounded-md bg-transparent dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-100 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {'>>'}
            </button>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>

      {/* Jump to page input */}
      <div className="flex items-center gap-1 ml-1">
        <span className="text-xs text-gray-400 hidden sm:inline">Đến trang</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          onKeyDown={handleJump}
          placeholder="#"
          className="w-12 h-8 text-center text-sm border border-gray-200 rounded-md outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
        />
      </div>
    </div>
  )
}

// --- Combined Component ---
import { useRef } from 'react'

export interface TablePaginationProps {
  page: number
  total: number
  filtered?: number
  limit: number
  onChangePage: (page: number) => void
  onChangeLimit: (limit: number) => void
  className?: string
  enableStickyPagination?: boolean
  isLoading?: boolean
}

export default function TablePagination({
  page,
  total,
  filtered,
  limit,
  onChangePage,
  onChangeLimit,
  className = '',
  enableStickyPagination = false,
  isLoading = false
}: TablePaginationProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const paginationRef = useRef<HTMLDivElement>(null)
  const [fixedStyle, setFixedStyle] = useState({ left: 0, width: 0 })
  const [height, setHeight] = useState(44)

  const prevTotalRef = useRef(total)
  const prevFilteredRef = useRef(filtered)

  // Determine if we are likely in a loading state even without the isLoading prop
  const isImplicitLoading = total === 0 && page > 1
  const effectivelyLoading = isLoading || isImplicitLoading

  useEffect(() => {
    if (!effectivelyLoading) {
      prevTotalRef.current = total
      prevFilteredRef.current = filtered
    }
  }, [total, filtered, effectivelyLoading])

  // Use previous values during loading to prevent layout shift
  const displayTotal = effectivelyLoading && prevTotalRef.current > 0 ? prevTotalRef.current : total
  const displayFiltered = effectivelyLoading && prevTotalRef.current > 0 ? prevFilteredRef.current : filtered

  useEffect(() => {
    if (enableStickyPagination && paginationRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement
          const h = target.offsetHeight
          setHeight(h)
          // Add extra 1px to offset border
          document.documentElement.style.setProperty('--sticky-pagination-height', `${h}px`)
        }
      })
      resizeObserver.observe(paginationRef.current)

      // Fallback initial
      const initialHeight = paginationRef.current.offsetHeight
      setHeight(initialHeight)
      document.documentElement.style.setProperty('--sticky-pagination-height', `${initialHeight}px`)

      return () => {
        resizeObserver.disconnect()
        document.documentElement.style.removeProperty('--sticky-pagination-height')
      }
    } else {
      document.documentElement.style.setProperty('--sticky-pagination-height', `0px`)
    }
    return undefined
  }, [enableStickyPagination])

  useEffect(() => {
    if (enableStickyPagination && wrapperRef.current) {
      const updatePosition = () => {
        if (wrapperRef.current) {
          const rect = wrapperRef.current.getBoundingClientRect()
          setFixedStyle((prev) => {
            if (prev.left === rect.left && prev.width === rect.width) return prev
            return { left: rect.left, width: rect.width }
          })
        }
      }

      updatePosition()
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition, true) // Capture scroll to update left/width if needed

      const observer = new ResizeObserver(updatePosition)
      observer.observe(wrapperRef.current)

      return () => {
        window.removeEventListener('resize', updatePosition)
        window.removeEventListener('scroll', updatePosition, true)
        observer.disconnect()
      }
    }
    return undefined
  }, [enableStickyPagination])

  return (
    <>
      <div ref={wrapperRef} className="w-full" style={enableStickyPagination ? { height: height } : undefined} />
      <div
        ref={paginationRef}
        className={`flex justify-between items-center gap-2 p-2 px-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 ${className} ${enableStickyPagination ? 'fixed bottom-0 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_10px_rgba(0,0,0,0.2)]' : ''
          }`}
        style={enableStickyPagination ? { left: fixedStyle.left, width: fixedStyle.width } : undefined}
      >
        <TableLimitSelector
          limit={limit}
          total={displayTotal}
          filtered={displayFiltered}
          onChangeLimit={onChangeLimit}
          className="justify-end sm:justify-start order-1"
        />
        <TablePaginationControl
          page={page}
          total={displayFiltered !== undefined ? displayFiltered : displayTotal}
          limit={limit}
          onChangePage={onChangePage}
          className="flex justify-start sm:justify-end order-2"
        />
        
      </div>
    </>
  )
}

