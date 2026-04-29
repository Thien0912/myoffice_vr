import { Button, Popover, PopoverContent, PopoverTrigger, Tooltip, Textarea } from '@heroui/react'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import UserAvatar from '@renderer/components/UserAvatar'
import { date as formatDate } from '@renderer/utils/formatDate'
import { Check, ChevronDown, Loader2, Trash2, X, Edit3, Info } from 'lucide-react'
import { useState, useEffect, memo, useMemo, useCallback } from 'react'
import { GoogleTimePicker } from './components/CustomCalendarView'
import { OVERTIME_STATUS_CONFIG, OvertimeRequest } from './types'
import DOMPurify from 'dompurify'
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import { useQueryClient } from '@tanstack/react-query'
import { cn, toast } from '@heroui-v3/react'

// Native time formatter — replaces moment(val, 'HH:mm:ss').format('HH:mm')
const formatHHmm = (time: string | null | undefined): string => {
  if (!time) return '---'
  return String(time).substring(0, 5)
}

const DAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']

// Native date formatter — replaces moment(val).format('DD/MM/YYYY')
const viDateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
const formatDDMMYYYY = (value: string | null | undefined): string => {
  if (!value) return '---'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '---'
  const dateStr = viDateFormatter.format(d)
  const dayName = DAYS[d.getDay()]
  return `${dateStr} (${dayName})`
}

