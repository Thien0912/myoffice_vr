// FileUploadBox.tsx
import { useState, useRef, useEffect } from 'react'
import { Upload, X } from 'lucide-react'

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
}

export default function FileUploadBox({
  name,
  label = 'Kéo & thả hoặc chọn file',
  maxFiles = 99,
  onFilesChange,
  existingFiles = []
}: FileUploadBoxProps) {
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync existingFiles → internal state when switching between items
  useEffect(() => {
    if (existingFiles.length === 0) {
      // Item has no existing files — reset to empty
      setFiles([])
      onFilesChange?.(name, [])
      return
    }

    const oldFilesAsFile = existingFiles.map((f) => {
      const size = f.size || 0
      const blob = new Blob([new ArrayBuffer(size)], { type: f.type || 'application/octet-stream' })
      return new File([blob], f.name)
    })

    // Replace entirely — do NOT append to avoid stale files from previous item
    const updated = oldFilesAsFile.slice(0, maxFiles)
    setFiles(updated)
    onFilesChange?.(name, updated)
  }, [existingFiles])

  const pushFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const arr = Array.from(newFiles)
    // giữ tất cả file (append)
    const updated = [...files, ...arr].slice(0, maxFiles)
    setFiles(updated)
    onFilesChange?.(name, updated)
    // reset input so selecting same file again works
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
    <div
      className="border-2 border-dashed border-gray-300 rounded-md p-4 bg-white"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div
        className="flex items-center justify-center gap-2 cursor-pointer text-gray-600"
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={18} />
        <div className="text-sm">{label}</div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => pushFiles(e.target.files)}
      />

      {files.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-gray-600 mb-2">File đã chọn ({files.length})</div>
          <ul className="space-y-2">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="truncate max-w-[70%]">{f.name}</div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-400">{(f.size / 1024).toFixed(1)} KB</div>
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
