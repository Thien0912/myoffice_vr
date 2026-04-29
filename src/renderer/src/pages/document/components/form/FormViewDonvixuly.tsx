import { DonViXuLy, VanBanData } from '@renderer/shared/CommonInterface'
import {
  cn,
  TextField,
  InputGroup,
  ScrollShadow,
  Popover,
  Avatar
} from '@heroui-v3/react'
import {
  Search,
  Building2,
  CheckCircle2,
  Clock,
  Mail,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { useState, useMemo } from 'react'

type FormViewDonvixulyProps = {
  row?: VanBanData
}

export default function FormViewDonvixuly({ row }: FormViewDonvixulyProps) {
  const [filter, setFilter] = useState('')
  const xu_ly = row?.xu_ly || null

  const mainUnits = useMemo(() => xu_ly?.don_vi_xu_ly_chinh || [], [xu_ly])
  const supportUnits = useMemo(() => xu_ly?.don_vi_xu_ly_phoi_hop || [], [xu_ly])

  // Filter logic
  const filterList = (list: DonViXuLy[]) => {
    if (!filter.trim()) return list
    const lower = filter.toLowerCase()
    return list.filter((u) => u.ten_don_vi.toLowerCase().includes(lower))
  }

  const mainFiltered = useMemo(() => filterList(mainUnits), [mainUnits, filter])
  const supportFiltered = useMemo(() => filterList(supportUnits), [supportUnits, filter])

  return (
    <div className="w-full flex flex-col h-[500px]">
      {/* Search */}
      <div className="pb-4">
        <TextField
          value={filter}
          onChange={setFilter}
          className="w-full"
        >
          <InputGroup>
            <Search size={16} className="text-gray-400 mx-2" />
            <InputGroup.Input
              placeholder="Tìm nhanh đơn vị..."
              className="text-sm border-none shadow-none"
            />
          </InputGroup>
        </TextField>
      </div>

      <ScrollShadow className="grow w-full overflow-y-auto pr-1 pb-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          {/* Column: Chủ trì */}
          <UnitColumn
            title="Đơn vị xử lý chính"
            units={mainFiltered}
            isMain={true}
            emptyText="Không có đơn vị xử lý chính"
          />

          {/* Column: Phối hợp */}
          <UnitColumn
            title="Đơn vị phối hợp"
            units={supportFiltered}
            isMain={false}
            emptyText="Không có đơn vị phối hợp"
          />
        </div>

        {mainFiltered.length === 0 && supportFiltered.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-20 pointer-events-none">
            <Building2 size={32} className="mb-2 opacity-20" />
            <span className="text-sm text-gray-400">Không tìm thấy đơn vị nào phù hợp</span>
          </div>
        )}
      </ScrollShadow>
    </div>
  )
}

