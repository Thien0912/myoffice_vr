import { Spinner } from '@heroui/react'
import { callApi } from '@renderer/api/callApi'
import { mapCaLamViecOptions } from '@renderer/api/danhmuc/caLamViecAxios'
import { UserAvatar } from '@renderer/components/UserAvatar'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, ChevronDown, History, Edit2, Calendar, Tag } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface HistoryRecord {
  id: string
  action: string
  created_at: string
  created_by_name: string
  created_by_avatar: string
  created_by_email?: string
  changes: Array<{
    field: string
    field_name: string
    old_value: any
    new_value: any
  }>
}

// Dictionary to map database fields to human-readable labels
const FIELD_MAP: Record<string, string> = {
  ho_va_ten: 'Họ và tên',
  ngay_sinh: 'Ngày sinh',
  id_ca_lam_viec: 'Ca làm việc',
  ti_le_dong: 'Tỷ lệ đóng bảo hiểm (NLĐ)',
  ti_le_dong_dn: 'Tỷ lệ đóng bảo hiểm (DN)',
  noi_dk_kcb: 'Nơi đăng ký KCB',
  gioi_tinh: 'Giới tính',
  so_cmnd: 'Số CMND/CCCD',
  ngay_cap_cmnd: 'Ngày cấp CMND/CCCD',
  noi_cap_cmnd: 'Nơi cấp CMND/CCCD',
  dien_thoai: 'Điện thoại',
  email: 'Email',
  ma_so_thue: 'Mã số thuế',
  so_bhxh: 'Số BHXH',
  loai_hop_dong: 'Loại hợp đồng',
  trang_thai: 'Trạng thái',
  id_phong_ban: 'Phòng ban',
  id_chuc_vu: 'Chức vụ',
  id_danh_hieu: 'Danh hiệu',
  dia_chi_thuong_tru: 'Địa chỉ thường trú',
  dia_chi_tam_tru: 'Địa chỉ tạm trú',
  que_quan: 'Quê quán',
  ngay_bat_dau: 'Ngày bắt đầu làm việc',
  ngay_chinh_thuc: 'Ngày vào chính thức',
  ngay_thoi_viec: 'Ngày thôi việc',
  minh_chung_upload: 'Hình ảnh minh chứng',
  minh_chung_delete: 'Xóa minh chứng',
}

// Gọi API lấy dữ liệu thực tế
const fetchHistory = async (idNhanVien: string): Promise<HistoryRecord[]> => {
  try {
    const res = await callApi(`admin/hrm/nhanvien/history/${idNhanVien}`, { method: 'GET' })
    const rawData = res.data || []

    return rawData.map((item: any) => {
      let parsedChanges = item.changes
      if (typeof item.changes === 'string') {
        try {
          parsedChanges = JSON.parse(item.changes)
        } catch (e) {
          parsedChanges = []
        }
      }
      return {
        ...item,
        id: item.id_lich_su || item.id,
        changes: Array.isArray(parsedChanges) ? parsedChanges : []
      }
    })
  } catch (error) {
    console.error('Lỗi lấy lịch sử:', error)
    return []
  }
}

