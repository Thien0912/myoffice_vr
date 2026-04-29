import { Button, Tooltip } from '@heroui-v3/react'
import { HrDrawer, HrDrawerBody, HrDrawerHeader } from '@renderer/components/hero-custom/HrDrawer'
import UserAvatar from '@renderer/components/UserAvatar'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { CheckCircle2, Workflow, X, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LeaveApprovalLogs } from './LeaveApprovalLogs'
import { LeaveApprovalTimeline } from './LeaveApprovalTimeline'
import { LeaveEmployeeInfo } from './LeaveEmployeeInfo'

interface LeaveRequestDetailDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  viewingData: any
  permissions?: any
  isApproving?: boolean
  approveActionType?: 'duyet' | 'tu_choi'
  openConfirm?: (
    row: any,
    level: 1 | 2,
    type: 'approve' | 'reject',
    reason?: string,
    isOnBehalf?: boolean
  ) => void
  onSupplementMinhChung?: (data: any) => void
  onPreviewFile?: (url: string, name: string, ext: string) => void
}

export default function LeaveRequestDetailDrawer({
  isOpen,
  onOpenChange,
  viewingData,
  permissions,
  isApproving,
  approveActionType,
  openConfirm,
  onSupplementMinhChung,
  onPreviewFile
}: LeaveRequestDetailDrawerProps) {
  const { user } = useAuthStore()
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(true)
  const [highlightedTime, setHighlightedTime] = useState<string | null>(null)

  const handleStepClick = (time: string) => {
    setHighlightedTime(time)
    setIsSecondaryOpen(true) // Ensure drawer expanded
    
    // Auto-scroll to the log
    setTimeout(() => {
      const el = document.getElementById(`log-${time}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)

    // Remove highlight after 30s (as requested, though quite long, let's honor the 30s delay)
    setTimeout(() => {
      setHighlightedTime(null)
    }, 30000)
  }

  useEffect(() => {
    if (isOpen) {
      setIsSecondaryOpen(true)
    }
  }, [isOpen])

  if (!viewingData) return null

  const isOwner =
    Number(viewingData.created_user_id) === Number(user?.ql_nguoi_dung_id) ||
    Number(viewingData.ql_nguoi_dung_id) === Number(user?.ql_nguoi_dung_id)

  const canSupplement = isOwner || permissions?.canApprove

  const currentPendingLevel =
    viewingData.trang_thai_cap_mot === 'Cho_duyet'
      ? 1
      : viewingData.trang_thai_cap_mot === 'Da_duyet' &&
          viewingData.trang_thai_cap_hai === 'Cho_duyet'
        ? 2
        : null

  const canApproveRegular =
    !!openConfirm &&
    !!permissions &&
    currentPendingLevel !== null &&
    ((currentPendingLevel === 1 && permissions.canApproveLevel1) ||
      (currentPendingLevel === 2 && permissions.canApproveLevel2))

  const canApproveOnBehalf =
    !canApproveRegular &&
    !!openConfirm &&
    !!permissions?.canApproveOnBehalf &&
    currentPendingLevel !== null &&
    currentPendingLevel === 1

  const showApproveActions = canApproveRegular || canApproveOnBehalf

  return (
    <HrDrawer
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      onOpenChange={onOpenChange}
      defaultWidth={600}
      isSecondaryOpen={isSecondaryOpen}
      onSecondaryClose={() => setIsSecondaryOpen(false)}
      secondaryWidth={450}
      secondaryTitle="Tiến trình phê duyệt"
      isFloatingUI={false}
      secondaryContent={
        <div className="flex flex-col">
          <LeaveApprovalTimeline
            data={viewingData}
            defaultExpanded={true}
            onPreviewFile={onPreviewFile}
            onStepClick={handleStepClick}
          />
          <LeaveApprovalLogs 
            data={viewingData} 
            defaultExpanded={true} 
            highlightedTime={highlightedTime}
          />
        </div>
      }
      secondaryFooter={
        showApproveActions ? (
          <div className="flex gap-2 w-full">
            <Button
              variant={canApproveOnBehalf ? 'danger-soft' : 'danger'}
              className="flex-1 rounded-xl h-10"
              isPending={isApproving && approveActionType === 'tu_choi'}
              isDisabled={isApproving}
              onPress={() => {
                if (currentPendingLevel) {
                  openConfirm?.(
                    viewingData,
                    currentPendingLevel as 1 | 2,
                    'reject',
                    '',
                    canApproveOnBehalf
                  )
                }
              }}
            >
              {isApproving && approveActionType === 'tu_choi' ? null : <XCircle size={18} />}
              {canApproveOnBehalf ? 'TỪ CHỐI HỘ' : 'TỪ CHỐI'}
            </Button>
            <Button
              variant={canApproveOnBehalf ? 'secondary' : 'primary'}
              className="flex-1 rounded-xl h-10"
              isPending={isApproving && approveActionType === 'duyet'}
              isDisabled={isApproving}
              onPress={() => {
                if (currentPendingLevel) {
                  openConfirm?.(
                    viewingData,
                    currentPendingLevel as 1 | 2,
                    'approve',
                    '',
                    canApproveOnBehalf
                  )
                }
              }}
            >
              {isApproving && approveActionType === 'duyet' ? null : <CheckCircle2 size={18} />}
              {canApproveOnBehalf ? 'DUYỆT HỘ' : 'DUYỆT ĐƠN'}
            </Button>
          </div>
        ) : undefined
      }
    >
      <HrDrawerHeader>
        <div className="flex w-full items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <UserAvatar
              name={viewingData.ho_va_ten}
              size="md"
              className="w-10 h-10 shrink-0 mt-0.5"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <h2
                className="text-base font-bold text-gray-900 dark:text-white leading-tight"
                title={viewingData.ho_va_ten}
              >
                {viewingData.ho_va_ten}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-gray-500 font-mono shrink-0">
                  {viewingData.ma_nhan_vien}
                </span>
                <span className="text-[10px] text-gray-300 dark:text-gray-600 shrink-0">•</span>
                <span
                  className="text-xs text-gray-500 dark:text-gray-400"
                  title={
                    viewingData.ten_chuc_vu
                      ? `${viewingData.ten_chuc_vu} - ${viewingData.ten_don_vi}`
                      : viewingData.ten_don_vi
                  }
                >
                  {viewingData.ten_chuc_vu ? `${viewingData.ten_chuc_vu} - ` : ''}
                  {viewingData.ten_don_vi}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-1 shrink-0 mt-0.5">
            {!isSecondaryOpen && (
              <Tooltip delay={0}>
                <Tooltip.Trigger>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    onPress={() => setIsSecondaryOpen(true)}
                  >
                    <Workflow size={18} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Mở rộng tiến trình phê duyệt</Tooltip.Content>
              </Tooltip>
            )}
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              className="rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              onPress={() => onOpenChange(false)}
            >
              <X size={20} />
            </Button>
          </div>
        </div>
      </HrDrawerHeader>
      <HrDrawerBody className="px-6 py-6!">
        <div className="flex flex-col gap-6">
          <LeaveEmployeeInfo
            data={viewingData}
            onSupplementMinhChung={canSupplement ? onSupplementMinhChung : undefined}
            onPreviewMinhChung={(url, name, ext) => onPreviewFile?.(url, name, ext || '')}
          />
        </div>
      </HrDrawerBody>
    </HrDrawer>
  )
}
