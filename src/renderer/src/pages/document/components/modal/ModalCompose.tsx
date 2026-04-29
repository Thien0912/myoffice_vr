import { Button, Spinner, toast } from '@heroui-v3/react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import DraggableModal from '@renderer/components/DraggableModal'
import { useState } from 'react'

type ModalComposeProps = {
    title?: string
    isOpenCompose: boolean
    onClose: () => void
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full' | 'cover'
    children?: React.ReactNode
    fileGroups?: Record<string, File[]>
    formData?: Record<string, any>
    idSubmitApi?: string | number // ✅ optional id
    onSubmitSuccess?: (data?: any) => void
    handleSubmitApi?: (id?: string | number, data?: FormData) => Promise<any>
    footerContent?: React.ReactNode
    isLoading?: boolean
    onMinimize?: () => void
}

export default function ModalCompose({
    title = 'Modal',
    isOpenCompose,
    onClose,
    size = 'xl',
    children,
    fileGroups = {},
    formData,
    idSubmitApi, // ✅ nhận id
    onSubmitSuccess,
    handleSubmitApi,
    footerContent,
    isLoading = false,
    onMinimize,
    ...props
}: ModalComposeProps) {
    const [isErrorOpen, setIsErrorOpen] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isSubmitting || isLoading) return

        const form = e.currentTarget as HTMLFormElement
        const fd = new FormData(form)

        // 1️⃣ Append files
        Object.entries(fileGroups).forEach(([fieldName, files]) => {
            if (Array.isArray(files)) {
                files.forEach((f) => fd.append(fieldName, f))
            }
        })

        // 2️⃣ Append formData
        Object.entries(formData ?? {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value) || typeof value === 'object') {
                    fd.append(key, JSON.stringify(value))
                } else {
                    fd.append(key, String(value))
                }
            }
        })

        setIsSubmitting(true)

        try {
            if (handleSubmitApi) {
                // ✅ truyền id nếu có, hoặc undefined nếu không
                const response = await handleSubmitApi(idSubmitApi, fd)
                if (response.success) {
                    onClose()
                    toast.success('Dữ liệu đã được lưu thành công.')
                    onSubmitSuccess?.(response)
                    // console.log('Response from handleSubmitApi:', response)
                } else {
                    let msg = response.message || 'Gửi dữ liệu thất bại. Vui lòng kiểm tra lại.'
                    if (response.error && typeof response.error === 'object') {
                        const errorDetails = Object.values(response.error).flat().join('\n')
                        if (errorDetails) {
                            msg = `${msg}\n${errorDetails}`
                        }
                    }
                    setErrorMsg(msg)
                    setIsErrorOpen(true)
                }
            }
        } catch (err) {
            console.error(err)
            setErrorMsg('Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau.')
            setIsErrorOpen(true)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <DraggableModal
                isOpen={isOpenCompose}
                onClose={onClose}
                onMinimize={onMinimize}
                title={title}
                size={size as any}
                width={`max-w-${size}`}
                variant="white"
                onSubmit={handleSubmit}
                encType="multipart/form-data"
                autoComplete="off"
                footer={
                    footerContent || (
                        <>
                            <Button
                                variant="ghost"
                                onPress={onClose}
                                isDisabled={isSubmitting || isLoading}
                            >
                                Hủy
                            </Button>
                            <Button className="bg-primary text-white" type="submit" isDisabled={isSubmitting || isLoading}>
                                {(isSubmitting || isLoading) && <Spinner size="sm" color="current" />}
                                Lưu
                            </Button>
                        </>
                    )
                }
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Spinner size="lg" color="current" />
                        <span className="text-sm text-gray-400 mt-4">Đang tải dữ liệu...</span>
                    </div>
                ) : (
                    children
                )}
            </DraggableModal>
            <ConfirmModal
                isOpen={isErrorOpen}
                onClose={() => setIsErrorOpen(false)}
                onConfirm={() => setIsErrorOpen(false)}
                title="Thông báo"
                content={errorMsg}
                confirmText="Đã hiểu"
                isDanger
            />
        </>
    )
}
