import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Button, Chip, Spinner, Tooltip } from '@heroui/react'
import { ChevronsRight, History, Images, Upload, X } from 'lucide-react'
import { toast } from '@heroui-v3/react'

import { HrDrawer, HrDrawerBody, HrDrawerHeader, HrPrimaryButton, HrCancelButton } from '@renderer/components/hero-custom'
import { useSidePanel } from '@renderer/components/side-panel'
import HosonhansuEditHistory from './HosonhansuEditHistory'
import MinhChungPanel from './MinhChungPanel'
import MinhChungUploadPanel from './MinhChungUploadPanel'
import FormContentBridge, { FormContentBridgeHandle } from './FormContentBridge'
import { serializeToFormData } from '@renderer/utils/formSerializer'

const EditNhansuPage = React.lazy(() => import('../EditNhansuPage'))

const SECTION_TITLE_MAP: Record<string, string> = {
  'section-4': 'Thêm thông tin gia đình',
  'section-5': 'Thêm hợp đồng',
  'section-6': 'Thêm quá trình công tác',
  'section-7': 'Thêm đánh giá nhân sự',
  'section-8': 'Thêm kinh nghiệm làm việc',
  'section-9': 'Thêm chứng chỉ',
  'section-10': 'Thêm bằng cấp',
  'section-11': 'Thêm quá trình đào tạo',
  'section-12': 'Thêm khen thưởng',
  'section-13': 'Thêm thủ tục thôi việc'
}

interface EmployeeEditDrawerProps {
  isOpen: boolean
  employeeId?: string
  employeeName?: string
  maNhanVien?: string
  trangThai?: string
  onClose: () => void
  onOpenSecondary: (sectionId: string) => void
  isSecondaryOpen: boolean
  setIsSecondaryOpen: React.Dispatch<React.SetStateAction<boolean>>
  activeSecondarySection: string | null
  setActiveSecondarySection: React.Dispatch<React.SetStateAction<string | null>>
  isPrimaryHidden: boolean
  setIsPrimaryHidden: React.Dispatch<React.SetStateAction<boolean>>
}