export default function HosonhansuEditHistory({ idNhanVien }: { idNhanVien: string }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleCollapse = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const queryClient = useQueryClient()

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['nhansu', 'history', idNhanVien],
    queryFn: () => fetchHistory(idNhanVien)
  })

  // Refresh history khi minh chứng được upload/xóa
  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['nhansu', 'history', idNhanVien] })
    }
    window.addEventListener('minh-chung-refresh', handler)
    return () => window.removeEventListener('minh-chung-refresh', handler)
  }, [queryClient, idNhanVien])

  // Lấy các danh mục để map ID sang Tên Text hiển thị
  const { data: caLamViecOptions = [] } = useQuery({
    queryKey: ['ca-lam-viec-options'],
    queryFn: () => mapCaLamViecOptions(),
    staleTime: 1000 * 60 * 60
  })

  // Hàm dịch Value (Hỗ trợ cả format Object Label mới từ Backend và Fallback String cũ)
  const renderValueText = (field: string, val: any) => {
    if (val === null || val === undefined || val === 'null' || val === '') return null

    // Nếu dữ liệu được trả về là Object từ backend (dạng { value, label })
    if (typeof val === 'object' && val !== null && 'label' in val) {
      if (val.label === 'null' || val.label === '' || val.label === null) return null
      return val.label
    }

    // Nếu dữ liệu là String/ID cũ chưa đc convert, fallback xử lý hiển thị
    if (field === 'id_ca_lam_viec') {
      const match = caLamViecOptions.find((o: any) => o.value === String(val))
      return match ? match.label : String(val)
    }

    return String(val)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <Spinner size="md" color="primary" label="Đang đồng bộ lịch sử..." />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto h-full">
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 mt-8 text-center text-gray-500 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 mb-4 shrink-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-full">
            <History size={28} className="text-gray-400 opacity-60" strokeWidth={1.5} />
          </div>
          <p className="text-[14px] font-medium text-gray-800 dark:text-gray-200 mb-1">Chưa có lịch sử cập nhật</p>
          <p className="text-[13px] text-gray-500 opacity-80 max-w-xs">Nhân sự này chưa có bất kỳ thay đổi nào về thông tin hồ sơ.</p>
        </div>
      ) : (
        <div className="mt-4 mb-10 pb-20 flex flex-col gap-6">
          {history.map((record, index) => (
            <div key={record.id} className="relative group pl-16 sm:pl-16">
              {/* Vertical line connecting to the next item */}
              {index !== history.length - 1 && (
                <div className="absolute left-[19px] top-[40px] bottom-[-24px] w-px bg-gray-200 dark:bg-gray-700" />
              )}

              {/* Timeline Dot (Pencil) */}
              <div className="absolute left-0 top-0 z-10 flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-primary-500">
                <Edit2 size={18} strokeWidth={2} />
              </div>

              {/* Content card */}
              <div className="p-6 rounded-xl border border-gray-200/80 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-gray-900 w-full relative z-20 transition-colors duration-200">

                {/* Header with collapse toggle */}
                <div className={`flex flex-col gap-3 ${!expandedIds.has(record.id) ? '' : 'mb-5 pb-5 border-b border-gray-100 dark:border-gray-800/80'}`}
                  style={{ transition: 'margin 300ms ease, padding 300ms ease' }}
                >
                  {/* Title row + collapse button */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[16px] text-gray-900 dark:text-gray-100">
                      {record.action}
                    </span>
                    {!expandedIds.has(record.id) && record.changes.length > 0 && (
                      <span className="text-xs text-gray-400 font-normal bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        {record.changes.length} thay đổi
                      </span>
                    )}

                    {/* Collapse toggle button */}
                    <button
                      type="button"
                      onClick={() => toggleCollapse(record.id)}
                      className="shrink-0 ml-auto w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      aria-label={!expandedIds.has(record.id) ? 'Mở rộng' : 'Thu gọn'}
                    >
                      <ChevronDown
                        size={16}
                        strokeWidth={2}
                        className="text-gray-400 transition-transform duration-300 ease-in-out"
                        style={{ transform: !expandedIds.has(record.id) ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                      />
                    </button>
                  </div>

                  {/* Meta info block */}
                  <div className="flex flex-col gap-2 pl-0.5">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-[13px] text-gray-500">
                      <Calendar size={14} strokeWidth={2} className="text-gray-400" />
                      <time dateTime={record.created_at} className="font-medium text-gray-500 dark:text-gray-400">
                        {new Date(record.created_at).toLocaleString('vi-VN')}
                      </time>
                    </div>

                    {/* Editor info */}
                    <div className="flex items-center gap-2 text-[13px] text-gray-500">
                      <UserAvatar size="sm" src={record.created_by_avatar} name={record.created_by_name} className="w-5 h-5 shrink-0 text-[9px]" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{record.created_by_name}</span>
                      {record.created_by_email && (
                        <span className="text-gray-400 text-xs">
                          ({record.created_by_email})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible content area with smooth CSS grid animation */}
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{ gridTemplateRows: !expandedIds.has(record.id) ? '0fr' : '1fr' }}
                >
                  <div className="overflow-hidden">
                    {record.changes.length > 0 ? (
                      <div className="flex flex-col gap-3" style={{ paddingTop: !expandedIds.has(record.id) ? 0 : undefined }}>
                        {record.changes.map((change, i) => (
                          <div key={i} className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border-l-[3px] border-primary-400 dark:border-primary-600">
                            <div className="flex items-center gap-2">
                              <Tag size={14} strokeWidth={2} className="text-primary-500 dark:text-primary-400" />
                              <span className="uppercase font-bold text-[12px] tracking-wide text-primary-600 dark:text-primary-400">
                                {FIELD_MAP[change.field] || change.field_name || change.field}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 pl-[22px]">
                              <div className="px-3 py-1.5 rounded-md text-[13px] font-medium border border-danger-500 text-danger-500 bg-white dark:bg-gray-900 max-w-[280px] break-words">
                                {renderValueText(change.field, change.old_value) || <span className="text-gray-400 dark:text-gray-500 italic font-normal text-xs">Trống</span>}
                              </div>

                              <ArrowRight size={14} className="text-gray-300 dark:text-gray-500 shrink-0" strokeWidth={2.5} />

                              <div className="px-3 py-1.5 rounded-md text-[14px] font-bold bg-white dark:bg-gray-900 max-w-[280px] break-words" style={{ color: '#1b5e20', borderWidth: 1, borderStyle: 'solid', borderColor: '#4caf50' }}>
                                {renderValueText(change.field, change.new_value) || <span className="text-gray-400 dark:text-gray-500 italic font-normal text-xs">Đã xóa</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                        Không có chi tiết thay đổi nào được ghi nhận.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
