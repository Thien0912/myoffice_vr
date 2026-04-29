import React, { useState, useMemo, useRef, useEffect } from 'react'
import { HrDrawer } from '@renderer/components/hero-custom/HrDrawer'
import {
  Search,
  X,
  Trash2,
  Edit3,
  PlusCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Clock,
  History,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import { NhansuAxios } from '@renderer/api/danhmuc/nhansuAxios'
import { Spinner, Avatar } from '@heroui/react'
import clsx from 'clsx'
import { getAvatarUrl } from '@renderer/utils/urlUtils'

interface HistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
}

type ActionType = 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'cancel' | 'reopen'

const ACTION_CONFIG: Record<ActionType, { label: string; color: string; bgColor: string; iconColor: string; dotColor: string; icon: React.ReactNode }> = {
  create: { label: 'Tạo mới', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800', iconColor: 'text-gray-500 dark:text-gray-400', dotColor: 'bg-gray-400', icon: <PlusCircle size={15} /> },
  update: { label: 'Cập nhật', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800', iconColor: 'text-gray-500 dark:text-gray-400', dotColor: 'bg-gray-400', icon: <Edit3 size={15} /> },
  delete: { label: 'Xóa', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/25', iconColor: 'text-red-500 dark:text-red-400', dotColor: 'bg-red-400', icon: <Trash2 size={15} /> },
  approve: { label: 'Duyệt', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800', iconColor: 'text-gray-500 dark:text-gray-400', dotColor: 'bg-gray-400', icon: <CheckCircle2 size={15} /> },
  reject: { label: 'Từ chối', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/25', iconColor: 'text-red-500 dark:text-red-400', dotColor: 'bg-red-400', icon: <XCircle size={15} /> },
  cancel: { label: 'Hủy', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/25', iconColor: 'text-orange-500 dark:text-orange-400', dotColor: 'bg-orange-400', icon: <XCircle size={15} /> },
  reopen: { label: 'Mở lại', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/25', iconColor: 'text-blue-500 dark:text-blue-400', dotColor: 'bg-blue-400', icon: <RotateCcw size={15} /> },
}

const DATE_OPTIONS = [
  { label: 'Tất cả thời gian', value: 'all' },
  { label: 'Hôm nay', value: new Date().toISOString().split('T')[0] },
  { label: 'Hôm qua', value: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
  { label: '7 ngày qua', value: '7d' },
  { label: '30 ngày qua', value: '30d' }
]

const ALL_ACTIONS = Object.keys(ACTION_CONFIG) as ActionType[]

function FilterBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full bg-blue-600 text-white text-[9px] font-bold leading-none px-1">
      {count}
    </span>
  )
}

// Helper to safely parse dates from 'YYYY-MM-DD HH:mm:ss' to 'YYYY-MM-DDTHH:mm:ss'
function safeParseDate(raw: string) {
  if (!raw) return new Date(NaN)
  // Ensure the string has 'T' instead of space if it's a full datetime
  const isoString = raw.includes(' ') ? raw.replace(' ', 'T') : raw
  return new Date(isoString)
}

// Hàm format ngày từ "Y-m-d" sang "Hôm nay", "Hôm qua", "d tháng m"
function formatDateHeader(rawDate: string) {
  if (rawDate === 'Unknown') return 'Không xác định'
  const dateObj = safeParseDate(rawDate)
  if (isNaN(dateObj.getTime())) return 'Thời gian không hợp lệ'

  const today = new Date()
  const yesterday = new Date(Date.now() - 86400000)

  if (dateObj.toDateString() === today.toDateString()) return 'Hôm nay'
  if (dateObj.toDateString() === yesterday.toDateString()) return 'Hôm qua'

  return `${dateObj.getDate()} tháng ${dateObj.getMonth() + 1}`
}

function formatTime(dateTimeStr: string) {
  try {
    const d = safeParseDate(dateTimeStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    return ''
  }
}

function LogItemRow({
  item,
  cfg
}: {
  item: any
  cfg: any
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  let descContent = '-'
  let employeeIds: string[] = []

  if (item.ql_nhat_ky_gia_tri_moi || item.ql_nhat_ky_gia_tri_cu) {
    try {
      let moi: any = {}
      let cu: any = {}
      try {
        moi = item.ql_nhat_ky_gia_tri_moi ? JSON.parse(item.ql_nhat_ky_gia_tri_moi) : {}
      } catch (e) { }
      try {
        cu = item.ql_nhat_ky_gia_tri_cu ? JSON.parse(item.ql_nhat_ky_gia_tri_cu) : {}
      } catch (e) { }

      if (moi.ly_do_huy) {
        descContent = `Lý do: ${moi.ly_do_huy}`
      }

      if (moi.id_nhan_vien) {
        if (Array.isArray(moi.id_nhan_vien)) {
          employeeIds.push(...moi.id_nhan_vien.map(String))
        } else {
          employeeIds.push(String(moi.id_nhan_vien))
        }
      } else if (cu.id_nhan_vien) {
        if (Array.isArray(cu.id_nhan_vien)) {
          employeeIds.push(...cu.id_nhan_vien.map(String))
        } else {
          employeeIds.push(String(cu.id_nhan_vien))
        }
      }

      // Attempt to extract additional message if present
      if (moi.details && Array.isArray(moi.details) && moi.details.length > 0 && moi.details[0].message) {
        descContent = moi.details[0].message
      }

    } catch (e) { }
  }

  employeeIds = Array.from(new Set(employeeIds)).filter(Boolean)
  const hasEmployees = employeeIds.length > 0

  const handleToggle = async () => {
    if (!hasEmployees) return
    const nextExpanded = !isExpanded
    setIsExpanded(nextExpanded)

    if (nextExpanded && employees.length === 0 && !isLoading) {
      setIsLoading(true)
      try {
        const promises = employeeIds.map(id => NhansuAxios.getNhanSuByID(id))
        const res = await Promise.all(promises)
        const validEmployees = res.map(r => r?.data || r).filter(Boolean)
        setEmployees(validEmployees)
      } catch (error) {
        console.error('Failed to fetch employees in history log', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className={clsx("flex flex-col px-3 py-3 rounded-xl transition-colors", hasEmployees ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60" : "cursor-default hover:bg-gray-50 dark:hover:bg-gray-800/60")} onClick={handleToggle}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.bgColor} ${cfg.color}`}>
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <p className="text-[13.5px] font-medium text-gray-800 dark:text-gray-100 leading-snug break-words">
              {item.ql_nhat_ky_noi_dung || item.ql_nhat_ky_hanh_dong}
            </p>
            {hasEmployees && (
              <ChevronDown size={14} className={clsx("text-gray-400 shrink-0 transition-transform", isExpanded && "rotate-180")} />
            )}
          </div>

          {(item.ql_nhat_ky_hanh_dong === 'cancel' || item.ql_nhat_ky_hanh_dong === 'reject' || item.ql_nhat_ky_gia_tri_moi?.includes('message')) ? (
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed break-words">
              {descContent}
            </p>
          ) : null}

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11.5px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.actor_name || 'Hệ thống'}</span>
            <span className="text-[11px] text-gray-300 dark:text-gray-600">·</span>
            <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
              <Clock size={12} strokeWidth={2.5} />
              {formatTime(item.ql_nhat_ky_ngay_tao)}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details Content */}
      {isExpanded && (
        <div className="mt-3 pl-11">
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Thông tin liên quan</p>
            {isLoading ? (
              <div className="flex justify-center py-2">
                <Spinner size="sm" />
              </div>
            ) : employees.length > 0 ? (
              <div className="space-y-2">
                {employees.map((emp, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Avatar src={getAvatarUrl(emp.avatar || emp.ql_nguoi_dung_avatar)} name={emp.ho_va_ten} size="sm" />
                    <div>
                      <p className="text-[12.5px] font-medium text-gray-800 dark:text-gray-200 leading-tight">
                        {emp.ho_va_ten}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                        {emp.email || emp.email_truong || emp.email_ca_nhan || 'Không có email'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-gray-500">Khong tìm thấy thông tin nhân viên</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function HistoryDrawer({ isOpen, onClose }: HistoryDrawerProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState('all')
  const [actionFilters, setActionFilters] = useState<ActionType[]>([])
  const filterRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [showAllChips, setShowAllChips] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  // Close filter panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Call API with Infinite Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['hrmNgoaiGioLogs', debouncedSearch, dateFilter, actionFilters],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await ngoaiGioAxios.getLogs({
        page: pageParam,
        limit: 20,
        search: debouncedSearch,
        actionOptions: actionFilters.length > 0 ? actionFilters : undefined,
        dateFilter: dateFilter
      })
      return res.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.has_more) {
        return lastPage.page + 1
      }
      return undefined
    },
    enabled: isOpen
  })

  console.log(`data:::`, data)

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    if (!isOpen) return

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }, { threshold: 0.1 })

    const el = loadMoreRef.current
    if (el) observerRef.current.observe(el)

    return () => {
      if (el && observerRef.current) observerRef.current.unobserve(el)
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, isOpen])

  const toggleAction = (action: ActionType) => {
    setActionFilters(prev =>
      prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
    )
  }

  const activeFilterCount = (dateFilter !== 'all' ? 1 : 0) + actionFilters.length

  const clearFilters = () => {
    setDateFilter('all')
    setActionFilters([])
  }

  // Format grouped data
  const { groupedLogs, totalItems } = useMemo(() => {
    const rawItems: any[] = data?.pages.flatMap(page => page.data || []) || []
    const total = data?.pages[0]?.total || 0

    // Group by date (Y-m-d)
    const groups: Record<string, any[]> = {}
    rawItems.forEach(item => {
      const dateKey = item.ql_nhat_ky_ngay_tao?.split(' ')[0] || 'Unknown'
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(item)
    })

    const resultList = Object.entries(groups)
      .sort((a, b) => b[0].localeCompare(a[0])) // Descending
      .map(([dateKey, items]) => ({
        date: formatDateHeader(dateKey),
        rawDate: dateKey,
        items
      }))

    return { groupedLogs: resultList, totalItems: total }
  }, [data])

  return (
    <HrDrawer
      isOpen={isOpen}
      onClose={onClose}
      resizable
      defaultWidth={520}
      minWidth={380}
      maxWidth={740}
      classNames={{ base: '!rounded-tl-2xl !rounded-bl-2xl' }}
    >
      <div className="flex flex-col h-full bg-white dark:bg-[#1c1c1e] overflow-hidden">

        {/* ── Header ── */}
        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          {/* Title row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
                <History size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                  Nhật ký hoạt động
                </h2>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">
                  Đăng ký ngoài giờ
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search row with Filter button */}
          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm thao tác, nhân viên..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter button */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(v => !v)}
                className={`relative w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${isFilterOpen
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                  : activeFilterCount > 0
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                title="Bộ lọc"
              >
                <SlidersHorizontal size={16} />
                <FilterBadge count={activeFilterCount} />
              </button>

              {/* Filter dropdown panel */}
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#2c2c2e] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">

                  {/* Panel header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">Bộ lọc</span>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>

                  {/* Section: Date */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      Thời gian
                    </p>
                    <div className="space-y-1">
                      {DATE_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setDateFilter(opt.value)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-left transition-colors ${dateFilter === opt.value
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${dateFilter === opt.value ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-gray-600'
                            }`}>
                            {dateFilter === opt.value && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section: Action type */}
                  <div className="px-4 py-3">
                    <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      Loại thao tác
                    </p>
                    <div className="space-y-1">
                      {ALL_ACTIONS.map(action => {
                        const cfg = ACTION_CONFIG[action]
                        if (!cfg) return null;
                        const checked = actionFilters.includes(action)
                        return (
                          <button
                            key={action}
                            onClick={() => toggleAction(action)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-left transition-colors ${checked
                              ? `${cfg.bgColor} ${cfg.color} font-medium`
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                          >
                            {/* Checkbox */}
                            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border-2 transition-all ${checked ? 'border-current bg-current' : 'border-gray-300 dark:border-gray-600'
                              }`}>
                              {checked && (
                                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                  <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </span>
                            {/* Dot */}
                            <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                            {cfg.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Apply button */}
                  <div className="px-4 pb-3">
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="w-full h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium transition-colors"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active filter chips - max 3, with +N overflow */}
          {activeFilterCount > 0 && (() => {
            // Build flat chip list
            const allChips: React.ReactNode[] = []
            if (dateFilter !== 'all') {
              allChips.push(
                <span key="date" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[11px] font-medium border border-blue-200 dark:border-blue-700">
                  {DATE_OPTIONS.find(d => d.value === dateFilter)?.label}
                  <button onClick={() => setDateFilter('all')} className="hover:text-blue-900 dark:hover:text-blue-200">
                    <X size={10} />
                  </button>
                </span>
              )
            }
            actionFilters.forEach(a => {
              const cfg = ACTION_CONFIG[a]
              if (cfg) {
                allChips.push(
                  <span key={a} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.color} ${cfg.bgColor} border-current/20`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                    {cfg.label}
                    <button onClick={() => toggleAction(a)} className="hover:opacity-70">
                      <X size={10} />
                    </button>
                  </span>
                )
              }
            })

            const MAX_VISIBLE = 3
            const visibleChips = showAllChips ? allChips : allChips.slice(0, MAX_VISIBLE)
            const hiddenCount = allChips.length - MAX_VISIBLE

            return (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {visibleChips}
                {!showAllChips && hiddenCount > 0 && (
                  <button
                    onClick={() => setShowAllChips(true)}
                    className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    +{hiddenCount}
                  </button>
                )}
                {showAllChips && allChips.length > MAX_VISIBLE && (
                  <button
                    onClick={() => setShowAllChips(false)}
                    className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:border-gray-400 transition-colors"
                  >
                    Thu gọn
                  </button>
                )}
              </div>
            )
          })()}
        </div>

        {/* ── Log feed ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {isLoading ? (
            <div className="flex justify-center p-10"><Spinner size="lg" /></div>
          ) : groupedLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <Clock size={22} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Không có nhật ký</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Thử thay đổi bộ lọc hoặc từ khóa</p>
            </div>
          ) : (
            <>
              {groupedLogs.map((group, gIdx) => (
                <div key={gIdx}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0">
                      {group.date}
                    </span>
                    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                    <span className="text-[11px] text-gray-300 dark:text-gray-600 shrink-0">{group.items.length} thao tác</span>
                  </div>

                  <div className="space-y-0.5">
                    {group.items.map((item: any) => {
                      const backendAction = item.ql_nhat_ky_hanh_dong === 'create' ? 'insert' : item.ql_nhat_ky_hanh_dong
                      const cfg = ACTION_CONFIG[backendAction as ActionType] || ACTION_CONFIG['update']
                      return <LogItemRow key={item.ql_nhat_ky_id} item={item} cfg={cfg} />
                    })}
                  </div>
                </div>
              ))}

              {/* Target for infinite scrolling observer */}
              <div ref={loadMoreRef} className="py-4 flex justify-center">
                {isFetchingNextPage && <Spinner size="sm" />}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {totalItems} thao tác {activeFilterCount > 0 && <span className="text-blue-600 dark:text-blue-400">(đã lọc)</span>}
          </span>
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
            >
              {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'} <ChevronDown size={12} />
            </button>
          )}
        </div>
      </div>
    </HrDrawer>
  )
}

