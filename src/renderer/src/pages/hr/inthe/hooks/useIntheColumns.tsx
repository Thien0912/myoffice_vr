import { useMemo } from 'react'
import { UserAvatarVertical } from '@renderer/components/UserAvatar'

export function useIntheColumns(page: number, limit: number, setActiveEmployee: (emp: any) => void) {
  return useMemo(
    () => [
      {
        uid: 'stt',
        name: 'STT',
        width: 50,
        render: (_: any, __: any, index?: number) => (
          <div className="flex justify-center w-full text-[13px] text-gray-500 font-medium">
            {(page - 1) * limit + (index ?? 0) + 1}
          </div>
        )
      },
      {
        uid: 'ma_nhan_vien',
        name: 'Mã',
        width: 100,
        sort: true,
        render: (val: string, row: any) => (
          <span 
            className="font-medium text-blue-600 dark:text-blue-400 underline cursor-pointer hover:text-blue-700 transition-colors"
            onClick={() => {
              setActiveEmployee(row)
            }}
          >
            {val}
          </span>
        )
      },
      {
        uid: 'ho_va_ten',
        name: 'Họ và tên',
        width: 220,
        sort: true,
        render: (val: string, row: any) => (
          <UserAvatarVertical 
            name={val}
            src={row.avatar}
            description={row.email}
            size="sm"
            className="hover:bg-transparent px-2"
          />
        )
      },
      { 
        uid: 'hoc_ham', 
        name: 'Học hàm', 
        width: 150, 
        sort: true,
        render: (val: string) => (
          <span className="text-[13px] text-gray-600 dark:text-gray-300 font-medium">
            {val || '--'}
          </span>
        )
      },

      { uid: 'ten_don_vi', name: 'Đơn vị', width: 280, sort: true },
      { 
        uid: 'ten_chuc_vu', 
        name: 'Chức vụ', 
        width: 220, 
        sort: true,
        render: (_: any, row: any) => (
          <span className="text-[13px] text-gray-600 dark:text-gray-300">
            {row.ten_chuc_vu || row.ten_cong_viec || '--'}
          </span>
        )
      }
    ],
    [page, limit]
  )
}
