import { Button, cn } from '@heroui-v3/react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { TextareaFloatingLabel } from '@renderer/components/TextareaFloatingLabel'

interface LeaveApprovalActionsProps {
  reason: string
  setReason: (val: string) => void
  isFocusReason: boolean
  setIsFocusReason: (val: boolean) => void
  approveMutation: any
}

export const LeaveApprovalActions = ({
  reason,
  setReason,
  isFocusReason,
  setIsFocusReason,
  approveMutation
}: LeaveApprovalActionsProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 pb-4 sm:p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-700 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
      <div className="max-w-2xl mx-auto space-y-3">
        <TextareaFloatingLabel
          label="Ý kiến phê duyệt"
          placeholder="Nhập ý kiến (không bắt buộc)..."
          value={reason}
          onChange={setReason}
          onFocus={() => setIsFocusReason(true)}
          onBlur={() => setIsFocusReason(false)}
          rows={isFocusReason || reason ? 3 : 1}
          className={cn(
            'bg-white dark:bg-gray-900/50 transition-all duration-300 ease-in-out',
            !isFocusReason && !reason && 'h-[42px] min-h-[42px]'
          )}
        />
 
        <div className="flex gap-2 sm:gap-3">
          <Button
            variant="danger-soft"
            size="md"
            className="flex-1 font-bold h-10 rounded-lg text-red-500 bg-red-50 hover:bg-red-100"
            onPress={() => approveMutation.mutate('tu_choi')}
            isPending={approveMutation.isPending && approveMutation.variables === 'tu_choi'}
            isDisabled={approveMutation.isPending}
          >
            {approveMutation.isPending && approveMutation.variables === 'tu_choi' ? null : (
              <XCircle size={16} />
            )}
            TỪ CHỐI
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1 font-bold h-10 bg-blue-600 shadow-lg shadow-blue-500/10 rounded-lg"
            onPress={() => approveMutation.mutate('duyet')}
            isPending={approveMutation.isPending && approveMutation.variables === 'duyet'}
            isDisabled={approveMutation.isPending}
          >
            {approveMutation.isPending && approveMutation.variables === 'duyet' ? null : (
              <CheckCircle2 size={16} />
            )}
            DUYỆT ĐƠN
          </Button>
        </div>
      </div>
    </div>
  )
}
