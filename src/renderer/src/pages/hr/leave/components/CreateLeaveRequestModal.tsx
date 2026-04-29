import { Button, cn, Modal, Tooltip } from '@heroui-v3/react'
import { HelpCircle, Minus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { useCreateLeaveRequest } from '../hooks/useCreateLeaveRequest'
import CreateLeaveTypeModal from './CreateLeaveTypeModal'
import { LeaveRequestFormContent } from './LeaveRequestFormContent'
import { TotalDaysDisplay } from './TotalDaysDisplay'

interface CreateLeaveRequestModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    onMinimize?: () => void
    editingData?: any
    onPreviewFile?: (url: string, name: string, ext: string) => void
}

export default function CreateLeaveRequestModal({
    isOpen,
    onOpenChange,
    onSuccess,
    onMinimize,
    editingData,
    onPreviewFile
}: CreateLeaveRequestModalProps) {
    const activeData = editingData

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const modalSize = isMobile ? 'full' : 'lg'

    const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false)

    const {
        form,
        days,
        employeeOptions,
        leaveTypeOptions,
        handleAddDay,
        handleRemoveDay,
        handleCreate,
        isLoading,
        isLoadingEmployees,
        isLoadingLeaveTypes,
        isEmployeeSelectDisabled
    } = useCreateLeaveRequest({ onSuccess, onOpenChange, editingData: activeData })

    const title = editingData ? 'Chỉnh sửa đơn nghỉ phép' : 'Tạo đơn nghỉ phép'
    const subtitle = editingData ? 'Cập nhật thông tin đơn nghỉ phép.' : 'Điền thông tin nghỉ phép và gửi để phê duyệt.'

    return (
        <>
            <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
                <Modal.Container
                    size={modalSize}
                    placement={isMobile ? 'center' : 'auto'}
                    scroll="inside"
                    className={cn(
                        isMobile ? 'p-0!' : '',
                        // Stitch MD3: max-w-2xl = 672px width
                        !isMobile && 'max-w-2xl! w-full'
                    )}
                >
                    <Modal.Dialog
                        className={cn(
                            !isMobile && 'rounded-3xl! overflow-hidden shadow-[0_24px_48px_-12px_rgba(25,28,29,0.15)]',
                            'p-0'
                        )}
                    >
                        {/* ─── Header: Stitch style ─── */}
                        <Modal.Header className="px-7 py-5! border-b-0">
                            <div className="flex w-full items-start sm:items-center justify-between gap-4">
                                <div className="flex flex-col gap-0.5 w-full">
                                    <div className="flex items-center gap-1.5">
                                        <Modal.Heading className="text-xl! font-bold tracking-tight">
                                            {title}
                                        </Modal.Heading>
                                        <Tooltip delay={0}>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="ghost"
                                                className="text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-700 rounded-full h-7 w-7 min-w-7"
                                            >
                                                <HelpCircle size={16} />
                                            </Button>
                                            <Tooltip.Content>
                                                {subtitle}
                                            </Tooltip.Content>
                                        </Tooltip>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {onMinimize && (
                                        <Tooltip>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="ghost"
                                                className="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full h-9 w-9 min-w-9"
                                                onPress={onMinimize}
                                            >
                                                <Minus size={18} />
                                            </Button>
                                            <Tooltip.Content>Thu nhỏ</Tooltip.Content>
                                        </Tooltip>
                                    )}
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

                        {/* ─── Body ─── */}
                        <Modal.Body className="py-2 px-7!">
                            <FormProvider {...form}>
                                <LeaveRequestFormContent
                                    form={form}
                                    days={days}
                                    employeeOptions={employeeOptions}
                                    leaveTypeOptions={leaveTypeOptions}
                                    handleAddDay={handleAddDay}
                                    handleRemoveDay={handleRemoveDay}
                                    isLoadingEmployees={isLoadingEmployees}
                                    isLoadingLeaveTypes={isLoadingLeaveTypes}
                                    isEmployeeSelectDisabled={isEmployeeSelectDisabled}
                                    onAddNewType={() => setIsCreateTypeModalOpen(true)}
                                    layout="modal"
                                    isReadOnly={false}
                                />
                            </FormProvider>
                        </Modal.Body>

                        {/* ─── Footer: Stitch MD3 style with summary bar ─── */}
                        <Modal.Footer className="px-6 py-4! border-t border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
                                {/* Summary Card - Stitch style */}
                                <div className="flex items-center gap-3 bg-blue-50/60 dark:bg-blue-900/15 px-4 py-2.5 rounded-xl w-full sm:w-auto">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400 shrink-0">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 16v-4" />
                                        <path d="M12 8h.01" />
                                    </svg>
                                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                                        <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Tổng nghỉ:</span>
                                        <TotalDaysDisplay
                                            control={form.control}
                                            className="flex items-center"
                                            valueClassName="text-[15px] font-bold text-blue-700 dark:text-blue-300 tracking-tight"
                                            showLabel={false}
                                        />
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-2.5 w-full sm:w-auto sm:ml-auto">
                                    <Button
                                        variant="ghost"
                                        className="flex-1 sm:flex-none px-5 font-semibold text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl h-10"
                                        onPress={() => onOpenChange(false)}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="flex-1 sm:flex-none px-6 font-semibold text-sm bg-linear-to-br from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg rounded-xl h-10 transition-all active:scale-[0.97] flex items-center gap-2"
                                        onPress={() => handleCreate()}
                                        isPending={isLoading}
                                    >
                                        Gửi yêu cầu
                                        {!isLoading && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="22" y1="2" x2="11" y2="13" />
                                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>

            <CreateLeaveTypeModal
                isOpen={isCreateTypeModalOpen}
                onOpenChange={setIsCreateTypeModalOpen}
                onSuccess={(newId) => {
                    if (newId) form.setValue('idLoaiPhep', newId)
                }}
            />
        </>
    )
}
