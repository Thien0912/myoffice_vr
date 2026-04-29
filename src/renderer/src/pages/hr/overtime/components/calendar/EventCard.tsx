import type { CalendarEvent } from './types'

/* ═══════════════════════════════
   LockIcon
═══════════════════════════════ */
export const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
    aria-label="Ngày bị khóa"
  >
    <path d="M12 1C9.24 1 7 3.24 7 6v2H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-2V6c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v2H9V6c0-1.66 1.34-3 3-3zm0 9c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
  </svg>
)

/* ═══════════════════════════════
   EventCard
═══════════════════════════════ */
export const EventCard = ({
  event,
  variant = 'month',
  onClick
}: {
  event: CalendarEvent
  variant?: 'month' | 'week' | 'day'
  onClick?: (e: CalendarEvent, position?: { x: number; y: number }, element?: HTMLElement) => void
}) => {
  const isCompact = variant === 'month'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        onClick?.(event, { x: rect.left, y: rect.top }, e.currentTarget as HTMLElement)
      }}
      className={`event-card group w-full shrink-0 ${!isCompact ? 'h-full flex flex-col items-start justify-start' : 'block'} text-left rounded-md transition-all duration-150 hover:shadow-md cursor-pointer overflow-hidden`}
      style={{
        backgroundColor: event.borderColor || event.color,
        color: '#ffffff',
        borderLeft: !isCompact ? '4px solid rgba(0, 0, 0, 0.15)' : 'none',
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none'
      }}
      title={event.tooltip || event.title}
    >
      {isCompact ? (
        <div className="flex items-center gap-1.5 px-2 py-2">
          {event.meta?.isDotXuat && (
            <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-500 shadow-[0_0_0_2px_rgba(255,255,255,0.8)]" title="Đăng ký đột xuất" />
          )}
          {event.startTime && (
            <span className="text-xs font-bold leading-none shrink-0">{event.startTime} - {event.endTime}</span>
          )}
        </div>
      ) : (
        <div className="flex flex-col px-2.5 py-1.5 relative">
          {event.meta?.isDotXuat && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_0_1.5px_rgba(255,255,255,0.7)]" title="Đăng ký đột xuất" />
          )}
          <span className="text-[13px] font-bold leading-tight truncate pr-3">{event.title}</span>
          {event.startTime && event.endTime && (
            <span className="text-xs font-semibold opacity-80 mt-0.5">{event.startTime} – {event.endTime}</span>
          )}
        </div>
      )}
    </button>
  )
}
