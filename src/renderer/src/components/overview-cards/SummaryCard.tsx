import { memo } from 'react'
import { cn } from '@heroui/react'

export const CARD_COLORS = {
  blue: {
    text: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-500 dark:text-blue-400',
    bgGraphic: 'text-blue-50 dark:text-blue-900/10'
  },
  yellow: {
    text: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-500 dark:text-amber-400',
    bgGraphic: 'text-amber-50 dark:text-amber-900/10'
  },
  orange: {
    text: 'text-orange-500 dark:text-orange-400',
    iconBg: 'bg-orange-50 dark:bg-orange-900/20',
    iconColor: 'text-orange-500 dark:text-orange-400',
    bgGraphic: 'text-orange-50 dark:text-orange-900/10'
  },
  slate: {
    text: 'text-slate-500 dark:text-slate-400',
    iconBg: 'bg-slate-50 dark:bg-slate-800/50',
    iconColor: 'text-slate-500 dark:text-slate-400',
    bgGraphic: 'text-slate-50 dark:text-slate-900/10'
  },
  emerald: {
    text: 'text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    bgGraphic: 'text-emerald-50 dark:text-emerald-900/10'
  },
  red: {
    text: 'text-red-500 dark:text-red-400',
    iconBg: 'bg-red-50 dark:bg-red-900/20',
    iconColor: 'text-red-500 dark:text-red-400',
    bgGraphic: 'text-red-50 dark:text-red-900/10'
  }
} as const

export type SummaryCardColor = keyof typeof CARD_COLORS

export interface SummaryCardProps {
  title: string
  value: string | number
  unit?: string
  subtitleBold?: string | number
  subtitle?: string
  icon: React.ElementType
  colorScheme: SummaryCardColor
  isActive?: boolean
  onClick?: () => void
  isClickable?: boolean
}

export const SummaryCard = memo(({
  title,
  value,
  unit,
  subtitleBold,
  subtitle,
  icon: Icon,
  colorScheme,
  isActive,
  onClick,
  isClickable
}: SummaryCardProps) => {
  const color = CARD_COLORS[colorScheme] || CARD_COLORS.blue
  const Component = isClickable ? 'button' : 'div'

  const activeBorder = colorScheme === 'blue' ? 'border-blue-500 dark:border-blue-400 ring-blue-500 dark:ring-blue-400' :
    colorScheme === 'emerald' ? 'border-emerald-500 dark:border-emerald-400 ring-emerald-500 dark:ring-emerald-400' :
    colorScheme === 'red' ? 'border-red-500 dark:border-red-400 ring-red-500 dark:ring-red-400' :
    colorScheme === 'orange' ? 'border-orange-500 dark:border-orange-400 ring-orange-500 dark:ring-orange-400' :
    colorScheme === 'slate' ? 'border-slate-500 dark:border-slate-400 ring-slate-500 dark:ring-slate-400' :
    colorScheme === 'yellow' ? 'border-amber-500 dark:border-amber-400 ring-amber-500 dark:ring-amber-400' : 'border-blue-500 dark:border-blue-400 ring-blue-500 dark:ring-blue-400'

  return (
    <Component
      type={isClickable ? "button" : undefined}
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "bg-white dark:bg-gray-800 border p-3 sm:p-4 flex flex-col relative overflow-hidden text-left w-full h-full transition-all duration-200 rounded-xl sm:rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]",
        isClickable && "cursor-pointer active:scale-[0.98] outline-none",
        isActive
          ? cn(activeBorder, "shadow-sm bg-slate-50 dark:bg-gray-800/80 ring-1 ring-inset")
          : "border-gray-100 dark:border-gray-700/60 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600"
      )}
    >
      <div className={cn("absolute -bottom-4 -right-2 opacity-40 dark:opacity-10 transition-opacity", isActive && "opacity-60 dark:opacity-20", color.bgGraphic)}>
        <Icon size={80} strokeWidth={1} />
      </div>

      <div className="flex justify-between items-start relative z-10 w-full gap-2 sm:gap-4">
        <div className="flex flex-col flex-1 min-w-0">
          <span className={cn("text-[10px] sm:text-[11px] font-bold uppercase tracking-widest truncate", isActive ? color.text : "text-gray-500 dark:text-gray-400")} title={title}>
            {title}
          </span>
          <div className="flex items-baseline gap-1 mt-1 sm:mt-1.5 truncate">
            <span className={cn('text-2xl sm:text-3xl font-black tracking-tight truncate', color.text)}>{value}</span>
            {unit && (
              <span className="text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">{unit}</span>
            )}
          </div>
        </div>
        <div className={cn('w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-[10px] flex items-center justify-center shrink-0 shadow-sm', color.iconBg, color.iconColor)}>
          <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
        </div>
      </div>

      {(subtitleBold || subtitle) && (
        <div className="mt-2 sm:mt-4 flex items-center gap-1.5 relative z-10 min-w-0 w-full">
          {subtitleBold && <span className="text-[11px] sm:text-[13px] text-gray-900 dark:text-gray-200 font-bold shrink-0">{subtitleBold}</span>}
          {subtitle && <span className="text-[11px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium truncate block w-full" title={subtitle}>{subtitle}</span>}
        </div>
      )}
    </Component>
  )
})
SummaryCard.displayName = 'SummaryCard'

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-4 flex flex-col shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
    <div className="flex justify-between items-start gap-4">
      <div className="flex flex-col flex-1 gap-2">
        <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="flex items-baseline gap-2 mt-1">
          <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
          <div className="w-8 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-[10px] animate-pulse shrink-0" />
    </div>
    <div className="mt-6 flex gap-2">
      <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  </div>
)
