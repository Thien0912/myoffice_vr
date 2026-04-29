import { useRef } from 'react'
import { Paperclip } from 'lucide-react'
import OfficeIcon from '@renderer/components/OfficeIcon'
import { Button } from '@heroui/react'
import { getFileUrl } from '@renderer/utils/urlUtils'
import MiddleTruncate from '@renderer/components/MiddleTruncate'
import { toast } from "@heroui-v3/react";

interface FileUploadSimpleProps {
  name: string
  currentFiles: File[]
  existingFiles?: any[]
  onFilesChange: (name: string, files: File[]) => void
  onRemoveExisting?: (fileId: string) => void
  accept?: string
  maxSize?: number // MB
}

export default function FileUploadSimple({
  name,
  currentFiles = [],
  existingFiles = [],
  onFilesChange,
  onRemoveExisting,
  accept = '*'
}: FileUploadSimpleProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      
      // Nếu có cấu hình accept, thực hiện kiểm tra extension
      if (accept && accept !== '*') {
        const allowedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase())
        const validFiles = selectedFiles.filter(file => {
          const extension = '.' + file.name.split('.').pop()?.toLowerCase()
          if (allowedExtensions.includes(extension)) {
            return true
          }
          
          toast('Hệ thống', { description: `Tệp ${file.name} không đúng định dạng cho phép.`, variant: 'danger' })
          return false
        })

        if (validFiles.length > 0) {
          onFilesChange(name, [...currentFiles, ...validFiles])
        }
      } else {
        onFilesChange(name, [...currentFiles, ...selectedFiles])
      }
      
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...currentFiles]
    newFiles.splice(index, 1)
    onFilesChange(name, newFiles)
  }

  const getFileIcon = (fileName: string) => {
    return <OfficeIcon name={fileName} size={24} />
  }

  const isImage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="text-[13px] font-bold text-gray-700 dark:text-gray-300">Tệp đính kèm:</span>
        <Button
          size="sm"
          variant="bordered"
          className="h-8 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[13px] font-medium px-4 rounded-md"
          startContent={<Paperclip size={14} />}
          onPress={() => inputRef.current?.click()}
        >
          Thêm tệp
        </Button>
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileSelect}
          multiple
          className="hidden"
          accept={accept}
        />
      </div>

      {/* Render existing files (from server) */}
      <div className="flex flex-col gap-4">
        {existingFiles.map((file, idx) => (
          <div key={`exist-${idx}`} className="flex flex-col gap-2 pl-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0 w-8">
                {getFileIcon(file.ten_file_goc)}
                <button
                  type="button"
                  onClick={() => onRemoveExisting?.(file.id_file_dinh_kem)}
                  className="text-[11px] text-red-500 hover:text-red-600 font-medium hover:underline mt-1"
                >
                  Xóa
                </button>
              </div>
              <div className="flex flex-col pt-0.5 min-w-0 flex-1">
                <a 
                  href={getFileUrl(file.duong_dan)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[14px] text-blue-600 hover:underline font-medium block overflow-hidden"
                >
                  <MiddleTruncate text={file.ten_file_goc} />
                </a>
              </div>
            </div>
            {isImage(file.ten_file_goc) && (
              <div className="ml-11 mt-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden w-fit shadow-sm bg-gray-50 dark:bg-gray-800">
                <img
                  src={getFileUrl(file.duong_dan)}
                  alt="Preview"
                  className="max-h-[160px] object-contain"
                />
              </div>
            )}
          </div>
        ))}

        {/* Render new files (local) */}
        {currentFiles.map((file, index) => (
          <div key={`new-${index}`} className="flex flex-col gap-2 pl-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0 w-8">
                {getFileIcon(file.name)}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-[11px] text-red-500 hover:text-red-600 font-medium hover:underline mt-1"
                >
                  Xóa
                </button>
              </div>
              <div className="flex flex-col pt-0.5 min-w-0 flex-1">
                <span className="text-[14px] text-blue-600 hover:underline font-medium block overflow-hidden cursor-default">
                  <MiddleTruncate text={file.name} />
                </span>
              </div>
            </div>

            {isImage(file.name) && (
              <div className="ml-11 mt-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden w-fit shadow-sm bg-gray-50 dark:bg-gray-800">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="max-h-[160px] object-contain"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
