import { useMemo } from 'react'

import { PanelLeftOpen } from 'lucide-react'
import UserAvatar from '@renderer/components/UserAvatar'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { Chip } from '@heroui/react'
import { useNavigate } from 'react-router-dom'

export const useHosonhansuColumns = (
  donviOptions: any[],
  vitriOptions: any[],
  pinnedColumns: Record<string, any>,
  onOpenEdit?: (id: number, name?: string, maNhanVien?: string, trangThai?: string) => void
) => {
  const navigate = useNavigate()

  const trangThaiOptions = [
    { value: 'DANG_HOC_VIEC', label: 'Đang học việc' },
    { value: 'DANG_THU_VIEC', label: 'Đang thử việc' },
    { value: 'DANG_LAM_VIEC', label: 'Đang làm việc' },
    { value: 'TAM_NGHI', label: 'Tạm nghỉ' },
    { value: 'DANG_LAM_THU_TUC_THOI_VIEC', label: 'Đang làm thủ tục thôi việc' },
    { value: 'NGHI_VIEC', label: 'Nghỉ việc' }
  ]

  const getTrangThaiColor = (status: string) => {
    switch (status) {
      case 'DANG_HOC_VIEC':
        return 'warning'
      case 'DANG_THU_VIEC':
        return 'primary'
      case 'DANG_LAM_VIEC':
        return 'success'
      case 'TAM_NGHI':
        return 'default'
      case 'DANG_LAM_THU_TUC_THOI_VIEC':
        return 'danger'
      case 'NGHI_VIEC':
        return 'danger'
      default:
        return 'default'
    }
  }

  const gioiTinhOptions = [
    { value: '1', label: 'Nam' },
    { value: '2', label: 'Nữ' }
  ]

  const allColumns: TableColumnType[] = useMemo(() => {
    const columns: TableColumnType[] = [
      {
        uid: 'stt',
        sortable: false,
        name: '#',
        width: 40,
        minWidth: 40,
        className: 'text-center font-bold p-0!',
        pinned: 'left',
        disablePinning: true
      },
      {
        uid: 'ma_nhan_vien',
        name: 'Mã NV',
        editable: false,
        pinned: 'left',
        render: (value, row: any) => (
          <div className="relative flex items-center w-full min-h-8 group">
            <span className="font-medium">{value as string}</span>
            <div className="absolute -right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenEdit?.(row.id_nhan_vien, row.ho_va_ten, row.ma_nhan_vien, row.trang_thai)
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded shadow-md transition-all active:scale-95 cursor-pointer border-none font-medium text-[11px]"
              >
                <PanelLeftOpen size={14} className="text-white" />
                Mở
              </button>
            </div>
          </div>
        )
      },
      {
        uid: 'ho_va_ten',
        name: 'Họ và tên',
        width: 300,
        render: (value, row: any) => (
          <div className="flex items-center gap-2.5 w-full min-h-8">
            <UserAvatar name={row.ho_va_ten} gender={row.gioi_tinh} src={row.avatar} className="shrink-0" />
            <span className="font-medium text-gray-700 dark:text-gray-200">
              {value as string}
            </span>
          </div>
        )
      },
      {
        uid: 'id_don_vi_cong_tac',
        name: 'Đơn vị',
        width: 220,
        type: 'select',
        options: donviOptions
      },
      {
        uid: 'id_vi_tri_cong_viec',
        name: 'Chức vụ',
        width: 200,
        type: 'select',
        options: vitriOptions
      },
      {
        uid: 'trang_thai',
        name: 'Trạng thái',
        width: 160,
        type: 'select',
        options: trangThaiOptions,
        renderDisplay: (value) => {
          const option = trangThaiOptions.find((opt) => opt.value === value)
          if (!option) return value as string

          return (
            <Chip
              size="sm"
              variant="flat"
              color={getTrangThaiColor(String(value)) as any}
              className="text-[11px] font-medium"
            >
              {option.label}
            </Chip>
          )
        }
      },
      { uid: 'hoc_ham', name: 'Học hàm', width: 130 },
      { uid: 'hoc_vi', name: 'Học vị', width: 130 },
      { uid: 'chuyen_nganh', name: 'Chuyên ngành', width: 180, sortable: false },

      {
        uid: 'ngay_lam_chinh_thuc',
        name: 'Ngày chính thức',
        type: 'date',
        width: 120
      },
      { uid: 'mst_ca_nhan', name: 'Mã số thuế', width: 130 },
      { uid: 'email', name: 'Email', width: 220 },
      { uid: 'gioi_tinh', name: 'Giới', width: 80, type: 'select', options: gioiTinhOptions },
      {
        uid: 'ngay_sinh',
        name: 'Ngày sinh',
        type: 'date',
        width: 120
      },
      {
        uid: 'noi_dt',
        name: 'Ngành đào tạo',
        width: 180
      }
    ]

    return columns.map((col) => {
      // Check if explicit pin state exists in store (could be 'left', 'right', or explicit 'none' for unpinned)
      const storedPin = pinnedColumns[col.uid]
      let finalPin = col.pinned

      if (storedPin !== undefined) {
        finalPin = storedPin === 'none' ? undefined : storedPin
      }

      return {
        ...col,
        pinned: finalPin
      }
    })
  }, [donviOptions, vitriOptions, pinnedColumns, onOpenEdit])

  return { allColumns, trangThaiOptions }
}
