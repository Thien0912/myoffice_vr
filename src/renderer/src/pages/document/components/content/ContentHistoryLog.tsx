import { Spinner } from '@heroui-v3/react'
import { callApi } from '@renderer/api/callApi'
import { date } from '@renderer/utils/formatDate'
import { useEffect, useState } from 'react'

// --- Types ---
interface LogItem {
  id: number
  nguoi_thuc_hien: string
  hanh_dong: string
  noi_dung: string
  ngay_tao: string
  diff?: { field: string; old: string; new: string }[]
}

interface ContentHistoryLogProps {
  id_van_ban: number | undefined
  type?: 'den' | 'di' | 'didonvi' | 'dendonvi' | 'noibo'
}

// --- Constants ---

const ACTION_MAP: Record<string, string> = {
  create: 'Tạo mới',
  update: 'Cập nhật',
  delete: 'Xóa',
  export: 'Xuất dữ liệu',
  import: 'Nhập dữ liệu',
  remind: 'Nhắc nhở',
  restore: 'Khôi phục',
  chuyen_xu_ly: 'Chuyển xử lý'
}

// --- Helper Components ---

const HistoryLogDiff = ({ item }: { item: LogItem }): React.JSX.Element | null => {
  if (!item.diff || item.diff.length === 0) return null

  return (
    <div className="mt-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
      <div className="text-[10px] font-bold mb-0.5 text-gray-500">Chi tiết thay đổi:</div>
      <div className="flex flex-col gap-0.5">
        {item.diff.map((d, idx) => (
          <div key={idx} className="text-[11px] flex items-center">
            <span className="font-medium min-w-20 text-gray-500 dark:text-gray-400 mr-2">
              {d.field}:
            </span>
            <span className="line-through text-danger text-tiny">{d.old}</span>
            <span className="mx-3 text-gray-400">→</span>
            <span className="text-success font-semibold text-tiny">{d.new}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const HistoryTimelineItem = ({ item }: { item: LogItem }): React.JSX.Element => {
  const action = item.hanh_dong.toLowerCase()

  let dotColor = 'bg-primary-500 border-primary-200'
  let badgeClass = 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400'

  if (action === 'create' || action === 'restore') {
    dotColor = 'bg-success-500 border-success-200'
    badgeClass = 'text-success-600 bg-success-50 dark:bg-success-900/20 dark:text-success-400'
  } else if (action === 'delete') {
    dotColor = 'bg-danger-500 border-danger-200'
    badgeClass = 'text-danger-600 bg-danger-50 dark:bg-danger-900/20 dark:text-danger-400'
  } else if (action === 'update' || action === 'chuyen_xu_ly') {
    dotColor = 'bg-warning-500 border-warning-200'
    badgeClass = 'text-warning-600 bg-warning-50 dark:bg-warning-900/20 dark:text-warning-400'
  } else if (action === 'remind') {
    dotColor = 'bg-purple-500 border-purple-200'
    badgeClass = 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400'
  }

  return (
    <div className="relative flex gap-3 sm:gap-4 group">
      {/* Time Col */}
      <div className="w-[35px] sm:w-[45px] pt-1 text-right shrink-0 flex flex-col items-end">
        <span className="text-[13px] font-bold text-gray-700 dark:text-gray-200 group-hover:text-primary-600 transition-colors">
          {date('H:i', item.ngay_tao)}
        </span>
        <span className="text-[10px] text-gray-400 font-medium">{date('d/m', item.ngay_tao)}</span>
      </div>

      {/* Dot */}
      <div className="relative z-10 pt-1.5 shrink-0">
        <span
          className={`flex w-3 h-3 rounded-full ring-4 ring-white dark:ring-[#18181b] ${dotColor}`}
        ></span>
      </div>

      {/* Content Col */}
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-center flex-wrap gap-2 mb-1.5">
          <span className="text-small font-bold text-gray-800 dark:text-gray-200">
            {item.nguoi_thuc_hien}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${badgeClass}`}
          >
            {ACTION_MAP[action] || item.hanh_dong}
          </span>
        </div>

        <div className="mt-0.5">
          {item.noi_dung && (
            <div className="text-small text-gray-600 dark:text-gray-400 mb-1.5">
              {item.noi_dung}
            </div>
          )}
          <HistoryLogDiff item={item} />
        </div>
      </div>
    </div>
  )
}

// --- Main Component ---
export default function ContentHistoryLog({
  id_van_ban,
  type = 'den'
}: ContentHistoryLogProps): React.JSX.Element {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id_van_ban) {
      fetchLogs()
    }
  }, [id_van_ban, type])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      let endpoint = `admin/vanban/vanbanden/view_log?id_van_ban=${id_van_ban!}`
      if (type === 'di') endpoint = `admin/vanban/vanbandi/view_log?id_van_ban=${id_van_ban!}`
      if (type === 'didonvi')
        endpoint = `admin/vanban/vanbandidonvi/view_log?id_van_ban=${id_van_ban!}`
      if (type === 'dendonvi')
        endpoint = `admin/vanban/vanbandendonvi/view_log?id_van_ban=${id_van_ban!}`
      if (type === 'noibo') endpoint = `admin/vanban/vanbannoibo/view_log?id_van_ban=${id_van_ban!}`

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await callApi(endpoint, { method: 'GET' })
      if (res.success) {
        setLogs(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch logs', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="sm" color="current" />
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400 gap-2">
        <i className="fas fa-history text-3xl opacity-20"></i>
        <span className="text-small">Chưa có lịch sử ghi nhận</span>
      </div>
    )
  }

  return (
    <div className="p-4 pb-10 -ml-2 sm:ml-0">
      <div className="flex flex-col gap-6 relative pl-2">
        {/* Timeline Line */}
        <div className="absolute left-[49px] sm:left-[59px] top-2 bottom-0 w-px bg-linear-to-b from-gray-200 via-gray-200 to-transparent dark:from-gray-700 dark:via-gray-800"></div>

        {logs.map((item) => (
          <HistoryTimelineItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
