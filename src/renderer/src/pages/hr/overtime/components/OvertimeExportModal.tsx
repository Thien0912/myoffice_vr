import React, { useState } from 'react'
import { Button as ButtonV3, Modal, toast } from '@heroui-v3/react'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import { Download, X } from 'lucide-react'

interface OvertimeExportModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  timesheetId?: string | number | null
  departments?: any[]
}

export default function OvertimeExportModal({
  isOpen,
  onOpenChange,
  timesheetId,
  departments = []
}: OvertimeExportModalProps) {
  const [exportDonVi, setExportDonVi] = useState<string>('-1')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!timesheetId) return
    setIsExporting(true)
    try {
      const response = await ngoaiGioAxios.exportExcel({
        id_bang_cham_cong: [Number(timesheetId)],
        id_don_vi: exportDonVi ? Number(exportDonVi) : -1
      })
      if (response?.success && response?.data?.file_path) {
        const a = document.createElement('a')
        a.href = response.data.file_path
        a.download = response.data.filename || 'ngoai-gio.xlsx'
        a.click()
        toast('Xuất báo cáo thành công', { variant: 'success' })
        onOpenChange(false)
      } else {
        toast(response?.message || 'Lỗi khi xuất báo cáo', { variant: 'danger' })
      }
    } catch {
      toast('Lỗi khi xuất báo cáo', { variant: 'danger' })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onOpenChange(false)
      }}
      variant="opaque"
      isDismissable={false}
    >
      <Modal.Container placement="center">
        <Modal.Dialog
          aria-label="Xuất Excel ngoài giờ"
          className="w-full max-w-md rounded-2xl p-0 bg-white shadow-2xl outline-none"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Download size={18} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">Xuất báo cáo Excel</h3>
                <p className="text-xs text-gray-500 mt-0.5">Chọn đơn vị cần xuất báo cáo</p>
              </div>
            </div>
            <ButtonV3
              isIconOnly
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:bg-gray-200 rounded-full h-8 w-8 min-w-0"
              onPress={() => onOpenChange(false)}
            >
              <X size={18} />
            </ButtonV3>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <SelectDropdown
                disablePortal
                label=""
                placeholder="Tất cả đơn vị"
                value={exportDonVi}
                onChange={(val) => setExportDonVi(val as string)}
                options={[{ value: '-1', label: 'Tất cả đơn vị' }, ...departments]}
              />
              <p className="text-xs text-gray-400 mt-1">
                Chọn &quot;Tất cả đơn vị&quot; để xuất báo cáo toàn bộ
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
            <ButtonV3
              variant="ghost"
              className="flex-1 py-2.5 text-gray-600 font-bold text-sm hover:bg-gray-200 rounded-xl"
              onPress={() => onOpenChange(false)}
            >
              Hủy
            </ButtonV3>
            <ButtonV3
              className="flex-2 py-2.5 px-4 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 shadow-md flex items-center justify-center gap-2"
              isDisabled={isExporting}
              onPress={handleExport}
            >
              {isExporting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download size={15} />
                  Xuất Excel
                </>
              )}
            </ButtonV3>
          </div>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