export default function EmployeeEditDrawer({
  isOpen,
  employeeId,
  employeeName,
  maNhanVien,
  trangThai,
  onClose,
  onOpenSecondary,
  isSecondaryOpen,
  setIsSecondaryOpen,
  activeSecondarySection,
  setActiveSecondarySection,
  isPrimaryHidden,
  setIsPrimaryHidden
}: EmployeeEditDrawerProps) {
  const { config: sidePanelConfig, closePanel, setBridgedToDrawer, bridgedToDrawer, formDataRef, fileGroupsRef } = useSidePanel()
  const formBridgeRef = useRef<FormContentBridgeHandle>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditHistoryOpen, setIsEditHistoryOpen] = useState(false)
  const [editDrawerMinWidth, setEditDrawerMinWidth] = useState(0)

  const handleEditMinWidthChange = useCallback((w: number) => setEditDrawerMinWidth(w), [])

  // Auto-open secondary panel when a child component sets bridgedToDrawer + openPanel
  useEffect(() => {
    if (bridgedToDrawer && sidePanelConfig) {
      setIsSecondaryOpen(true)
      // Switch away from 'minh-chung' so FormContentBridge renders instead of MinhChungPanel
      if (activeSecondarySection === 'minh-chung') {
        setActiveSecondarySection('form-edit')
      }
    }
  }, [bridgedToDrawer, sidePanelConfig, activeSecondarySection, setIsSecondaryOpen, setActiveSecondarySection])

  const handleCloseSecondary = useCallback(() => {
    if (activeSecondarySection === 'form-edit') {
      // Return to minh-chung panel (since form-edit means we interrupted minh-chung to show a form)
      setActiveSecondarySection('minh-chung')
      setBridgedToDrawer(false)
    } else {
      // Close the secondary drawer completely
      if (isPrimaryHidden) {
        // Both panels effectively closed — close entire drawer
        onClose()
        setIsPrimaryHidden(false)
      }
      setIsSecondaryOpen(false)
      setActiveSecondarySection(null)
      setBridgedToDrawer(false)
    }
    closePanel()
  }, [activeSecondarySection, isPrimaryHidden, closePanel, setBridgedToDrawer, onClose, setIsPrimaryHidden, setIsSecondaryOpen, setActiveSecondarySection])

  // Submit handler — replicates SidePanelLayout's FormData serialization
  const handleSecondarySubmit = useCallback(async () => {
    if (!sidePanelConfig?.onSubmit) return
    setIsSubmitting(true)
    try {
      const latestFormData = formBridgeRef.current?.getFormData() ?? formDataRef.current ?? {}
      const fd = serializeToFormData(latestFormData, fileGroupsRef.current)

      // Capture callback before closing — closePanel resets config after 300ms
      const onSuccess = sidePanelConfig.onSubmitSuccess
      const response = await sidePanelConfig.onSubmit(sidePanelConfig.idSubmitApi, fd)
      if (response.success) {
        handleCloseSecondary()
        toast('Thành công', { description: response.message || 'Dữ liệu đã được lưu thành công.', variant: 'success' })
        onSuccess?.(response)
      } else {
        const errorMessage = typeof response.error === 'object' ? Object.values(response.error).flat().join(',') : response.message
        toast('Lỗi', { description: errorMessage || 'Gửi dữ liệu thất bại.', variant: 'danger', timeout: 5000 })
      }
    } catch {
      toast('Lỗi', { description: 'Gửi dữ liệu thất bại. Lỗi ngoại lệ.', variant: 'danger' })
    } finally {
      setIsSubmitting(false)
    }
  }, [sidePanelConfig, handleCloseSecondary, fileGroupsRef, formDataRef])

  const handleCloseDrawer = useCallback(() => {
    if (isSecondaryOpen) {
      // Dual mode: hide primary, keep secondary
      setIsPrimaryHidden(true)
    } else {
      // Single mode: close everything
      onClose()
      setIsSecondaryOpen(false)
      setActiveSecondarySection(null)
      setBridgedToDrawer(false)
      setIsPrimaryHidden(false)
      closePanel()
    }
  }, [isSecondaryOpen, closePanel, setBridgedToDrawer, onClose, setIsPrimaryHidden, setIsSecondaryOpen, setActiveSecondarySection])


  if (!employeeId) return null

  return (
    <HrDrawer
      isOpen={isOpen}
      placement="right"
      onClose={handleCloseDrawer}
      defaultWidth={1000}
      maxWidth={2400}
      minWidth={editDrawerMinWidth}
      classNames={{
        secondaryBody: activeSecondarySection === 'minh-chung-upload' ? 'p-0' : undefined
      }}
      isSecondaryOpen={isSecondaryOpen}
      onSecondaryClose={handleCloseSecondary}
      secondaryTitle={
        activeSecondarySection === 'minh-chung'
          ? 'Hình ảnh minh chứng'
          : activeSecondarySection === 'minh-chung-upload'
            ? 'Tải lên minh chứng'
            : sidePanelConfig?.title || (activeSecondarySection ? SECTION_TITLE_MAP[activeSecondarySection] || 'Thêm mới' : 'Thêm mới')
      }
      secondaryWidth={420}
      isPrimaryHidden={isPrimaryHidden}
      onShowPrimary={() => setIsPrimaryHidden(false)}
      secondaryHeaderActions={
        activeSecondarySection === 'minh-chung' ? (
          <Tooltip content="Tải lên minh chứng" className="bg-slate-100" radius="none" placement="bottom">
            <Button
              isIconOnly size="sm" variant="flat" radius="full"
              className="bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400 dark:hover:bg-green-900/60"
              onPress={() => setActiveSecondarySection('minh-chung-upload')}
            >
              <Upload size={16} />
            </Button>
          </Tooltip>
        ) : undefined
      }
      secondaryContent={
        isSecondaryOpen && activeSecondarySection === 'minh-chung' ? (
          <MinhChungPanel idNhanVien={employeeId} />
        ) : isSecondaryOpen && activeSecondarySection === 'minh-chung-upload' ? (
          <MinhChungUploadPanel
            idNhanVien={employeeId}
            onBack={() => setActiveSecondarySection('minh-chung')}
          />
        ) : isSecondaryOpen && sidePanelConfig?.content ? (
          <FormContentBridge
            ref={formBridgeRef}
            content={sidePanelConfig.content}
            initialFormData={sidePanelConfig.formData ?? {}}
          />
        ) : isSecondaryOpen ? (
          <div className="flex items-center justify-center h-32">
            <Spinner size="sm" label="Đang tải form..." />
          </div>
        ) : undefined
      }
      secondaryFooter={
        isSecondaryOpen && activeSecondarySection !== 'minh-chung' && activeSecondarySection !== 'minh-chung-upload' && sidePanelConfig?.onSubmit ? (
          <div className="flex items-center justify-end gap-2">
            <HrCancelButton onPress={handleCloseSecondary}>Hủy</HrCancelButton>
            <HrPrimaryButton onPress={handleSecondarySubmit} isLoading={isSubmitting}>Lưu</HrPrimaryButton>
          </div>
        ) : undefined
      }
    >
      <HrDrawerHeader>
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <Tooltip
            content="Đóng"
            className="capitalize bg-slate-100"
            radius="none"
            placement="left"
          >
            <Button
              isIconOnly
              startContent={<ChevronsRight size={18} />}
              size="sm"
              variant="light"
              onPress={handleCloseDrawer}
            />
          </Tooltip>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 uppercase truncate" title={employeeName || ''}>{`${employeeName || ''}`}</span>
            {maNhanVien && (
              <Chip size="sm" variant="flat" className="bg-blue-50 text-blue-600 border border-blue-200 text-xs shrink-0" classNames={{ content: 'font-bold' }}>
                Mã: {maNhanVien}
              </Chip>
            )}
            {trangThai && (() => {
              const statusMap: Record<string, { label: string; color: 'warning' | 'primary' | 'success' | 'default' | 'danger' }> = {
                'DANG_HOC_VIEC': { label: 'Đang học việc', color: 'warning' },
                'DANG_THU_VIEC': { label: 'Đang thử việc', color: 'primary' },
                'DANG_LAM_VIEC': { label: 'Đang làm việc', color: 'success' },
                'TAM_NGHI': { label: 'Tạm nghỉ', color: 'default' },
                'DANG_LAM_THU_TUC_THOI_VIEC': { label: 'Đang làm thủ tục thôi việc', color: 'danger' },
                'NGHI_VIEC': { label: 'Nghỉ việc', color: 'danger' }
              }
              const status = statusMap[trangThai]
              return status ? (
                <Chip size="sm" variant="dot" color={status.color} className="text-xs font-medium shrink-0">
                  {status.label}
                </Chip>
              ) : null
            })()}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!(isSecondaryOpen && activeSecondarySection === 'minh-chung') && (
            <Tooltip
              content="Hiện minh chứng"
              className="capitalize bg-slate-100"
              radius="none"
              placement="bottom"
            >
              <Button
                isIconOnly
                variant="flat"
                radius="full"
                size="sm"
                className="bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/60"
                onPress={() => {
                  setActiveSecondarySection('minh-chung')
                  setIsSecondaryOpen(true)
                  setBridgedToDrawer(true)
                }}
              >
                <Images size={18} />
              </Button>
            </Tooltip>
          )}
          {/* History button */}
          <Tooltip content="Lịch sử chỉnh sửa" className="bg-slate-100" radius="none" placement="bottom">
            <Button
              isIconOnly
              variant="flat"
              radius="full"
              size="sm"
              className="bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
              onPress={() => setIsEditHistoryOpen(!isEditHistoryOpen)}
            >
              <History size={18} />
            </Button>
          </Tooltip>
          <Button
            isIconOnly
            variant="light"
            radius="full"
            className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            onPress={handleCloseDrawer}
          >
            <X size={20} />
          </Button>
        </div>
      </HrDrawerHeader>
      <HrDrawerBody className="p-0! overflow-hidden h-full bg-gray-100 dark:bg-gray-900/50 flex flex-col">
        {isOpen && (
          <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900/50 overflow-hidden">
            {/* Conditional: edit-history slide-over or main edit form */}
            {isEditHistoryOpen ? (
              <div className="flex flex-col h-full w-full bg-gray-50/50 dark:bg-gray-900/50">
                <div className="shrink-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-2">
                  <Button size="sm" variant="light" onPress={() => setIsEditHistoryOpen(false)} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                    ← Quay lại
                  </Button>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Lịch sử chỉnh sửa</span>
                </div>
                <div className="flex-1 overflow-y-auto w-full relative">
                  <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Spinner label="Đang tải..." /></div>}>
                    <HosonhansuEditHistory idNhanVien={employeeId} />
                  </Suspense>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto w-full relative">
                <Suspense fallback={
                  <div className="flex flex-col h-full overflow-auto bg-gray-50">
                    <div className="bg-white border-b border-gray-100 px-4 py-4 animate-pulse flex items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-gray-200 shrink-0" />
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-40" />
                        <div className="h-3 bg-gray-100 rounded w-24" />
                      </div>
                    </div>
                    {Array.from({ length: 4 }).map((_, secIdx) => (
                      <div key={secIdx} className="bg-white border-b border-gray-100 px-4 py-4 animate-pulse">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-5 w-5 rounded bg-blue-100" />
                          <div className="h-4 bg-gray-200 rounded w-32" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-1.5">
                              <div className="h-3 bg-gray-200 rounded w-1/3" />
                              <div className="h-9 bg-gray-100 rounded-lg w-full border border-gray-200" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                }>
                  <EditNhansuPage
                    key={employeeId}
                    idNhanVien={employeeId}
                    isDrawer
                    onClose={handleCloseDrawer}
                    onMinWidthChange={handleEditMinWidthChange}
                    onOpenSecondary={onOpenSecondary}
                  />
                </Suspense>
              </div>
            )}
          </div>
        )}
      </HrDrawerBody>
    </HrDrawer>
  )
}
