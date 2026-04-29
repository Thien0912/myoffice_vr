import { Button, Modal, cn } from '@heroui-v3/react'
import { useState, useRef, useEffect } from 'react'
import { Upload, Download, FileSpreadsheet, X } from 'lucide-react'

interface ImportNghiPhepModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (file: File) => void
  onDownloadTemplate: () => void
  isImporting?: boolean
  isDownloadingTemplate?: boolean
}

export default function ImportNghiPhepModal({
  isOpen,
  onClose,
  onImport,
  onDownloadTemplate,
  isImporting = false,
  isDownloadingTemplate = false
}: ImportNghiPhepModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset file khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
      if (!validTypes.includes(file.type)) {
        alert('Vui lòng chọn file Excel (.xls, .xlsx)')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile)
    }
  }

  const handleClose = () => {
    handleRemoveFile()
    onClose()
  }

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { if(!open) handleClose() }}>
        <Modal.Container size="md" scroll="inside">
          <Modal.Dialog className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-2xl transition-all duration-300 rounded-2xl">
            <Modal.Header className="flex flex-row justify-between items-center py-4 px-6 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
              <div className="flex flex-col gap-1 w-full">
                <Modal.Heading className="text-lg font-medium text-gray-800 dark:text-gray-100">
                  Nhập dữ liệu nghỉ phép
                </Modal.Heading>
                <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  Tải lên file Excel để import danh sách nghỉ phép
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                onPress={handleClose}
                isDisabled={isImporting}
              >
                <X size={18} />
              </Button>
            </Modal.Header>
            <Modal.Body className="p-6">
          <div className="space-y-4">
            {/* Download Template Button */}
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="text-blue-600 dark:text-blue-400" size={20} />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Chưa có file mẫu?
                </span>
              </div>
              <Button
                size="sm"
                variant="primary"
                onPress={onDownloadTemplate}
                isPending={isDownloadingTemplate}
                className="font-medium flex items-center gap-2 justify-center"
              >
                <Download size={16} />
                Tải file mẫu
              </Button>
            </div>

            {/* File Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Chọn file Excel <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                  selectedFile
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {selectedFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                        <FileSpreadsheet className="text-green-600 dark:text-green-400" size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      className="text-danger hover:bg-danger/10"
                      onPress={handleRemoveFile}
                    >
                      <X size={18} />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        Nhấp để chọn file
                      </span>{' '}
                      hoặc kéo thả vào đây
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Chỉ hỗ trợ file .xls, .xlsx
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                Lưu ý khi import:
              </h4>
              <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1 list-disc list-inside">
                <li>Các cột có dấu (*) là bắt buộc</li>
                <li>Định dạng ngày: dd/mm/yyyy (ví dụ: 01/03/2026)</li>
                <li>Buổi nghỉ: <strong>Sáng</strong>, <strong>Chiều</strong>, <strong>Cả ngày</strong> (có dấu tiếng Việt)</li>
                <li>Loại phép: có thể nhập tên (VD: Phép năm, Phép ốm) hoặc mã (VD: PHEP_NAM)</li>
                <li>Trạng thái: <strong>Chờ duyệt</strong>, <strong>Đã duyệt</strong>, <strong>Từ chối</strong></li>
                <li>Mã nhân viên phải tồn tại trong hệ thống</li>
              </ul>
            </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="py-4 px-6 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
            <Button 
              variant="outline" 
              onPress={handleClose} 
              isDisabled={isImporting}
              className="h-11 px-6"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onPress={handleImport}
              isPending={isImporting}
              isDisabled={!selectedFile}
              className="font-bold h-11 px-10 shadow-lg shadow-blue-500/20 flex items-center gap-2 justify-center"
            >
              <Upload size={18} />
              NHẬP DỮ LIỆU
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  </Modal>
  )
}
