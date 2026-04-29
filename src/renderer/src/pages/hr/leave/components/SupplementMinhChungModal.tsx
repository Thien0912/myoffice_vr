import { Modal, Button } from '@heroui-v3/react'
import { useState } from 'react'
import { FileText, CheckCircle2 } from 'lucide-react'
import FileUploadBox from '@renderer/pages/document/components/form/FileUploadBox'
import { LeaveRequest } from '../mockData'

interface SupplementMinhChungModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  row: LeaveRequest | null
  onSuccess: (uuid: string, file: File) => void
  isLoading: boolean
}

export default function SupplementMinhChungModal({
  isOpen,
  onOpenChange,
  row,
  onSuccess,
  isLoading
}: SupplementMinhChungModalProps) {
  const [file, setFile] = useState<File | null>(null)

  const handleUpload = () => {
    if (row?.uuid_nghi_phep && file) {
      onSuccess(row.uuid_nghi_phep, file)
    }
  }

  const handleClose = () => {
    setFile(null)
    onOpenChange(false)
  }

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { onOpenChange(open); if(!open) handleClose(); }}>
        <Modal.Container size="md">
          <Modal.Dialog className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <Modal.CloseTrigger />
            <Modal.Header className="flex flex-col gap-1 border-b border-gray-100 dark:border-gray-700 pb-4">
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <FileText className="text-blue-600" size={20} />
                Bổ sung minh chứng
              </span>
              <p className="text-xs font-normal text-gray-500 uppercase tracking-wider">
                Đơn #{row?.uuid_nghi_phep}
              </p>
            </Modal.Header>
            <Modal.Body className="py-6">
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/50">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                 Bạn có thể tải lên minh chứng bổ sung cho đơn nghỉ phép này (ví dụ: Giấy khám chữa bệnh, giấy mời...).
              </p>
            </div>

            <FileUploadBox
              name="minh_chung"
              label="Chọn hình ảnh minh chứng (JPG, PNG...)"
              maxFiles={1}
              accept="image/*"
              onFilesChange={(_, files) => setFile(files[0] || null)}
            />
          </div>
            </Modal.Body>
            <Modal.Footer className="border-t border-gray-100 dark:border-gray-700 pt-4 pb-4">
              <Button
                variant="ghost"
                onPress={handleClose}
                className="font-bold text-gray-600 dark:text-gray-300"
              >
                HỦY BỎ
              </Button>
              <Button
                variant="primary"
                className="font-bold bg-blue-600 shadow-lg shadow-blue-500/20 px-8 flex items-center gap-2"
                isDisabled={!file}
                isPending={isLoading}
                onPress={handleUpload}
              >
                {!isLoading && <CheckCircle2 size={18} />}
                CẬP NHẬT
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
