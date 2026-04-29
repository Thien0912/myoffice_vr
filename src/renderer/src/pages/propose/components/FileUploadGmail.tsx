import { useRef, useState, useEffect } from 'react'
import { Progress } from '@heroui/react'
import { Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react'
import OfficeIcon from '@renderer/components/OfficeIcon'
import { toast } from "@heroui-v3/react";

interface FileUploadGmailProps {
  name: string
  currentFiles: File[]
  onFilesChange: (name: string, files: File[]) => void
  accept?: string
  maxSize?: number // MB
  hideList?: boolean
}

export default function FileUploadGmail({
  name,
  currentFiles = [],
  onFilesChange,
  accept = '*',
  maxSize = 25, // 25MB standard
  hideList = false
}: FileUploadGmailProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  // State giả lập tiến trình upload cho UX giống Gmail
  const [uploadingFiles, setUploadingFiles] = useState<{id: string, file: File, progress: number, status: 'uploading' | 'done' | 'error'}[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      
      // Validate size and duplicates
      const validFiles = newFiles.filter(file => {
        // Check size
        if (file.size > maxSize * 1024 * 1024) {
          toast('Lỗi', { description: `File ${file.name} vượt quá dung lượng cho phép (${maxSize}MB)`, variant: 'danger' })
          return false
        }

        // Check duplicate
        const isDuplicate = currentFiles.some(cf => cf.name === file.name && cf.size === file.size) || 
                            uploadingFiles.some(uf => uf.file.name === file.name && uf.file.size === file.size)
        
        if (isDuplicate) {
            toast('Trùng lặp', { description: `File ${file.name} đã có trong danh sách.`, variant: 'warning' })
            return false
        }

        return true
      })

      if (validFiles.length === 0) return

      // Add to uploading queue first
      const newUploads = validFiles.map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: 'uploading' as const
      }))
      
      setUploadingFiles(prev => [...prev, ...newUploads])

      // Reset input
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  // Effect để giả lập upload progress
  useEffect(() => {
    if (uploadingFiles.length === 0) return

    const timers: NodeJS.Timeout[] = []

    uploadingFiles.forEach(item => {
      if (item.status === 'uploading') {
        const timer = setInterval(() => {
          setUploadingFiles(prev => prev.map(p => {
            if (p.id === item.id) {
               const newProgress = p.progress + Math.random() * 30
               if (newProgress >= 100) {
                 clearInterval(timer)
                 return { ...p, progress: 100, status: 'done' }
               }
               return { ...p, progress: newProgress }
            }
            return p
          }))
        }, 200)
        timers.push(timer)
      }
    })

    return () => timers.forEach(t => clearInterval(t))
  }, [uploadingFiles.length]) // trigger only on length change to start new files

  // Effect để sync 'done' files sang parent component
  useEffect(() => {
     const doneFiles = uploadingFiles.filter(f => f.status === 'done')
     if (doneFiles.length > 0) {
         // Check if these files are already in currentFiles to avoid loop/duplication
         const newDoneFiles = doneFiles.filter(df => !currentFiles.some(cf => cf.name === df.file.name && cf.size === df.file.size))
         
         if (newDoneFiles.length > 0) {
             const filesToAdd = newDoneFiles.map(f => f.file)
             onFilesChange(name, [...currentFiles, ...filesToAdd])
             
             // Remove from uploading queue after added
             setUploadingFiles(prev => prev.filter(p => !newDoneFiles.some(nf => nf.id === p.id)))
         }
     }
  }, [uploadingFiles, currentFiles, name, onFilesChange])


  const removeFile = (index: number) => {
    const newFiles = [...currentFiles]
    newFiles.splice(index, 1)
    onFilesChange(name, newFiles)
  }

  const cancelUpload = (id: string) => {
      setUploadingFiles(prev => prev.filter(p => p.id !== id))
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
      const ext = fileName.split('.').pop()?.toLowerCase() || ''
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <ImageIcon size={20} className="text-purple-500" />
      if (['pdf'].includes(ext)) return <FileText size={20} className="text-red-500" />
      if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return <OfficeIcon name={`file.${ext}`} size={20} />
      return <FileText size={20} className="text-gray-500" />
  }

  return (
    <div className="w-full">
        {/* Upload Button - Gmail Style */}
        <div 
            className="cursor-pointer inline-flex items-center gap-2 px-1 py-1 rounded hover:bg-gray-100 transition-colors group"
            onClick={() => inputRef.current?.click()}
        >
             <div className="p-1.5 rounded-full border border-gray-300 group-hover:bg-white transition-colors">
                <Paperclip size={18} className="text-gray-600" />
             </div>
             <div className="flex flex-col">
                 <span className="text-[13px] font-medium text-gray-700 group-hover:text-blue-600">Đính kèm tệp</span>
                 <span className="text-[10px] text-gray-400">Tối đa {maxSize}MB</span>
             </div>
        </div>
        
        <input
            type="file"
            ref={inputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
            accept={accept}
        />

        {/* Uploading List form Queue */}
        {uploadingFiles.length > 0 && (
            <div className="mt-3 space-y-2">
                {uploadingFiles.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                        {getFileIcon(item.file.name)}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-1">
                                <span className="text-[13px] font-medium truncate">{item.file.name}</span>
                                <span className="text-[11px] text-gray-500">{formatSize(item.file.size)}</span>
                            </div>
                            <Progress 
                                size="sm" 
                                value={item.progress} 
                                color={item.status === 'error' ? "danger" : "primary"}
                                className="max-w-full" 
                            />
                        </div>
                        <button type="button" onClick={() => cancelUpload(item.id)} className="text-gray-400 hover:text-red-500">
                             <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        )}

        {/* Current Files List */}
        {!hideList && currentFiles.length > 0 && (
            <div className="mt-3 flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                {currentFiles.map((file, index) => (
                    <div 
                        key={index} 
                        className="group flex items-center justify-between gap-3 p-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm rounded-xl transition-all cursor-default w-full"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                             {/* Icon Box */}
                            <div className="w-9 h-9 flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-white transition-colors border border-gray-100 shrink-0">
                                {getFileIcon(file.name)}
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col">
                                <span className="text-[13px] font-medium text-gray-700 truncate group-hover:text-blue-700">{file.name}</span>
                                <span className="text-[11px] text-gray-400">{formatSize(file.size)}</span>
                            </div>
                        </div>

                        {/* Remove Button */}
                        <button 
                            type="button"
                            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            onClick={() => removeFile(index)}
                            title="Xóa tệp"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
  )
}
