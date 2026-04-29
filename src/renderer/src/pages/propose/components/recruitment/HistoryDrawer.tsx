import React, { useState, useRef, useEffect } from 'react'
import { HrDrawer } from '../../../../components/hero-custom/HrDrawer'
import {
  Search,
  X,
  Trash2,
  Edit3,
  PlusCircle,
  History,
  SlidersHorizontal,
  Clock,
  UserCircle,
  FileCheck2
} from 'lucide-react'

interface HistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
}

type ActionType = 'create' | 'update' | 'note' | 'delete' | 'upload'

const ACTION_CONFIG: Record<
  ActionType,
  {
    label: string
    color: string
    bgColor: string
    iconColor: string
    dotColor: string
    icon: React.ReactNode
  }
> = {
  create: {
    label: 'Tạo mới',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-500',
    dotColor: 'bg-gray-400',
    icon: <PlusCircle size={15} />
  },
  update: {
    label: 'Cập nhật',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
    dotColor: 'bg-blue-400',
    icon: <Edit3 size={15} />
  },
  note: {
    label: 'Ghi chú',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-500',
    dotColor: 'bg-orange-400',
    icon: <UserCircle size={15} />
  },
  delete: {
    label: 'Xóa',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-500',
    dotColor: 'bg-red-400',
    icon: <Trash2 size={15} />
  },
  upload: {
    label: 'Tải lên',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-500',
    dotColor: 'bg-green-400',
    icon: <FileCheck2 size={15} />
  }
}

const ALL_ACTIONS = Object.keys(ACTION_CONFIG) as ActionType[]

// Mock grouped history data
const initialGroupedLogs = [
  {
    date: 'Hôm nay',
    items: [
      {
        id: 1,
        action: 'Đã cập nhật trạng thái ứng viên',
        target: 'Trần Mai Lộc',
        toStatus: 'Đang sàng lọc CV',
        time: '10:30',
        user: 'Nguyễn Văn A',
        type: 'update' as ActionType
      },
      {
        id: 2,
        action: 'Đã tạo ứng viên mới',
        target: 'Phạm Minh D',
        time: '09:15',
        user: 'Hệ thống',
        type: 'create' as ActionType
      }
    ]
  },
  {
    date: 'Hôm qua',
    items: [
      {
        id: 3,
        action: 'Đã thêm ghi chú mới',
        target: 'Lê Thị B',
        toStatus: '',
        desc: 'Ứng viên có kỹ năng React tốt.',
        time: '16:00',
        user: 'Trần Thị C',
        type: 'note' as ActionType
      },
      {
        id: 4,
        action: 'Đã xóa hồ sơ ứng viên',
        target: 'Hoàng Văn H',
        time: '14:30',
        user: 'Lê Văn F',
        type: 'delete' as ActionType
      },
      {
        id: 5,
        action: 'Đã tải lên hồ sơ minh chứng',
        target: 'Lâm Văn G',
        time: '09:15',
        user: 'Nguyễn Văn A',
        type: 'upload' as ActionType
      }
    ]
  }
]

function FilterBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full bg-blue-600 text-white text-[9px] font-bold leading-none px-1">
      {count}
    </span>
  )
}

function LogItemRow({ item }: { item: any }) {
  const cfg = ACTION_CONFIG[item.type as ActionType] || ACTION_CONFIG['update']

  return (
    <div className="flex flex-col px-3 py-3 rounded-xl transition-colors cursor-default hover:bg-gray-50">
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.bgColor} ${cfg.color}`}
        >
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <p className="text-[13.5px] font-medium text-gray-800 leading-snug break-words">
              {item.action} <span className="font-bold text-blue-600">{item.target}</span>
            </p>
          </div>

          {(item.desc || item.toStatus) && (
            <div className="mt-1 flex flex-col gap-1">
              {item.toStatus && (
                <span className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-gray-100 text-gray-700 rounded-lg w-fit">
                  Trạng thái: <span className="text-gray-900">{item.toStatus}</span>
                </span>
              )}
              {item.desc && (
                <p className="text-[12px] text-gray-500 leading-relaxed break-words">
                  Nội dung: {item.desc}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11.5px] font-medium text-gray-500 whitespace-nowrap">
              {item.user}
            </span>
            <span className="text-[11px] text-gray-300">·</span>
            <div className="flex items-center gap-1 text-[11px] text-gray-400 whitespace-nowrap">
              <Clock size={12} strokeWidth={2.5} />
              {item.time}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HistoryDrawer({ isOpen, onClose }: HistoryDrawerProps) {
  const [search, setSearch] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [actionFilters, setActionFilters] = useState<ActionType[]>([])
  const filterRef = useRef<HTMLDivElement>(null)

  const toggleAction = (action: ActionType) => {
    setActionFilters((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    )
  }

  const clearFilters = () => {
    setActionFilters([])
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const activeFilterCount = actionFilters.length

  return (
    <HrDrawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      defaultWidth={450}
      isFloatingUI={false}
    >
      <div className="flex flex-col h-full bg-white overflow-hidden w-full">
        {/* ── Header ── */}
        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <History size={16} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-gray-900 leading-tight">
                  Lịch sử hoạt động
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Tìm kiếm thao tác, nhân viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen((v) => !v)}
                className={`relative w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
                  isFilterOpen || activeFilterCount > 0
                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                <SlidersHorizontal size={16} />
                <FilterBadge count={activeFilterCount} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="text-[13px] font-semibold text-gray-800">Bộ lọc</span>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-[11px] text-blue-600 hover:underline"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Loại thao tác
                    </p>
                    <div className="space-y-1">
                      {ALL_ACTIONS.map((action) => {
                        const cfg = ACTION_CONFIG[action]
                        const checked = actionFilters.includes(action)
                        return (
                          <button
                            key={action}
                            onClick={() => toggleAction(action)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-left transition-colors ${checked ? `${cfg.bgColor} ${cfg.color} font-medium` : 'text-gray-700 hover:bg-gray-50'}`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border-2 transition-all ${checked ? 'border-current bg-current' : 'border-gray-300'}`}
                            >
                              {checked && (
                                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                  <path
                                    d="M1 3l2 2 4-4"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                            {cfg.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
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

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {actionFilters.map((a) => {
                const cfg = ACTION_CONFIG[a]
                return (
                  <span
                    key={a}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.color} ${cfg.bgColor} border-current/20`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                    {cfg.label}
                    <button onClick={() => toggleAction(a)} className="hover:opacity-70">
                      <X size={10} />
                    </button>
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Log feed ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 bg-gray-50/30">
          {initialGroupedLogs.map((group, gIdx) => (
            <div key={gIdx}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">
                  {group.date}
                </span>
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-[11px] text-gray-400 shrink-0">
                  {group.items.length} thao tác
                </span>
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <LogItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </HrDrawer>
  )
}
