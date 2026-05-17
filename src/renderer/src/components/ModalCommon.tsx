import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { X } from 'lucide-react'
import { toast } from '@heroui-v3/react'

type ModalCommonProps = {
  open?: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children?: React.ReactNode
  handleSubmitApi?: (id?: string | number, data?: FormData) => Promise<any>
  formData?: Record<string, any>
  fileGroups?: Record<string, File[]>
  idSubmitApi?: string | number
  onSubmitSuccess?: (data?: any) => void
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function ModalCommon({
  title = '',
  subtitle = '',
  open = true,
  onClose,
  children,
  handleSubmitApi,
  formData,
  fileGroups = {},
  idSubmitApi,
  onSubmitSuccess,
  size = 'lg'
}: ModalCommonProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const fd = new FormData(form)

    Object.entries(fileGroups).forEach(([fieldName, files]) => {
      files.forEach((f) => fd.append(fieldName, f))
    })

    Object.entries(formData ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value) || typeof value === 'object') {
          fd.append(key, JSON.stringify(value))
        } else {
          fd.append(key, String(value))
        }
      }
    })

    try {
      if (handleSubmitApi) {
        const response = await handleSubmitApi(idSubmitApi, fd)
        if (response.success) {
          onClose()
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
      }
    } catch (err) {
      toast('Lỗi', { description: 'Gửi dữ liệu thất bại. Lỗi ngoại lệ.', variant: 'danger' })
    }
  }

  return (
    <Modal
      isOpen={open}
      onOpenChange={(isOpen) => { if (!isOpen) onClose() }}
      size={size}
      classNames={{
        wrapper: 'z-[9999]',
      }}
      hideCloseButton
      scrollBehavior="inside"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex flex-col gap-0.5">
                <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {title}
                </span>
                {subtitle && (
                  <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
              <Button
                isIconOnly
                variant="light"
                radius="full"
                size="sm"
                onPress={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </Button>
            </ModalHeader>

            <ModalBody className="px-6 py-6">
              {children}
            </ModalBody>

            <form onSubmit={handleSubmit} encType="multipart/form-data" autoComplete="off">
              <ModalFooter className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                <Button
                  variant="light"
                  radius="lg"
                  className="font-semibold text-gray-600 dark:text-gray-300"
                  onPress={onClose}
                >
                  Hủy
                </Button>
                <Button
                  color="primary"
                  radius="lg"
                  type="submit"
                  className="font-semibold shadow-lg shadow-blue-500/20"
                >
                  Lưu
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
