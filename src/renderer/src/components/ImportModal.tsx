import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { FileDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import FileUploadBox from '@renderer/pages/document/components/form/FileUploadBox'

interface ImportModalProps {
  isOpenImport: boolean
  onCloseImport: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | undefined
  FileImportVanBan?: string
  importFile: File | null
  setImportFile: (file: File | null) => void
  onConfirm: () => void
}

export default function ImportModal({
  isOpenImport,
  onCloseImport,
  FileImportVanBan,
  importFile,
  setImportFile,
  onConfirm
}: ImportModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // Auto focus on confirm button when modal opens
  useEffect(() => {
    if (isOpenImport) {
      setTimeout(() => {
        confirmButtonRef.current?.focus()
      }, 100)
    }
  }, [isOpenImport])

  return (
    <Modal isOpen={isOpenImport} onClose={() => {
      onCloseImport()
      setImportFile(null)
    }}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Nhập Excel</ModalHeader>
        <ModalBody>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Chọn file excel mẫu để nhập liệu</span>
            <a
              href={FileImportVanBan}
              download="MauNhapVanBanDi.xlsx"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <FileDown size={14} /> Tải file mẫu
            </a>
          </div>
          <FileUploadBox
            name="import_file"
            label="Chọn file excel để nhập"
            maxFiles={1}
            onFilesChange={(_, files) => setImportFile(files[0] || null)}
            currentFiles={importFile ? [importFile] : []}
            accept=".xlsx, .xls"
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={() => {
            onCloseImport()
            setImportFile(null)
          }}>
            Hủy
          </Button>
          <Button color="primary" onPress={onConfirm} isDisabled={!importFile}>
            Xác nhận
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
