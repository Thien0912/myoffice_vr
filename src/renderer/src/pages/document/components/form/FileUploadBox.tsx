// FileUploadBox.tsx
import { useState, useRef, useEffect } from 'react'
import { CloudUpload, Trash2 } from 'lucide-react'
import OfficeIcon from '@renderer/components/OfficeIcon'

type ExistingFile = {
  id: number
  name: string
  size: number
  url: string
  type?: string
}

type FileUploadBoxProps = {
  name: string
  label?: string
  maxFiles?: number
  onFilesChange?: (name: string, files: File[]) => void
  existingFiles?: ExistingFile[]
  currentFiles?: File[]
  accept?: string
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function FileUploadBox({
  name,
  label = 'Kéo & thả hoặc chọn file',
  maxFiles = 99,
  onFilesChange,
  existingFiles = [],
  currentFiles,
  accept = '.doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg'
}: FileUploadBoxProps) {
  const [files, setFiles] = useState<File[]>(currentFiles || [])
  const inputRef = useRef<HTMLInputElement>(null)

  // Load file cũ vào state files khi mount
  useEffect(() => {
    if (currentFiles !== undefined) {
      return
    }

    if (existingFiles.length === 0) return

    const oldFilesAsFile = existingFiles.map((f) => {
      const size = f.size || 0
      const blob = new Blob([new ArrayBuffer(size)], { type: f.type || 'application/octet-stream' })
      const file = new File([blob], f.name)
      return file
    })

    const updated = [...oldFilesAsFile, ...files].slice(0, maxFiles)
    setFiles(updated)
    onFilesChange?.(name, updated)
  }, [existingFiles])

  const pushFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const arr = Array.from(newFiles)
    const updated = [...files, ...arr].slice(0, maxFiles)
    setFiles(updated)
    onFilesChange?.(name, updated)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    pushFiles(e.dataTransfer.files)
  }

  const removeAt = (index: number) => {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    onFilesChange?.(name, updated)
  }

  return (
    <div className="w-full">
      {label && <div className="mb-1 text-xs md:text-sm">{label}</div>}
      <div
        className="group relative border-2 border-dashed border-gray-200 bg-slate-50/50 rounded-xl p-4 md:p-6
                   flex flex-col items-center justify-center text-center cursor-pointer
                   hover:bg-blue-50/30 hover:border-blue-400 transition-all duration-300 ease-in-out"
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">
          <CloudUpload className="text-blue-500 w-5 h-5 md:w-8 md:h-8" />
        </div>

        <div className="text-xs text-gray-700 mb-1 group-hover:text-blue-600 transition-colors">
          Nhấn để tải lên hoặc kéo thả tệp vào đây
        </div>
        <div className="text-[8px] text-gray-400 font-medium">
          {accept === '.doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg' ? 'DOC, DOCX, PDF, XLS, PNG, JPG, JPEG (Tối đa 25MB)' : 'Tối đa 25MB'}
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => pushFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center p-1 border border-gray-200 rounded-lg bg-white hover:shadow-am transition-shadow duration-200"
            >
              {/* File Icon Badge */}
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 mr-3 md:mr-4">
                <OfficeIcon name={f.name} size={28} />
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0 flex flex-col items-start overflow-hidden">
                <span className="text-xs truncate w-full text-left" title={f.name}>
                  {f.name}
                </span>
                <span className="text-[10px] text-blue-500 font-medium mt-0.5">
                  {formatFileSize(f.size)}
                </span>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeAt(i)
                }}
                className="p-2 ml-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title="Xóa file"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
