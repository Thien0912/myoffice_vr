import { Button as ButtonV3, Chip as ChipV3, Modal, Popover, toast } from '@heroui-v3/react'
import { Tooltip } from '@heroui/react'
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import LockedRangeCalendar from '@renderer/components/LockedRangeCalendar'
import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Calendar, Info, Lock, Unlock, X } from 'lucide-react'
import React, { useCallback, useEffect } from 'react'

interface LockedDateRange {
  start: string
  end: string
  locked_at?: string
  locked_by?: string
}

interface OvertimeLockModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** id_bang_cham_cong from current filter */
  timesheetId?: string | number | null
}

/** Chào “YYYY-MM-DD” → “DD/MM/YYYY” — an toàn với timezone */
const formatISODate = (iso: string): string => {
  if (!iso) return iso
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/**
 * API trả về locked_dates có 2 format:
 *   - string[]:            ["2026-04-06", "2026-04-07", ...] (từng ngày riêng lẻ)
 *   - LockedDateRange[]:   [{start, end, ...}] (khoảng thời gian)
 * Hàm này normalize về LockedDateRange[] và nhóm các ngày liên tiếp thành 1 range.
 */
const normalizeLockedDates = (raw: (string | LockedDateRange)[]): LockedDateRange[] => {
  // Separate strings and objects
  const strings: string[] = []
  const ranges: LockedDateRange[] = []

  for (const item of raw) {
    if (typeof item === 'string') strings.push(item)
    else ranges.push(item)
  }

  // Group consecutive date strings into ranges
  const grouped: LockedDateRange[] = []
  if (strings.length > 0) {
    const sorted = [...strings].sort()
    let rangeStart = sorted[0]
    let rangeEnd = sorted[0]

    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1])
      const curr = new Date(sorted[i])
      const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

      if (diffDays === 1) {
        // Consecutive day — extend the current range
        rangeEnd = sorted[i]
      } else {
        // Gap found — push current range and start new one
        grouped.push({ start: rangeStart, end: rangeEnd })
        rangeStart = sorted[i]
        rangeEnd = sorted[i]
      }
    }
    grouped.push({ start: rangeStart, end: rangeEnd })
  }

  return [...grouped, ...ranges]
}

