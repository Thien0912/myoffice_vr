import { Button, Modal, Spinner } from '@heroui-v3/react'
import { useEffect, useRef } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'cover'
  onConfirm: () => void
  title?: string
  content?: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
  isLoading?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  size = 'sm',
  onConfirm,
  title = 'Xác nhận',
  content = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Đồng ý',
  cancelText = 'Hủy',
  isDanger = false,
  isLoading = false
}: ConfirmModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // Auto focus on confirm button when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        confirmButtonRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="z-[10000]"
    >
      <Modal.Container placement="center" className="flex items-center justify-center h-full sm:items-center">
        <Modal.Dialog className={`${
            size === 'full' ? 'max-w-full' : 
            size === 'cover' ? 'w-screen h-screen max-w-none m-0' : 
            `max-w-${size}`
        } w-full m-4`}>
          <Modal.Header className="flex flex-col gap-1">
            <Modal.Heading>{title}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <div className="whitespace-pre-line">{content}</div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onPress={onClose}>
              {cancelText}
            </Button>
            <Button
              ref={confirmButtonRef}
              className={isDanger ? 'bg-danger text-white' : 'bg-primary text-white'}
              onPress={onConfirm}
              isDisabled={isLoading}
            >
              {isLoading && <Spinner size="sm" color="current" />}
              {confirmText}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
