import { Button, Card, Popover, Skeleton } from '@heroui-v3/react'
import { motion, Variants } from 'framer-motion'
import React, { ReactNode, useMemo } from 'react'

interface DataItem {
  label: string
  value: number | string
}

interface StatCardProps {
  title: string
  icon?: ReactNode
  data?: DataItem[]
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default'
  className?: string
  isLoading?: boolean
}

const cardVariants: Variants = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -4,
    scale: 1.01,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  }
}

const iconVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.2,
    transition: { type: 'spring', stiffness: 300, damping: 18 }
  }
}

export default function StatCard({
  title,
  icon,
  data = [],
  color = 'primary',
  className,
  isLoading
}: StatCardProps) {
  const isSingleStat = useMemo(() => {
    if (!data || data.length === 0) return true
    if (data.length === 1) return true
    if (!('label' in data[0])) return true
    return false
  }, [data])

  const totalValue = useMemo(() => {
    if (!data || data.length === 0) return 0
    if (!('label' in data[0])) return data.length
    if (isSingleStat) return Number(data[0].value || 0)
    return data.reduce((acc, item) => acc + Number(item.value || 0), 0)
  }, [data, isSingleStat])

  const hasMore = !isSingleStat && data.length > 2
  const visibleData = hasMore ? data.slice(0, 2) : data

  // Hex color map for inline style - avoids Tailwind JIT purge issues
  const colorHex = useMemo(() => {
    const map: Record<string, { icon: string; popover: string }> = {
      primary: { icon: '#2563eb', popover: '#2563eb' },
      secondary: { icon: '#2563eb', popover: '#2563eb' },
      success: { icon: '#10b981', popover: '#10b981' },
      warning: { icon: '#f59e0b', popover: '#f59e0b' },
      danger: { icon: '#ef4444', popover: '#ef4444' },
      default: { icon: '#6b7280', popover: '#6b7280' }
    }
    return map[color] || map.primary
  }, [color])


  const colorStyles = useMemo(() => {
    const map = {
      primary: {
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconBorder: 'border-blue-200 dark:border-blue-800',
        iconText: 'text-blue-600 dark:text-blue-400',
        popoverText: 'text-blue-600',
        overlayText: 'text-blue-600 dark:text-blue-400'
      },
      secondary: {
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconBorder: 'border-blue-200 dark:border-blue-800',
        iconText: 'text-blue-600 dark:text-blue-400',
        popoverText: 'text-blue-600',
        overlayText: 'text-blue-600 dark:text-blue-400'
      },
      success: {
        iconBg: 'bg-green-100 dark:bg-green-900/30',
        iconBorder: 'border-green-200 dark:border-green-800',
        iconText: 'text-green-600 dark:text-green-400',
        popoverText: 'text-green-600',
        overlayText: 'text-green-600 dark:text-green-400'
      },
      warning: {
        iconBg: 'bg-orange-100 dark:bg-orange-900/30',
        iconBorder: 'border-orange-200 dark:border-orange-800',
        iconText: 'text-orange-600 dark:text-orange-400',
        popoverText: 'text-orange-600',
        overlayText: 'text-orange-600 dark:text-orange-400'
      },
      danger: {
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        iconBorder: 'border-red-200 dark:border-red-800',
        iconText: 'text-red-600 dark:text-red-400',
        popoverText: 'text-red-600',
        overlayText: 'text-red-600 dark:text-red-400'
      },
      default: {
        iconBg: 'bg-gray-100 dark:bg-gray-700',
        iconBorder: 'border-gray-200 dark:border-gray-600',
        iconText: 'text-gray-600 dark:text-gray-400',
        popoverText: 'text-gray-600',
        overlayText: 'text-gray-600 dark:text-gray-400'
      }
    }
    return map[color] || map.primary
  }, [color])

  const iconOverlay = useMemo(() => {
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement<any>, { size: 72 })
    }
    return icon
  }, [icon])

  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      className={`relative group ${className ?? ''}`}
    >
      <Card className="border border-gray-200 dark:border-gray-700 transition-colors duration-300 group-hover:border-blue-400 group-hover:shadow-lg group-hover:shadow-blue-500/10 h-full">
        <Card.Header>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight">
              {title}
            </span>
          </div>
        </Card.Header>

        <Card.Content>
          <div className="flex justify-between gap-2 relative">
            {isLoading ? (
              <div className="flex flex-col gap-2 w-full">
                <Skeleton className="h-7 w-1/2 rounded-md" />
                {!isSingleStat && (
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-2/3 rounded-md" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {isSingleStat ? (
                  <div className="text-gray-800 dark:text-gray-100 text-3xl font-bold leading-none">
                    {totalValue.toLocaleString()}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {visibleData.map((item, index) => (
                      <div key={index} className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
                          {Number(item.value).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400 truncate max-w-[100px]">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="relative w-14 h-14 flex-none">
              {isLoading ? (
                <Skeleton className="w-14 h-14 rounded-sm" />
              ) : (
                <motion.div
                  variants={iconVariants}
                  style={{ color: colorHex.icon }}
                  className="p-2 flex items-center justify-center"
                >
                  {icon ? React.cloneElement(icon as React.ReactElement<any>, { size: 28 }) : null}
                </motion.div>
              )}
            </div>
          </div>
        </Card.Content>

        {!isSingleStat && hasMore && (
          <Card.Footer className="pt-0">
            <Popover>
              <Popover.Trigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 min-w-0 h-5 gap-1 px-2 hover:text-gray-600 font-medium"
                >
                  <span className="text-[9px]">Xem thêm tất cả ({data.length})</span>
                </Button>
              </Popover.Trigger>
              <Popover.Content placement="bottom start" offset={10} className="w-64">
                <Popover.Dialog className="p-3">
                  <div className="w-full">
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-wider">
                      {title} chi tiết
                    </div>
                    <div className="space-y-2.5 max-h-60 overflow-y-auto">
                      {data.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                          <span className={`font-bold ${colorStyles.popoverText}`}>
                            {Number(item.value).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popover.Dialog>
              </Popover.Content>
            </Popover >
          </Card.Footer >
        )
        }
      </Card>

      {/* ICON NỀN */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-sm">
        <div className="absolute top-1/2 -translate-y-1/10 -right-2">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className={`${colorStyles.overlayText} opacity-10 rotate-24 group-hover:opacity-20 transition-opacity duration-300`}
          >
            {iconOverlay}
          </motion.div>
        </div>
      </div>
    </motion.div >
  )
}