// Format hours: 1.0 → "1h", 1.5 → "1.5h", 0 → "0h"
const formatSoGio = (soGio: number | null | undefined): string => {
  if (soGio == null || soGio === 0) return '0h'
  const rounded = Math.round(soGio * 10) / 10
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded}h`
}

const InlineFieldEditCell = memo(({
  row,
  field,
  value,
  title,
  isRichText = false
}: {
  row: OvertimeRequest;
  field: 'noi_dung' | 'chi_tiet';
  value: string;
  title: string;
  isRichText?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentValue, setCurrentValue] = useState(value || '')
  const [isSaving, setIsSaving] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    setCurrentValue(value || '')
  }, [value, isOpen])

  const handleSave = async () => {
    if (currentValue === (value || '')) {
      setIsOpen(false)
      return
    }

    setIsSaving(true)
    try {
      const res = await ngoaiGioAxios.update({
        id_ngoai_gio: row.id_ngoai_gio,
        [field]: currentValue
      })
      if (res.success) {
        toast('Thành công', { description: `Đã cập nhật ${title.toLowerCase()}`, variant: 'success' })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGio'] })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioEmployee'] })
        setIsOpen(false)
      } else {
        toast('Lỗi', { description: res.message || 'Cập nhật thất bại', variant: 'danger' })
      }
    } catch (err: any) {
      toast('Lỗi', { description: err.message || 'Có lỗi xảy ra', variant: 'danger' })
    } finally {
      setIsSaving(false)
    }
  }

  const safeContent = useMemo(() => isRichText && value ? DOMPurify.sanitize(value, { ALLOWED_TAGS: [] }) : '', [value, isRichText])

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-start"
      showArrow
      classNames={{
        content: 'w-[400px] p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl rounded-xl z-[9999]'
      }}
    >
      <PopoverTrigger>
        <div className="group relative pr-6 py-1 truncate cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors min-w-[100px] w-full">
          {isRichText ? (
            <div
              className={`leading-normal truncate text-[13px] font-medium
                ${!value ? 'text-gray-400 italic font-normal' : 'text-gray-700 dark:text-gray-300'}`}
              title={safeContent || 'Nhấn để chỉnh sửa'}
              dangerouslySetInnerHTML={{ __html: safeContent || 'Chưa có thông tin' }}
            />
          ) : (
            <div
              className={`leading-normal truncate text-[13px] font-medium
                ${!value ? 'text-gray-400 italic font-normal' : 'text-gray-700 dark:text-gray-300'}`}
              title={value || 'Nhấn để chỉnh sửa'}
            >
              {value || 'Chưa có thông tin'}
            </div>
          )}
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity">
            <Edit3 size={13} strokeWidth={2.5} />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-3 w-full">
          <div className="text-sm font-semibold border-b border-gray-100 dark:border-gray-700 pb-2">
            Chỉnh sửa {title.toLowerCase()}
          </div>
          <Textarea
            value={currentValue}
            onValueChange={setCurrentValue}
            minRows={3}
            maxRows={6}
            placeholder={`Nhập ${title.toLowerCase()}...`}
            className="w-full"
            variant="bordered"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-1">
            <Button size="sm" variant="bordered" onPress={() => setIsOpen(false)} isDisabled={isSaving}>
              Hủy
            </Button>
            <Button
              size="sm"
              color="primary"
              onPress={handleSave}
              isLoading={isSaving}
              className="font-semibold shadow-md bg-blue-600 text-white"
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})



export interface OvertimePermissions {
  canApprove: boolean
  canApproveByTCHC?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

const formatTime = (time: string | null | undefined): string => {
  if (!time) return '---'
  const timeStr = String(time)
  if (timeStr.includes(' ')) {
    return timeStr.split(' ')[1].substring(0, 5)
  }
  if (timeStr.includes('T')) {
    return timeStr.split('T')[1].substring(0, 5)
  }
  return '00:00'
}

export const getOvertimeColumns = (
  onApprove: (row: OvertimeRequest) => void,
  onReject: (row: OvertimeRequest) => void,
  onDelete: (row: OvertimeRequest) => void,
  onViewDetail: (row: OvertimeRequest) => void,
  onUpdateShift: (row: OvertimeRequest, start: string, end: string) => Promise<boolean>,
  permissions?: OvertimePermissions,
  onViewEmployee?: (employeeId: number | string) => void,
  onEdit?: (row: OvertimeRequest) => void
): TableColumnType<OvertimeRequest>[] => {
  const allColumns: TableColumnType<OvertimeRequest>[] = [
    {
      uid: 'stt',
      name: '#',
      width: 50,
      className: 'text-center font-bold p-0! text-[13px]',
      pinned: 'left',
      editable: false
    },
    {
      uid: 'ngay_dang_ky',
      name: 'Ngày đăng ký',
      width: 170,
      sortable: true,
      editable: false,
      render: (value: any, row?: OvertimeRequest) => {
        if (!row) return '---'

        return (
          <div className='flex flex-col text-[#364153]'>
            <div className="flex items-center gap-1.5 font-bold  dark:text-gray-200 text-[13px]">
              <span>{formatHHmm(row.gio_bat_dau)}</span>
              <span className="text-gray-400 dark:text-gray-500 font-normal">—</span>
              <span>{formatHHmm(row.gio_ket_thuc)}</span>
            </div>
            <span
              className="dark:text-gray-400 transition-colors font-medium text-[11px]"
            >
              {formatDDMMYYYY(value)}
            </span>
          </div>
        )
      }
    },
    {
      uid: 'so_gio',
      name: 'Số giờ',
      width: 100,
      sortable: true,
      editable: false,
      render: (value: any) => (
        <span className="font-semibold text-gray-700 dark:text-gray-200 text-[13px]">
          {value != null ? `${value}h` : '---'}
        </span>
      )
    },
    {
      uid: 'nhan_vien',
      name: 'Nhân viên',
      width: 330,
      editable: false,
      render: (_: any, row?: OvertimeRequest) => {
        if (!row) return null
        return (
          <div
            className="flex items-center gap-2.5 py-1 group/emp hover:bg-blue-50/50 rounded-lg transition-colors -mx-1 px-1 pr-8 relative"
          // onClick={(e) => {
          //   e.stopPropagation()
          //   onViewEmployee?.(row.id_nhan_vien)
          // }}
          >
            <UserAvatar
              name={row.ho_va_ten || `User ${row?.id_nhan_vien}`}
              src={row.avatar || undefined}
              size="sm"
            />
            <div className="flex flex-col leading-tight min-w-0">
              <div className="text-[#364153] dark:text-gray-200 font-medium text-[13px] truncate flex items-center gap-1">
                <span className="truncate">{row.ho_va_ten || '---'}</span>
                <span className="text-gray-500 font-normal shrink-0">
                  ({(row as any).ten_chuc_vu || row.ma_nhan_vien || '---'})
                </span>
              </div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {row.ten_don_vi || '---'}
              </span>
            </div>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <Tooltip
                content="Chi tiết"
                className="bg-slate-100 dark:bg-slate-800 text-[#364153] dark:text-gray-200 font-medium"
                radius="none"
              >
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => {
                    onViewDetail(row)
                  }}
                  className="h-7 w-7 min-w-0 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-md"
                >
                  <Info size={15} />
                </Button>
              </Tooltip>
            </div>
          </div>
        )
      }
    },
    {
      uid: 'trang_thai_tong',
      name: 'Trạng thái tổng',
      width: 150,
      sortable: true,
      editable: false,
      render: (value: any, row?: OvertimeRequest) => {
        if (!row) return null
        const status = (value || 'Cho_duyet') as keyof typeof OVERTIME_STATUS_CONFIG
        const config = OVERTIME_STATUS_CONFIG[status] || OVERTIME_STATUS_CONFIG['Cho_duyet']

        let approverName = status === 'Cho_duyet' ? 'Chưa duyệt' : '---'
        let approverAvatar: string | undefined
        let time: string | null = null
        let reason = 'Không có ghi chú'

        const danhSach = row.danh_sach_nguoi_duyet
        if (danhSach && danhSach.length > 0) {
          const first = danhSach[0]
          approverName = first.ql_nguoi_dung_ho_ten || approverName
          approverAvatar = first.ql_nguoi_dung_avatar || undefined
        } else if (row.nguoi_duyet?.length) {
          const currentLevelApprover = row.nguoi_duyet.find(nd => nd.cap_duyet === row.cap_duyet_hien_tai)
          const lastApprover = row.nguoi_duyet.filter(nd => nd.trang_thai !== 'Cho_duyet').sort((a, b) => (b.id_ngoai_gio_nguoi_duyet || 0) - (a.id_ngoai_gio_nguoi_duyet || 0))[0]
          const displayApprover = status === 'Cho_duyet' ? currentLevelApprover : lastApprover
          approverName = displayApprover?.ho_ten_nguoi_duyet || approverName
          time = displayApprover?.thoi_gian_duyet ? formatDate('H:i d/m/Y', displayApprover.thoi_gian_duyet) : null
          reason = displayApprover?.ly_do_duyet || reason
        }

        const BadgeContent = (
          <div className="flex flex-col items-center leading-none py-1 gap-0.5 w-full">
            <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${config.text}`}>
              {status === 'Cho_duyet' ? (
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse shadow-[0_0_4px_rgba(234,179,8,0.5)]`} />
              ) : status === 'Da_duyet' ? (
                <Check size={11} strokeWidth={3} />
              ) : (
                <X size={11} strokeWidth={3} />
              )}
              {config.label}
            </div>
          </div>
        )

        const infoText = status !== 'Cho_duyet' && status !== 'Huy'
          ? `Người xử lý: ${approverName}${time ? `\nThời gian: ${time}` : ''}\nLý do: ${reason}`
          : undefined

        const MainBadge = (
          <div
            className={`flex items-center justify-center h-10 w-full ${status !== 'Cho_duyet' ? 'cursor-pointer' : ''}`}
            title={infoText}
          >
            <div className={`w-full transition-opacity duration-200`}>
              {BadgeContent}
            </div>
          </div>
        )

        return MainBadge
      }
    },
    {
      uid: 'duyet_don_vi',
      name: 'Duyệt đơn vị',
      width: 160,
      sortable: false,
      editable: false,
      render: (_: any, row?: OvertimeRequest) => {
        if (!row) return null
        if (row.trang_thai_tong === 'Huy') {
          const config = OVERTIME_STATUS_CONFIG['Huy']
          return (
            <div className="flex items-center justify-center py-1">
              <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${config.text}`}>
                ---
              </div>
            </div>
          )
        }
        const level1 = row.danh_sach_nguoi_duyet?.find(d => String(d.cap_duyet) === '1')
        const status = level1 ? (level1.trang_thai as keyof typeof OVERTIME_STATUS_CONFIG) : 'Cho_duyet'
        const config = OVERTIME_STATUS_CONFIG[status] || OVERTIME_STATUS_CONFIG['Cho_duyet']
        const name = level1?.ql_nguoi_dung_ho_ten || ''

        const currentApprovalLevel = parseInt(String(row.cap_duyet_hien_tai || '1'), 10)
        // Hiện nút khi: có quyền + cấp 1 chờ duyệt + đơn chưa qua cấp 2
        const canUserApprove = permissions?.canApprove && status === 'Cho_duyet' && currentApprovalLevel <= 1

        return (
          <div className="group/approval relative flex items-center justify-center w-full h-10">
            {/* Badge trạng thái */}
            <div className={`transition-opacity duration-200 ${canUserApprove ? 'group-hover/approval:opacity-0' : ''}`}>
              <div className="flex flex-col items-center leading-none py-1 gap-0.5 w-full" title={name ? `Người duyệt: ${name}` : undefined}>
                <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${config.text}`}>
                  {status === 'Cho_duyet' ? (
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse shadow-[0_0_4px_rgba(234,179,8,0.5)]`} />
                  ) : status === 'Da_duyet' ? (
                    <Check size={11} strokeWidth={3} />
                  ) : (
                    <X size={11} strokeWidth={3} />
                  )}
                  {config.label}
                </div>
                {name && status !== 'Cho_duyet' && (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[110px]">{name}</span>
                )}
              </div>
            </div>

            {/* Nút Duyệt/Từ chối khi hover */}
            {canUserApprove && (
              <div className="absolute z-30 inset-0 opacity-0 group-hover/approval:opacity-100 flex items-center justify-center gap-1.5 pointer-events-none group-hover/approval:pointer-events-auto transition-all duration-300 translate-y-2 group-hover/approval:translate-y-0 flex-nowrap min-w-max w-full backdrop-blur-[2px] px-2 rounded-md">
                <Button
                  size="sm"
                  className="h-7 px-2.5 bg-[#22c55e] text-white font-bold text-[9px] rounded-md shadow-sm whitespace-nowrap min-w-max"
                  onPress={() => onApprove(row)}
                >
                  DUYỆT
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] rounded-md shadow-sm whitespace-nowrap min-w-max"
                  onPress={() => onReject(row)}
                >
                  TỪ CHỐI
                </Button>
              </div>
            )}
          </div>
        )
      }
    },
    {
      uid: 'duyet_to_chuc',
      name: 'Duyệt tổ chức',
      width: 160,
      sortable: false,
      editable: false,
      render: (_: any, row?: OvertimeRequest) => {
        if (!row) return null
        if (row.trang_thai_tong === 'Huy') {
          const config = OVERTIME_STATUS_CONFIG['Huy']
          return (
            <div className="flex items-center justify-center py-1">
              <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${config.text}`}>
                ---
              </div>
            </div>
          )
        }
        const level2 = row.danh_sach_nguoi_duyet?.find(d => String(d.cap_duyet) === '2')
        const status = level2 ? (level2.trang_thai as keyof typeof OVERTIME_STATUS_CONFIG) : 'Cho_duyet'
        const config = OVERTIME_STATUS_CONFIG[status] || OVERTIME_STATUS_CONFIG['Cho_duyet']
        const name = level2?.ql_nguoi_dung_ho_ten || ''

        const currentApprovalLevel = parseInt(String(row.cap_duyet_hien_tai || '1'), 10)
        const level1 = row.danh_sach_nguoi_duyet?.find(d => String(d.cap_duyet) === '1')
        // Hiện nút khi: có quyền + cấp 2 chờ duyệt + (đơn đã ở cấp 2 HOẶC cấp 1 đã duyệt xong)
        const canUserApprove = permissions?.canApproveByTCHC && status === 'Cho_duyet' && (currentApprovalLevel >= 2 || level1?.trang_thai === 'Da_duyet')

        return (
          <div className="group/approval relative flex items-center justify-center w-full h-10">
            {/* Badge trạng thái */}
            <div className={`transition-opacity duration-200 ${canUserApprove ? 'group-hover/approval:opacity-0' : ''}`}>
              <div className="flex flex-col items-center leading-none py-1 gap-0.5 w-full" title={name ? `Người duyệt: ${name}` : undefined}>
                <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${config.text}`}>
                  {status === 'Cho_duyet' ? (
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse shadow-[0_0_4px_rgba(234,179,8,0.5)]`} />
                  ) : status === 'Da_duyet' ? (
                    <Check size={11} strokeWidth={3} />
                  ) : (
                    <X size={11} strokeWidth={3} />
                  )}
                  {config.label}
                </div>
                {name && status !== 'Cho_duyet' && (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[110px]">{name}</span>
                )}
              </div>
            </div>

            {/* Nút Duyệt/Từ chối khi hover */}
            {canUserApprove && (
              <div className="absolute z-30 inset-0 opacity-0 group-hover/approval:opacity-100 flex items-center justify-center gap-1.5 pointer-events-none group-hover/approval:pointer-events-auto transition-all duration-300 translate-y-2 group-hover/approval:translate-y-0 flex-nowrap min-w-max w-full backdrop-blur-[2px] px-2 rounded-md">
                <Button
                  size="sm"
                  className="h-7 px-2.5 bg-[#22c55e] text-white font-bold text-[9px] rounded-md shadow-sm whitespace-nowrap min-w-max"
                  onPress={() => onApprove(row)}
                >
                  DUYỆT
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] rounded-md shadow-sm whitespace-nowrap min-w-max"
                  onPress={() => onReject(row)}
                >
                  TỪ CHỐI
                </Button>
              </div>
            )}
          </div>
        )
      }
    },
    // {
    //   uid: 'danh_sach_nguoi_duyet',
    //   name: 'Người duyệt',
    //   width: 250,
    //   editable: false,
    //   render: (_: any, row?: OvertimeRequest) => {
    //     if (!row || !row.danh_sach_nguoi_duyet || row?.danh_sach_nguoi_duyet?.length === 0 || row?.trang_thai_tong === 'Huy') return '---'

    //     if (row.trang_thai_tong === 'Cho_duyet') {
    //       return <span className="text-[13px] tracking-tight leading-tight">Đang chờ duyệt</span>
    //     }

    //     const approvers = row.danh_sach_nguoi_duyet
    //     const firstName = approvers[0].ql_nguoi_dung_ho_ten

    //     return (
    //       <Tooltip
    //         isDisabled={approvers.length <= 1}
    //         content={
    //           <div className="flex flex-col gap-0.5 p-0.5 max-h-[300px] overflow-y-auto">
    //             {approvers.map((item, idx) => (
    //               <div key={idx} className="flex items-center gap-2 py-1 px-1.5 hover:bg-white/10 rounded-lg transition-colors">
    //                 <UserAvatar
    //                   name={item.ql_nguoi_dung_ho_ten}
    //                   src={item.ql_nguoi_dung_avatar || undefined}
    //                   size="sm"
    //                   className="w-7 h-7 text-[10px] font-bold"
    //                 />
    //                 <div className="flex flex-col">
    //                   <span className="text-[13px] font-semibold text-white tracking-tight leading-tight">{item.ql_nguoi_dung_ho_ten}</span>
    //                 </div>
    //               </div>
    //             ))}
    //           </div>
    //         }
    //         classNames={{
    //           content: "bg-[#555555] border-none shadow-2xl rounded-lg p-1.5 min-w-[180px]",
    //           arrow: "!bg-[#555555]"
    //         }}
    //         placement="bottom"
    //         offset={10}
    //         showArrow
    //         delay={1000}
    //       >
    //         <div className="flex items-center gap-2 cursor-pointer group">
    //           <div className="flex -space-x-2 overflow-hidden">
    //             {/* {approvers.map((item, index) => (
    //               <UserAvatar
    //                 key={index}
    //                 name={item.ql_nguoi_dung_ho_ten}
    //                 src={item.ql_nguoi_dung_avatar || undefined}
    //                 size="sm"
    //                 className="border-2 border-white dark:border-gray-900 w-6 h-6 hover:z-10 transition-all text-[10px]"
    //               />
    //             ))} */}
    //           </div>
    //           <span className="font-semibold text-[13px] truncate max-w-[150px] group-hover:underline">
    //             {firstName}{approvers.length > 1 ? '...' : ''}
    //           </span>
    //         </div>
    //       </Tooltip>
    //     )
    //   }
    // },
    {
      uid: 'is_dotxuat',
      name: 'Loại đăng ký',
      width: 130,
      editable: false,
      render: (_: any, row?: OvertimeRequest) => {
        if (!row) return null
        const isDotXuat = row.is_dotxuat === '1' || row.is_dotxuat === 1

        return (
          <div className="flex items-center py-1" title={isDotXuat ? 'Đăng ký ngoài giờ đột xuất' : 'Đăng ký bình thường'}>
            <span className={cn('text-[13px]')}>{isDotXuat ? 'Đột xuất' : 'Bình thường'}</span>
          </div>
        )
      }
    },
    {
      uid: 'tao_ho',
      name: 'Người tạo',
      width: 150,
      editable: false,
      render: (_: any, row?: OvertimeRequest) => {
        if (!row) return null
        if (row.tao_ho === '1' || row.tao_ho === 1) {
          return (
            <div className="flex flex-col py-1" title={row.nguoi_tao_ho_ten ? `Người tạo: ${row.nguoi_tao_ho_ten}` : ''}>
              <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">
                {row.nguoi_tao_ho_ten || '---'}
              </span>
            </div>
          )
        }
        return (
          <div className="flex items-center gap-1.5 py-1" title="Nhân viên tự đăng ký">
            <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">
              {'---'}
            </span>
          </div>
        )
      }
    },
    // {
    //   uid: 'thoi_gian_cham_cong',
    //   name: 'Thời gian chấm công',
    //   width: 170,
    //   sortable: true,
    //   sortKey: 'thoi_gian_bat_dau_cham_cong',
    //   editable: false,
    //   render: (_: any, row: any) => {
    //     const hasStart = !!row.thoi_gian_bat_dau_cham_cong
    //     const hasEnd = !!row.thoi_gian_ket_thuc_cham_cong

    //     if (!hasStart && !hasEnd) {
    //       return <span className="text-gray-400 dark:text-gray-500 font-medium text-[13px]">-</span>
    //     }

    //     return (
    //       <div className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-200 text-[13px]">
    //         <span>{hasStart ? formatTime(row.thoi_gian_bat_dau_cham_cong) : '-'}</span>
    //         <span className="text-gray-400 dark:text-gray-500 font-normal">—</span>
    //         <span>{hasEnd ? formatTime(row.thoi_gian_ket_thuc_cham_cong) : '-'}</span>
    //       </div>
    //     )
    //   }
    // },
    {
      uid: 'noi_dung',
      name: 'Tiêu đề',
      width: 300,
      sortable: true,
      editable: false,
      render: (value: any, row?: OvertimeRequest) => {
        if (!row) return '---'
        return <InlineFieldEditCell row={row} field="noi_dung" value={value} title="Tiêu đề" />
      }
    },
    {
      uid: 'chi_tiet',
      name: 'Chi tiết',
      width: 300,
      sortable: true,
      editable: false,
      render: (value: any, row?: OvertimeRequest) => {
        if (!row) return '---'
        return <InlineFieldEditCell row={row} field="chi_tiet" value={value} title="Chi tiết" isRichText />
      }
    },
    {
      uid: 'ly_do_huy',
      name: 'Lý do hủy',
      width: 250,
      sortable: false,
      editable: false,
      render: (value: any, row?: OvertimeRequest) => {
        if (!row || !row.ly_do_huy) return null;
        return (
          <div className="text-gray-500 dark:text-gray-400 italic text-[13px] line-clamp-2" title={row.ly_do_huy}>
            {row.ly_do_huy}
          </div>
        );
      }
    },
    {
      uid: 'created_at',
      name: 'Thời gian tạo',
      width: 170,
      sortable: true,
      editable: false,
      render: (value: any) => {
        if (!value) return <span className="text-gray-400 dark:text-gray-500 font-medium text-[13px]">-</span>
        const d = new Date(value)
        return (
          <div className="flex flex-col text-[13px] text-gray-700 dark:text-gray-200">
            <span className="font-medium">
              {d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
            <span className="text-gray-500 text-[11px]">
              {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )
      }
    },
    {
      uid: 'updated_at',
      name: 'Thời gian cập nhật',
      width: 170,
      sortable: true,
      editable: false,
      render: (value: any) => {
        if (!value) return <span className="text-gray-400 dark:text-gray-500 font-medium text-[13px]">-</span>
        const d = new Date(value)
        return (
          <div className="flex flex-col text-[13px] text-gray-700 dark:text-gray-200">
            <span className="font-medium">
              {d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
            <span className="text-gray-500 text-[11px]">
              {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )
      }
    }
  ]

  return allColumns
}

const TimeRangeEditCell = ({
  row,
  value,
  onUpdate,
  onDelete,
  onViewDetail
}: {
  row: OvertimeRequest
  value: any
  onUpdate: (row: OvertimeRequest, start: string, end: string) => Promise<boolean>
  onDelete: (row: OvertimeRequest) => void
  onViewDetail: (row: OvertimeRequest) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [start, setStart] = useState(row.gio_bat_dau?.substring(0, 5) || '17:30')
  const [end, setEnd] = useState(row.gio_ket_thuc?.substring(0, 5) || '19:00')
  const [isSaving, setIsSaving] = useState(false)

  const [isDeleting, setIsDeleting] = useState(false)

  // Prevent stale state if row data is updated from parent
  useEffect(() => {
    setStart(row.gio_bat_dau?.substring(0, 5) || '17:30')
    setEnd(row.gio_ket_thuc?.substring(0, 5) || '19:00')
  }, [row.gio_bat_dau, row.gio_ket_thuc])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Memoized handlers to prevent re-creation on every render
  const handleStartChange = useCallback((v: string) => {
    setStart(v)
    if (v) {
      const [h, m] = v.split(':').map(Number)
      if (!isNaN(h) && !isNaN(m)) {
        setEnd(`${String(Math.min(h + 1, 23)).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      }
    }
  }, [])

  const handleEndChange = useCallback((v: string) => {
    setEnd(v)
  }, [])

  const getDurationInfo = useCallback((startStr: string, endStr: string) => {
    if (!startStr || !endStr) return { text: '0h', isValid: true }
    const [sH, sM] = startStr.split(':').map(Number)
    const [eH, eM] = endStr.split(':').map(Number)
    const startMins = sH * 60 + sM
    const endMins = eH * 60 + eM

    let diffInMinutes = endMins - startMins
    const isValid = diffInMinutes > 0

    if (diffInMinutes < 0) diffInMinutes += 24 * 60
    const hours = diffInMinutes / 60

    if (!isValid) {
      return {
        text: 'Giờ kết thúc phải sau giờ bắt đầu',
        isValid: false
      }
    }

    return {
      text: `${hours.toFixed(1).replace('.0', '')}h`,
      isValid: true
    }
  }, [])

  const dur = useMemo(() => getDurationInfo(start, end), [start, end, getDurationInfo])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    const success = await onUpdate(row, start, end)
    setIsSaving(false)
    if (success) setIsOpen(false)
  }, [row, start, end, onUpdate])

  const handleDelete = useCallback(async () => {
    setIsDeleting(true)
    await onDelete(row)
    setIsDeleting(false)
    setShowDeleteConfirm(false)
  }, [row, onDelete])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <div
      className='flex items-center gap-2 group-hover:opacity-100 transition-opacity'
      onClick={(e) => e.stopPropagation()}
    >
      <Popover
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom-start"
        showArrow
        shouldCloseOnBlur={false}
        shouldCloseOnInteractOutside={(e) => {
          const target = e as Element
          return !target.closest?.('.custom-floating-portal')
        }}
        classNames={{
          content: 'p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-[0_10px_40px_rgba(0,0,0,0.12),0_1px_10px_rgba(0,0,0,0.05)] rounded-2xl'
        }}
      >
        <PopoverTrigger>
          <div
            className='flex flex-col hover:text-blue-500 text-[#364153] hover:cursor-pointer transition-colors'
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5 font-bold dark:text-gray-200 text-[13px]">
              <span>{formatHHmm(row.gio_bat_dau)}</span>
              <span className="text-gray-400 dark:text-gray-500 font-normal">—</span>
              <span>{formatHHmm(row.gio_ket_thuc)}</span>
              {/* <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">({formatSoGio(row.so_gio)})</span> */}
            </div>
            <span className="dark:text-gray-400 font-medium text-[11px]">
              {formatDDMMYYYY(value)}
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-3 min-w-[200px]">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chỉnh sửa khung giờ</span>
            <div className="flex items-center gap-2">
              <GoogleTimePicker value={start} onChange={handleStartChange} />
              <span className="text-gray-400">—</span>
              <GoogleTimePicker value={end} minTime={start} onChange={handleEndChange} />
            </div>
            <div className={`text-[11px] font-bold transition-colors ${dur.isValid ? 'text-[#1a73e8]' : 'text-red-500'}`}>
              {dur.isValid ? `Thời lượng: ${dur.text}` : dur.text}
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <Button
                size="sm"
                variant="flat"
                onPress={handleClose}
                className="h-8 rounded-full text-[12px]"
              >
                Hủy
              </Button>
              <Button
                size="sm"
                color="primary"
                onPress={handleSave}
                isLoading={isSaving}
                isDisabled={!dur.isValid}
                spinner={<Loader2 size={14} className="animate-spin" />}
                className={`h-8 rounded-full text-[12px] font-bold shadow-sm ${!dur.isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Cập nhật
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Custom Delete Confirmation Popover */}
      {/* <Popover
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        placement="top"
        showArrow
      >
        <PopoverTrigger>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 size={14} />
          </Button>
        </PopoverTrigger>
        <PopoverContent onClick={(e) => e.stopPropagation()}>
          <div className="p-2 flex flex-col gap-3 items-center text-center">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
              <Trash2 size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200">Xác nhận xóa đơn?</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Hành động này không thể hoàn tác.</span>
            </div>
            <div className="flex gap-2 w-full">
              <Button
                fullWidth
                size="sm"
                variant="flat"
                onPress={() => setShowDeleteConfirm(false)}
                className="h-8 rounded-lg text-[12px]"
              >
                Hủy
              </Button>
              <Button
                fullWidth
                size="sm"
                color="danger"
                onPress={handleDelete}
                isLoading={isDeleting}
                className="h-8 rounded-lg text-[12px] font-bold"
              >
                Xóa
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover> */}
    </div>
  )
}
