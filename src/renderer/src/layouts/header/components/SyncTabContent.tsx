import { Button, Input, toast } from '@heroui-v3/react'
import { callApi } from '@renderer/api/callApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Copy } from 'lucide-react'
import { useState } from 'react'

const PATH_LIST = [
  {
    path: 'admin/hrm/nghiphep/sync/[uuid]',
    description: 'Đồng bộ lại đơn nghỉ phép theo đơn vị hiện tại của nhân viên trong dữ liệu.'
  },
  {
    path: 'admin/hrm/nghiphep/sync/[uuid]?id_don_vi=[id_don_vi]',
    description: 'Khi NV vừa chuyển đơn vị — đồng bộ người duyệt theo đơn vị MỚI này.'
  },
  {
    path: 'admin/hrm/nghiphep/sync/[uuid]?kiem_thu=1',
    description: 'Chạy thử nghiệm (Xem trước kết quả, không thay đổi Database).'
  }
]

export default function SyncTabContent() {
  const [syncUrl, setSyncUrl] = useState('')
  const queryClient = useQueryClient()

  const syncMutation = useMutation({
    mutationFn: (endpoint: string) => callApi(endpoint, { method: 'GET' }),
    onSuccess: (res: any) => {
      if (res.success) {
        toast('Đồng bộ thành công', { description: res.message || 'Đã đồng bộ đơn nghỉ phép thành công', variant: 'success' })
        queryClient.invalidateQueries({ queryKey: ['hrmNghiPhep'] })
      } else {
        toast('Đồng bộ thất bại', { description: res.message || 'Có lỗi xảy ra khi đồng bộ đơn', variant: 'danger' })
      }
    },
    onError: (err: any) => {
      toast('Lỗi', { description: err.response?.data?.message || 'Có lỗi khi kết nối server', variant: 'danger' })
    }
  })

  const isSyncing = syncMutation.isPending

  const handleSync = () => {
    if (!syncUrl.trim()) {
      toast('Cảnh báo', { description: 'Vui lòng nhập đường dẫn URL hợp lệ', variant: 'warning' })
      return
    }

    const endpoint = syncUrl.trim()
    syncMutation.mutate(endpoint)
    // catch block removed
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast('Đã sao chép', { description: `Đã sao chép: ${text}`, variant: 'success' })
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Input
            placeholder="ĐƯỜNG DẪN"
            className="flex-1 tracking-widest font-mono text-[13px] text-gray-800 dark:text-gray-200"
            value={syncUrl}
            onChange={(e) => setSyncUrl(e.target.value)}
            disabled={isSyncing}
          />
          <Button isPending={isSyncing} onPress={handleSync} variant="primary">
            Submit
          </Button>
        </div>
        <div className="mt-8">
          <h4 className="text-[12px] font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
            Danh sách đường dẫn:
          </h4>
          <div className="flex flex-col gap-2">
            {PATH_LIST.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-0 w-full border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-gray-500 w-4 text-right shrink-0">
                    {index + 1}.
                  </span>
                  <code className="flex-1 text-[12px] text-gray-800 dark:text-gray-200 tracking-wide font-mono truncate">
                    {item.path}
                  </code>
                  <Button size="sm" variant="secondary" onPress={() => copyToClipboard(item.path)}>
                    <Copy size={12} />
                    Copy
                  </Button>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 pl-6 italic mt-0.5">
                  - {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
