import React, { useEffect, useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from '@heroui/react'
import { AlignLeft, Clock, NotebookPen, X } from 'lucide-react'
import { GoogleTimePicker } from './CustomCalendarView'
import moment from 'moment'
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import { toast } from '@heroui-v3/react'

interface OvertimeQuickEditModalProps {
  isOpen: boolean
  onClose: () => void
  requestData: any
  onSaveSuccess: () => void
}

export const OvertimeQuickEditModal: React.FC<OvertimeQuickEditModalProps> = ({
  isOpen,
  onClose,
  requestData,
  onSaveSuccess,
}) => {
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen && requestData) {
      setStartTime(requestData.gio_bat_dau?.slice(0, 5) || '17:30')
      setEndTime(requestData.gio_ket_thuc?.slice(0, 5) || '19:00')
      setReason(requestData.noi_dung || '')
      setDetails(requestData.chi_tiet || '')
    }
  }, [isOpen, requestData])

  const getDurationHours = (start: string, end: string) => {
    const [sH, sM] = start.split(':').map(Number)
    const [eH, eM] = end.split(':').map(Number)
    let diff = (eH * 60 + eM) - (sH * 60 + sM)
    if (diff < 0) diff += 1440
    return diff / 60
  }

  const handleSave = async () => {
    if (!requestData?.id_ngoai_gio) return

    const duration = getDurationHours(startTime, endTime)
    if (duration <= 0) {
      toast('Lỗi thời gian', { description: 'Thời gian kết thúc phải sau thời gian bắt đầu', variant: 'danger' })
      return
    }

    try {
      setIsSaving(true)
      const res = await ngoaiGioAxios.update({
        id_ngoai_gio: requestData.id_ngoai_gio,
        gio_bat_dau: startTime,
        gio_ket_thuc: endTime,
        noi_dung: reason,
        chi_tiet: details,
        so_gio: duration
      })

      if (res.success) {
        toast('Thành công', { description: 'Cập nhật thành công', variant: 'success' })
        onSaveSuccess()
        onClose()
      } else {
        toast('Lỗi', { description: res.message || 'Cập nhật thất bại', variant: 'danger' })
      }
    } catch (error: any) {
      toast('Lỗi', { description: error?.response?.data?.message || 'Có lỗi xảy ra', variant: 'danger' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      isDismissable={false}
      isKeyboardDismissDisabled={false}
      placement="bottom-center"
      backdrop="blur"
      hideCloseButton
      classNames={{
        base: 'm-0 sm:m-4 rounded-t-[24px] sm:rounded-2xl max-w-lg',
        wrapper: 'items-end sm:items-center'
      }}
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <span className="text-lg font-bold">Chỉnh sửa đăng ký</span>
          <Button
            isIconOnly
            variant="light"
            radius="full"
            size="sm"
            onPress={onClose}
            className="text-gray-500"
          >
            <X size={20} />
          </Button>
        </ModalHeader>
        <ModalBody className="px-6 py-6 space-y-6">
          {/* Reason Input */}
          <div className="flex items-start gap-4 group">
            <div className="mt-1.5 text-gray-400 group-focus-within:text-blue-500 transition-colors shrink-0">
              <AlignLeft size={22} />
            </div>
            <div className="flex-1">
              <textarea
                autoFocus
                className="w-full text-xl font-medium py-1 border-b-2 border-gray-100 dark:border-gray-800 outline-none focus:border-blue-500 transition-all placeholder-gray-300 bg-transparent resize-none overflow-hidden"
                placeholder="Thêm tiêu đề..."
                rows={1}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
              />
            </div>
          </div>

          {/* Time Selection */}
          <div className="flex items-center gap-4">
            <div className="text-gray-400 shrink-0">
              <Clock size={22} />
            </div>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
              <GoogleTimePicker
                value={startTime}
                onChange={(v) => {
                  setStartTime(v)
                  // Auto push end time if needed
                  if (v >= endTime) {
                    const [h, m] = v.split(':').map(Number)
                    setEndTime(`${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
                  }
                }}
              />
              <span className="text-gray-300">—</span>
              <GoogleTimePicker
                value={endTime}
                minTime={startTime}
                onChange={(v) => setEndTime(v)}
              />
              <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg ml-1">
                {getDurationHours(startTime, endTime).toFixed(1)}h
              </span>
            </div>
          </div>

          {/* Detailed Content */}
          <div className="flex items-start gap-4 group">
            <div className="mt-2 text-gray-400 group-focus-within:text-blue-500 transition-colors shrink-0">
              <NotebookPen size={22} />
            </div>
            <div className="flex-1">
              <textarea
                className="w-full min-h-[80px] p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
                placeholder="Giải trình chi tiết (nếu có)..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="light"
            radius="lg"
            className="font-bold text-gray-500"
            onPress={onClose}
          >
            Hủy
          </Button>
          <Button
            color="primary"
            radius="lg"
            className="px-8 font-bold shadow-lg shadow-blue-500/20"
            onPress={handleSave}
            isLoading={isSaving}
          >
            Lưu thay đổi
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