export default function OvertimeLockModal({
  isOpen,
  onOpenChange,
  timesheetId
}: OvertimeLockModalProps) {
  const queryClient = useQueryClient()

  const [currentTimesheetId, setCurrentTimesheetId] = React.useState<number | null>(null)
  const [currentTimesheet, setCurrentTimesheet] = React.useState<any>(null)
  const [lockedDates, setLockedDates] = React.useState<LockedDateRange[]>([])
  const [isLocking, setIsLocking] = React.useState(false)
  const [isTogglingLock, setIsTogglingLock] = React.useState(false)

  const loadTimesheetData = useCallback(async () => {
    if (!timesheetId) return
    try {
      const response = await ngoaiGioAxios.getBangChamCongThang({ start: 0, length: 100 })
      const timesheets = response?.data?.data || []
      const found = timesheets.find((t: any) => String(t.id) === String(timesheetId))
      if (found) {
        setCurrentTimesheetId(found.id)
        setCurrentTimesheet(found)
        const raw: (string | LockedDateRange)[] = found.locked_dates
          ? JSON.parse(found.locked_dates)
          : []
        setLockedDates(normalizeLockedDates(raw))
      }
    } catch (error) {
      console.error('Error loading timesheet:', error)
    }
  }, [timesheetId])

  useEffect(() => {
    if (!isOpen) return
    if (!timesheetId) {
      toast('Vui lòng chọn bảng chấm công', { variant: 'danger' })
      return
    }
    loadTimesheetData()
  }, [isOpen, timesheetId])

  return (
    <Modal.Backdrop isDismissable={false} variant="opaque" isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container
        size="cover"
        placement="center"
        scroll="inside"
        className="max-w-[860px] w-full lg:h-auto!"
      >
        <Modal.Dialog className='p-0 overflow-hidden rounded-3xl bg-[#f8fafd] dark:bg-gray-900'>
          <Modal.Header className="px-6 py-5 bg-[#f8fafd] dark:bg-gray-900">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <Lock size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex items-center gap-2">
                  <Modal.Heading className="text-base font-medium text-[#202124] dark:text-gray-100">Quản lý khóa thời gian</Modal.Heading>
                  <Tooltip content="Kiểm soát đăng ký ngoài giờ theo bảng chấm công" placement="top" color="foreground">
                    <Info size={14} className="text-[#9aa0a6] cursor-help" />
                  </Tooltip>
                </div>
              </div>
              <ButtonV3
                isIconOnly
                size="sm"
                variant="ghost"
                className="text-[#5f6368] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                onPress={() => onOpenChange(false)}
                aria-label="Đóng"
              >
                <X size={20} />
              </ButtonV3>
            </div>
          </Modal.Header>

          <Modal.Body className="p-0 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] min-h-[460px]">
              {/* Left Panel */}
              <div className="p-6 border-b lg:border-b-0 border-gray-200/60 dark:border-gray-800 flex flex-col overflow-y-auto max-h-[80vh]">
                {currentTimesheet ? (
                  <div className="flex flex-col gap-5 flex-1">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#5f6368]" />
                      <span className="text-[13px] font-semibold text-[#202124] dark:text-gray-200">
                        Thông tin bảng chấm công
                      </span>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden">
                      <div className="flex flex-col gap-0 divide-y divide-gray-100 dark:divide-gray-700">
                        <div className="flex flex-col gap-0.5 px-4 py-3">
                          <span className="text-[11px] font-medium text-[#5f6368] dark:text-gray-500 uppercase tracking-wider">Tên bảng</span>
                          <span className="text-[14px] font-medium text-[#202124] dark:text-gray-100">{currentTimesheet.ten_bang}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 px-4 py-3">
                          <span className="text-[11px] font-medium text-[#5f6368] dark:text-gray-500 uppercase tracking-wider">Tháng</span>
                          <span className="text-[14px] font-medium text-[#202124] dark:text-gray-100">
                            {currentTimesheet.thang
                              ? currentTimesheet.thang.split('-').reverse().join('/')
                              : currentTimesheet.thang}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5 px-4 py-3">
                          <span className="text-[11px] font-medium text-[#5f6368] dark:text-gray-500 uppercase tracking-wider">Thời gian</span>
                          <span className="text-[14px] font-medium text-[#202124] dark:text-gray-100">
                            {new Date(currentTimesheet.ngay_bat_dau).toLocaleDateString('vi-VN')}
                            {' → '}
                            {new Date(currentTimesheet.ngay_ket_thuc).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5 px-4 py-3">
                          <span className="text-[11px] font-medium text-[#5f6368] dark:text-gray-500 uppercase tracking-wider">Trạng thái</span>
                          <div>
                            <ChipV3
                              variant="soft"
                              color={
                                currentTimesheet.trang_thai === 'KHOA'
                                  ? 'danger'
                                  : currentTimesheet.trang_thai === 'MO'
                                    ? 'success'
                                    : 'default'
                              }
                              size="sm"
                              className="w-fit"
                            >
                              {currentTimesheet.trang_thai === 'KHOA' ? 'Đã khóa' : 'Đang mở'}
                            </ChipV3>
                          </div>
                        </div>
                        {lockedDates.length > 0 && (
                          <div className="flex flex-col gap-0.5 px-4 py-3">
                            <span className="text-[11px] font-medium text-[#5f6368] dark:text-gray-500 uppercase tracking-wider">Khoảng khóa</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[14px] font-medium text-amber-700 dark:text-amber-300">
                                {lockedDates.length}{' '}
                                {lockedDates.every(r => r.start === r.end) ? 'ngày bị khóa' : 'khoảng thời gian bị khóa'}
                              </span>
                              <Popover>
                                <Popover.Trigger>
                                  <button
                                    className="flex items-center justify-center w-4 h-4 rounded-full text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors cursor-pointer"
                                    aria-label="Xem chi tiết các khoảng khóa"
                                  >
                                    <AlertCircle size={14} />
                                  </button>
                                </Popover.Trigger>
                                <Popover.Content placement="right" className="w-64">
                                  <Popover.Dialog>
                                    <Popover.Arrow />
                                    <Popover.Heading className="text-[12px] font-semibold text-[#202124] dark:text-gray-100 mb-2">
                                      Chi tiết khoảng bị khóa
                                    </Popover.Heading>
                                    <div className="flex flex-col gap-1.5">
                                      {lockedDates.map((range, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40"
                                        >
                                          <Lock size={11} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                          <span className="text-[12px] text-amber-800 dark:text-amber-300 font-medium">
                                            {formatISODate(range.start)}
                                            {' → '}
                                            {formatISODate(range.end)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </Popover.Dialog>
                                </Popover.Content>
                              </Popover>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div role="alert" className="flex items-start gap-2.5 px-3 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20">
                      <svg className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <p className="text-[12px] font-medium text-amber-800 dark:text-amber-300 leading-normal">
                        {currentTimesheet.trang_thai === 'KHOA'
                          ? 'Nhân viên không thể đăng ký ngoài giờ khi bảng bị khóa'
                          : 'Khóa bảng sẽ ngăn nhân viên đăng ký ngoài giờ'}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
                      <ButtonV3
                        variant={currentTimesheet.trang_thai === 'KHOA' ? 'outline' : 'danger'}
                        size="sm"
                        className="w-full font-medium flex items-center gap-2 justify-center text-[13px] rounded-lg"
                        isPending={isTogglingLock}
                        onPress={async () => {
                          if (!currentTimesheetId) return
                          setIsTogglingLock(true)
                          try {
                            const newStatus = currentTimesheet.trang_thai === 'KHOA' ? 'MO' : 'KHOA'
                            const response = await ngoaiGioAxios.khoaBangChamCong({
                              id: currentTimesheetId,
                              trang_thai: newStatus
                            })
                            if (response?.success) {
                              await loadTimesheetData()
                              queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGio'] })
                              queryClient.invalidateQueries({ queryKey: ['hrmBangChamCongThangMO'] })
                              toast(
                                newStatus === 'KHOA'
                                  ? 'Khóa bảng chấm công thành công'
                                  : 'Mở khóa bảng chấm công thành công',
                                { variant: 'success' }
                              )
                            } else {
                              toast(response?.message || 'Thao tác thất bại', { variant: 'danger' })
                            }
                          } catch (error) {
                            console.error('Error toggling lock:', error)
                            toast('Có lỗi xảy ra', { variant: 'danger' })
                          } finally {
                            setIsTogglingLock(false)
                          }
                        }}
                      >
                        {!isTogglingLock &&
                          (currentTimesheet.trang_thai === 'KHOA'
                            ? <Unlock size={15} />
                            : <Lock size={15} />
                          )}
                        <span>
                          {currentTimesheet.trang_thai === 'KHOA'
                            ? 'Mở khóa bảng chấm công'
                            : 'Khóa bảng chấm công'}
                        </span>
                      </ButtonV3>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center flex-1">
                    <span className="text-sm text-[#5f6368]">Đang tải thông tin...</span>
                  </div>
                )}
              </div>

              {/* Right Panel - Calendar */}
              <div className="p-5 bg-white dark:bg-gray-900 rounded-tl-4xl">
                <LockedRangeCalendar
                  lockedDates={lockedDates}
                  onLock={async (start, end) => {
                    if (!currentTimesheetId) {
                      toast('Không tìm thấy bảng chấm công', { variant: 'danger' })
                      return
                    }
                    setIsLocking(true)
                    try {
                      const response = await ngoaiGioAxios.lockDatesBangChamCong({
                        id: currentTimesheetId,
                        start_date: start,
                        end_date: end
                      })
                      if (response?.success) {
                        await loadTimesheetData()
                        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGio'] })
                        queryClient.invalidateQueries({ queryKey: ['hrmBangChamCongThangMO'] })
                        toast('Khóa khoảng thời gian thành công', { variant: 'success' })
                      } else {
                        toast(response?.message || 'Khóa thất bại', { variant: 'danger' })
                      }
                    } catch (error) {
                      console.error('Error locking dates:', error)
                      toast('Có lỗi xảy ra khi khóa', { variant: 'danger' })
                    } finally {
                      setIsLocking(false)
                    }
                  }}
                  onUnlock={async (index) => {
                    if (!currentTimesheetId) {
                      toast('Không tìm thấy bảng chấm công', { variant: 'danger' })
                      return
                    }
                    try {
                      const response = await ngoaiGioAxios.unlockDatesBangChamCong({
                        id: currentTimesheetId,
                        index
                      })
                      if (response?.success) {
                        await loadTimesheetData()
                        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGio'] })
                        queryClient.invalidateQueries({ queryKey: ['hrmBangChamCongThangMO'] })
                        toast('Mở khóa khoảng thời gian thành công', { variant: 'success' })
                      } else {
                        toast(response?.message || 'Mở khóa thất bại', { variant: 'danger' })
                      }
                    } catch (error) {
                      console.error('Error unlocking dates:', error)
                      toast('Có lỗi xảy ra khi mở khóa', { variant: 'danger' })
                    }
                  }}
                  isLocking={isLocking}
                  compact
                />
              </div>
            </div>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
