import { Modal, ModalContent, Button, Spinner } from '@heroui/react'
import { Download, X, FileText, Image as ImageIcon, FileCode, AlertCircle } from 'lucide-react'
import { getFileUrl } from '@renderer/utils/urlUtils'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { download } from '@renderer/utils/documents/userPreview'

interface FilePreviewModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  fileUrl: string | null
  fileName?: string
  extension?: string
}

export const FilePreviewModal = ({
  isOpen,
  onOpenChange,
  fileUrl,
  fileName = 'Tài liệu',
  extension: forcedExt
}: FilePreviewModalProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setHasError(false)
    }
  }, [isOpen, fileUrl])

  if (!fileUrl) return null

  const fullUrl = getFileUrl(fileUrl) || ''

  // Lấy extension: Ưu tiên forcedExt -> rồi đến fileName -> cuối cùng mới đến fileUrl
  const extension = (
    forcedExt ||
    (fileName && fileName.includes('.') ? fileName.split('.').pop() : '') ||
    (fileUrl && fileUrl.includes('.') ? fileUrl.split('.').pop() : '') ||
    ''
  ).toLowerCase()

  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)
  const isPdf = extension === 'pdf'
  const isOffice = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)

  const downloadFile = () => {
    const downloadName = extension ? `${fileName}.${extension}` : fileName
    download(fileUrl, downloadName)
  }

  const renderPreview = () => {
    if (isImage) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center p-4 md:p-12"
        >
          <img
            src={fullUrl}
            alt={fileName}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setHasError(true)
            }}
            className="max-w-full max-h-[85vh] object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-white cursor-default"
            onClick={(e) => e.stopPropagation()} // Chỉ khi nhấn vào ẢNH mới không đóng
          />
        </motion.div>
      )
    }

    if (isPdf || isOffice) {
      const viewerUrl = isPdf
        ? `${fullUrl}#toolbar=0`
        : `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fullUrl)}&embedded=true`
      return (
        <div
          className="w-full h-full max-w-5xlzz mx-auto shadow-2xl overflow-hidden bg-white md:mb-4 md:rounded-sm cursor-default"
          onClick={(e) => e.stopPropagation()} // Click vào khung nội dung PDF/Office thì không đóng
        >
          <iframe
            src={viewerUrl}
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-none"
            title={fileName}
          />
        </div>
      )
    }

    return (
      <div
        className="flex flex-col items-center justify-center gap-6 text-white p-12 cursor-default text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <FileCode size={80} strokeWidth={1} className="opacity-20 mx-auto" />
        <div className="space-y-2">
          <p className="font-medium text-lg text-white/90">
            Định dạng .{extension} không hỗ trợ xem trực tiếp
          </p>
          <p className="text-sm text-white/50">Vui lòng tải về máy để xem nội dung</p>
        </div>
        <Button
          variant="bordered"
          className="text-white border-white/20 hover:bg-white/10"
          startContent={<Download size={18} />}
          onPress={downloadFile}
        >
          Tải xuống
        </Button>
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="full"
      scrollBehavior="inside"
      hideCloseButton
      backdrop="opaque"
      motionProps={{
        variants: {
          enter: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
          exit: { opacity: 0, scale: 1.05, transition: { duration: 0.15, ease: 'easeIn' } }
        }
      }}
      classNames={{
        base: 'bg-transparent shadow-none p-0',
        wrapper: 'z-[10000] !p-0 !m-0',
        body: 'p-0 h-full overflow-hidden flex flex-col'
      }}
    >
      <ModalContent className="bg-transparent shadow-none border-none p-0 m-0 max-w-full h-full rounded-none">
        <div
          className="flex flex-col w-full h-full bg-zinc-800/70 cursor-pointer"
          onClick={() => onOpenChange(false)} // Lớp nền gạch đỏ bao phủ toàn bộ đóng Modal
        >
          {/* Header chuẩn Gmail */}
          <div className="flex items-center justify-between h-14 px-4 bg-black/90 z-50 flex-none text-white overflow-hidden">
            {/* Nhóm thông tin tệp - Click chữ và icon thì không đóng */}
            <div
              className="flex items-center gap-3 min-w-0 cursor-default py-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-none opacity-80">
                {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
              </div>
              <span className="text-sm font-medium truncate opacity-90 tracking-wide">
                {fileName}
              </span>
            </div>

            {/* Nhóm nút hành động - Click nút thì không đóng */}
            <div
              className="flex items-center gap-1 cursor-default py-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                isIconOnly
                variant="light"
                className="text-white/70 hover:text-white hover:bg-white/10"
                title="Tải xuống"
                onPress={downloadFile}
              >
                <Download size={20} />
              </Button>

              <div className="w-px h-6 bg-white/10 mx-2" />

              <Button
                isIconOnly
                variant="light"
                className="text-white/70 hover:text-white hover:bg-white/10"
                onPress={() => onOpenChange(false)}
                title="Đóng (Esc)"
              >
                <X size={24} />
              </Button>
            </div>
          </div>

          {/* Vùng nội dung chính */}
          <div className="relative flex-1 min-h-0 min-w-0 flex flex-col items-center justify-center overflow-auto custom-scrollbar-dark select-none">
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/20 backdrop-blur-sm"
                >
                  <Spinner size="md" color="white" />
                  <span className="text-[10px] text-white/40 uppercase tracking-[0.2em]">
                    Đang nạp dữ liệu...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tài liệu - Click tài liệu thì KHÔNG đóng thông qua renderPreview chặn sự kiện bên trên */}
            {hasError ? (
              <div
                className="text-center p-8 bg-[#222] border border-white/10 rounded-lg max-w-md shadow-2xl cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
                <h4 className="text-white font-bold mb-1 italic">Không thể nạp tài liệu</h4>
                <p className="text-xs text-white/40 mb-4">
                  Vui lòng kiểm tra kết nối hoặc đường dẫn tệp.
                </p>
                <Button
                  size="sm"
                  variant="flat"
                  className="text-white bg-white/10"
                  onClick={() => window.location.reload()}
                >
                  Thử lại
                </Button>
              </div>
            ) : (
              renderPreview()
            )}
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}