function UnitColumn({
  title,
  units,
  isMain,
  emptyText
}: {
  title: string
  units: DonViXuLy[]
  isMain?: boolean
  emptyText: string
}) {
  const viewedCount = units.filter((u) => u.da_xem === '1').length
  const notViewedCount = units.length - viewedCount

  return (
    <div className={cn('h-full', isMain && 'border-r border-gray-100 pr-4')}>
      <div className="flex flex-col xl:flex-row xl:items-center gap-2 mb-3 sticky top-0 bg-white dark:bg-gray-800 z-10 py-2 border-b border-gray-100 justify-between">
        <span
          className={cn(
            'text-sm font-bold uppercase px-2 py-1 rounded w-fit',
            isMain ? 'text-blue-800 bg-blue-50' : 'text-gray-600 bg-gray-100'
          )}
        >
          {title} ({units.length})
        </span>
        {units.length > 0 && (
          <div className="text-[11px] flex gap-3 px-1">
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 size={12} /> Đã xem: {viewedCount}
            </span>
            <span className="text-orange-600 font-medium flex items-center gap-1">
              <Clock size={12} /> Chưa xem: {notViewedCount}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {units.length > 0 ? (
          units.map((u) => <UnitTag key={u.id_don_vi_xu_ly} unit={u} />)
        ) : (
          <div className="text-gray-400 text-sm italic w-full text-center py-4">{emptyText}</div>
        )}
      </div>
    </div>
  )
}

const UnitTag = ({ unit }: { unit: DonViXuLy }) => {
  const isViewed = unit.da_xem === '1'

  // Group viewers by ID or Name
  const groupedViewers = useMemo(() => {
    if (!unit.nguoi_xem) return []
    const map = new Map<string, { info: (typeof unit.nguoi_xem)[0]; times: string[] }>()

    unit.nguoi_xem.forEach((v) => {
      const id = (v.ql_nguoi_dung_id || v.ql_nguoi_dung_ho_ten) as string
      if (!map.has(id)) {
        map.set(id, { info: v, times: [] })
      }
      map.get(id)?.times.push(v.ngay_xem)
    })

    return Array.from(map.values())
  }, [unit.nguoi_xem])

  return (
    <Popover>
      <Popover.Trigger>
        <button
          className={cn(
            'group relative px-3 py-1.5 rounded border text-sm font-medium transition-all select-none flex items-center gap-1.5',
            'hover:opacity-80 active:scale-95',
            isViewed
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
          )}
        >
          {unit.ten_don_vi}
          {isViewed && <CheckCircle2 size={13} className="text-emerald-500" />}
        </button>
      </Popover.Trigger>
      <Popover.Content placement="top" className="p-3 w-[280px]">
        <div className="w-full">
          <div className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-2">
            {unit.ten_don_vi}
          </div>

          <div className="space-y-3">
            <div
              className={cn(
                'text-xs flex items-center gap-2 font-medium p-2 rounded border',
                isViewed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-alert-50 text-orange-700 border-orange-100'
              )}
            >
              {isViewed ? <CheckCircle2 size={14} /> : <Clock size={14} />}
              <span className="grow">{isViewed ? 'Đã xem' : 'Chưa xem'}</span>
            </div>

            {unit.email && (
              <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                <Mail size={14} className="text-gray-400" />
                <span className="truncate">{unit.email}</span>
              </div>
            )}

            {isViewed && groupedViewers.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1 flex justify-between items-center">
                  <span>Người đã xem ({groupedViewers.length})</span>
                  <span className="text-[9px] font-normal normal-case opacity-70">
                    Nhấn để xem chi tiết
                  </span>
                </div>
                <div className="max-h-[200px] overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                  {groupedViewers.map((group, idx) => (
                    <ViewerItem key={idx} group={group} />
                  ))}
                </div>
              </div>
            )}

            {isViewed && groupedViewers.length === 0 && (
              <div className="px-1 py-2 text-xs text-gray-400 italic text-center bg-gray-50 rounded">
                Thông tin người xem được cập nhật theo danh sách mới.
              </div>
            )}
          </div>
        </div>
      </Popover.Content>
    </Popover>
  )
}

const ViewerItem = ({ group }: { group: { info: any; times: string[] } }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-transparent hover:border-gray-100 rounded transition-all">
      <div
        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-center bg-gray-200 text-gray-600 rounded-full w-6 h-6 shrink-0 text-[10px] font-medium">
          {group.info.ql_nguoi_dung_ho_ten?.charAt(0)}
        </div>
        <div className="flex flex-col min-w-0 grow">
          <span className="text-xs font-semibold text-gray-700 truncate">
            {group.info.ql_nguoi_dung_ho_ten}
          </span>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            {group.times.length} lần xem
          </span>
        </div>
        <div className="text-gray-400">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </div>

      {isOpen && (
        <div className="pl-9 pr-2 pb-2 space-y-1 animation-fade-in">
          {group.times.map((time, tIdx) => (
            <div
              key={tIdx}
              className="text-[10px] text-gray-500 flex items-center gap-1.5 bg-gray-50 px-1.5 py-1 rounded border border-gray-100"
            >
              <Clock size={10} className="text-gray-400" />
              {time}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
