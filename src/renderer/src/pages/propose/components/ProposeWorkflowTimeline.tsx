import { User, CircleCheck, Edit2 } from 'lucide-react'
import { UserAvatar } from '@renderer/components/UserAvatar'
import { date as formatDate } from '@renderer/utils/formatDate'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { Tooltip } from '@heroui/react'

interface ApproverInfo {
  id?: string | number
  name: string
  avatar?: string
  unit?: string
  status?: 'approved' | 'rejected' | 'pending' | string
  statusLabel?: string
  time?: string
  comment?: string
}

interface WorkflowLevel {
  level: number | string
  unitName: string
  approvers?: ApproverInfo[]
  subUnits?: {
    name: string
    approvers: ApproverInfo[]
  }[]
  isMissing?: boolean
  idDonVi?: string | number
}

interface ProposeWorkflowTimelineProps {
  creator: ApproverInfo
  steps: WorkflowLevel[]
  className?: string
  onEditSigners?: (level: number | string, unitId: string | number, unitName: string, currentApprovers: any[]) => void
}

export default function ProposeWorkflowTimeline({
  creator,
  steps,
  className = '',
  onEditSigners
}: ProposeWorkflowTimelineProps) {
  const user = useAuthStore((state) => state.user)
  const userUnitId = user?.id_don_vi
  return (
    <div className={`relative border-l-2 border-dashed border-gray-200 dark:border-gray-700 ml-2 pl-8 space-y-8 py-4 ${className}`}>
      {/* Creator Node */}
      <div>
        <div className="flex items-center gap-2 mb-6 -ml-[45px]">
          <div className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-900/50 flex items-center justify-center border-2 border-white dark:border-gray-900 z-20">
            <User size={12} className="text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-[13px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
            Người tạo
          </span>
        </div>
        <div className="relative mb-6">
          <div className="absolute -left-[46px] mt-1 bg-blue-600 rounded-full border-4 border-white dark:border-gray-900 z-10">
            <CircleCheck size={20} className="text-white p-0.5" />
          </div>
          <div className="flex items-center gap-3">
            <UserAvatar name={creator.name} src={creator.avatar} size="sm" className="w-8 h-8" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">
                {creator.name}
              </span>
              {creator.unit && (
                <span className="text-[11px] text-gray-500 truncate">
                  {creator.unit}
                </span>
              )}
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                {creator.statusLabel || 'ĐÃ GỬI'}
              </span>
              {creator.time && (
                <span className="text-[11px] text-gray-400">
                  {formatDate('H:i d/m/Y', creator.time)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approval Level Nodes */}
      {steps.map((step) => (
        <div key={step.level}>
          <div className="flex items-center gap-2 mb-4 -ml-[45px]">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm z-20">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                {step.level}
              </span>
            </div>
            <span className="text-[13px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
              {step.unitName || `Cấp ${step.level}`}
            </span>
            {( (step.idDonVi && Number(step.idDonVi) === Number(userUnitId)) || Number(userUnitId) === 15 ) && (
              <Tooltip content="Chỉnh sửa người ký đơn vị này" placement="right">
                <button 
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-blue-600 transition-colors"
                  onClick={() => onEditSigners?.(
                    step.level, 
                    step.idDonVi!, 
                    step.unitName, 
                    step.approvers || []
                  )}
                >
                  <Edit2 size={14} />
                </button>
              </Tooltip>
            )}
          </div>

          <div className="space-y-4">
            {/* Case 1: Has sub-units */}
            {step.subUnits && step.subUnits.length > 0 ? (
              step.subUnits.map((sub, sIdx) => (
                <div key={sIdx} className="space-y-2">
                  <div className="space-y-3">
                    {sub.approvers.length > 0 ? (
                      sub.approvers.map((approver, aIdx) => (
                        <ApproverItem key={aIdx} approver={approver} />
                      ))
                    ) : (
                      <span className="text-[13px] text-gray-400 italic">Chưa chọn người ký cụ thể</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              /* Case 2: Standard Level */
              <div className="space-y-3">
                {step.approvers && step.approvers.length > 0 ? (
                  step.approvers.map((approver, aIdx) => (
                    <ApproverItem key={aIdx} approver={approver} />
                  ))
                ) : (
                  <span className="text-[13px] text-gray-400 italic">
                    {step.isMissing ? 'Vui lòng chọn đơn vị...' : 'Chưa chọn người ký cụ thể'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ApproverItem({ approver }: { approver: ApproverInfo }) {
  const status = approver.status || 'pending'

  const statusLabel = approver.statusLabel || (
    status === 'approved' ? 'ĐÃ DUYỆT' :
    status === 'rejected' ? 'TỪ CHỐI' :
    'CHỜ DUYỆT'
  )

  const statusColor =
    status === 'approved' ? 'text-green-600 dark:text-green-400' :
    status === 'rejected' ? 'text-red-600 dark:text-red-400' :
    'text-amber-600 dark:text-amber-400'

  return (
    <div className="relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar name={approver.name} src={approver.avatar} size="sm" className="w-8 h-8" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">
              {approver.name}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className={`text-[10px] font-bold uppercase ${statusColor}`}>
            {statusLabel}
          </span>
          {approver.time && (
            <span className="text-[11px] text-gray-400">
              {formatDate('H:i d/m/Y', approver.time)}
            </span>
          )}
        </div>
      </div>
      {approver.comment && (
        <div className="mt-1.5 ml-11 text-[12px] text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
          <span className="font-semibold not-italic text-gray-700 dark:text-gray-300">Ý kiến:</span> {approver.comment}
        </div>
      )}
    </div>
  )
}
