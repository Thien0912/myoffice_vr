import { Button, cn, Modal, Tooltip } from '@heroui-v3/react'
import { HelpCircle, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from '@heroui-v3/react'

interface CategoryModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  children: React.ReactNode
  handleSubmitApi?: (id?: string | number, data?: FormData) => Promise<any>
  formData?: Record<string, any>
  fileGroups?: Record<string, File[]>
  idSubmitApi?: string | number
  onSubmitSuccess?: (data?: any) => void
}

export function CategoryModal({
  isOpen,
  onOpenChange,
  title,
  subtitle,
  children,
  handleSubmitApi,
  formData,
  fileGroups = {},
  idSubmitApi,
  onSubmitSuccess
}: CategoryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!handleSubmitApi) return

    setIsSubmitting(true)
    const form = e.currentTarget as HTMLFormElement
    const fd = new FormData(form)

    Object.entries(fileGroups).forEach(([fieldName, files]) => {
      files.forEach((f) => fd.append(fieldName, f))
    })

    Object.entries(formData ?? {}).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value === null) {
          fd.append(key, '')
        } else if (Array.isArray(value) || typeof value === 'object') {
          fd.append(key, JSON.stringify(value))
        } else {
          fd.append(key, String(value))
        }
      }
    })

    try {
      const response = await handleSubmitApi(idSubmitApi, fd)
      if (response.success) {
        onOpenChange(false)
        toast('Thành công', {
          description: response.message || 'Dữ liệu đã được lưu thành công.',
          variant: 'success'
        })
        onSubmitSuccess?.(response)
      } else {
        const errorMessage = response.error
          ? Object.values(response.error).flat().join(',')
          : response.message || 'Gửi dữ liệu thất bại. Vui lòng thử lại.'
        toast('Lỗi', {
          description: errorMessage,
          variant: 'danger',
          timeout: 5000
        })
      }
    } catch (err) {
      toast('Lỗi', { description: 'Gửi dữ liệu thất bại. Lỗi ngoại lệ.', variant: 'danger' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container
        size="lg"
        placement="auto"
        scroll="inside"
        className="max-w-2xl! w-full"
      >
        <Modal.Dialog
          className={cn(
            'rounded-3xl! overflow-hidden shadow-[0_24px_48px_-12px_rgba(25,28,29,0.15)]',
            'p-0'
          )}
        >
          <Modal.Header className="px-7 py-5! border-b-0">
            <div className="flex w-full items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5 w-full">
                <div className="flex items-center gap-1.5">
                  <Modal.Heading className="text-xl! font-bold tracking-tight">
                    {title}
                  </Modal.Heading>
                  {subtitle && (
                    <Tooltip delay={0}>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-700 rounded-full h-7 w-7 min-w-7"
                      >
                        <HelpCircle size={16} />
                      </Button>
                      <Tooltip.Content className="max-w-xs whitespace-normal">
                        {subtitle}
                      </Tooltip.Content>
                    </Tooltip>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full h-9 w-9 min-w-9"
                    onPress={() => onOpenChange(false)}
                  >
                    <X size={18} />
                  </Button>
                  <Tooltip.Content>Đóng</Tooltip.Content>
                </Tooltip>
              </div>
            </div>
          </Modal.Header>

          <form onSubmit={handleSubmit} encType="multipart/form-data" autoComplete="off">
            <Modal.Body className="py-2 px-7!">
              {children}
            </Modal.Body>

            <Modal.Footer className="px-6 py-4! border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-end w-full gap-3">
                <Button
                  variant="ghost"
                  className="px-5 font-semibold text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl h-10"
                  onPress={() => onOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="px-6 font-semibold text-sm bg-linear-to-br from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg rounded-xl h-10 transition-all active:scale-[0.97]"
                  isPending={isSubmitting}
                >
                  Lưu
                </Button>
              </div>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
