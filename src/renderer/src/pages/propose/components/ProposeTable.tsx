import { useState, useMemo } from 'react'
import { Button, Tooltip } from '@heroui/react'
import { MessageSquare, Paperclip, Maximize2 } from 'lucide-react'
import TableHr from '@renderer/components/table/TableHr'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { ProposeData } from '../hooks/usePropose'
import { date as formatDate } from '@renderer/utils/formatDate'
import { UserAvatarVertical } from '@renderer/components/UserAvatar'
import { FilePreviewModal } from '@renderer/components/FilePreviewModal'
import { ProposeStatus } from './ProposeStatus'

import TablePagination from '@renderer/components/table/TablePagination'

interface ProposeTableProps {
  data: ProposeData[]
  page: number
  totalRecord: number
  totalRecordFiltered: number
  limit: number
  isLoading: boolean
  onChangePage: (page: number) => void
  onChangeLimit: (limit: number) => void
  onRowClick: (row: ProposeData) => void
  onViewDetail?: (id: string, row: ProposeData) => void
  onApproveClick?: (id: string, row: ProposeData) => void
  selectedKeys?: any
  onSelectionChange?: (keys: any) => void
  columnWidths?: Record<string, number>
  onColumnResize?: (widths: Record<string, number>) => void
  pinnedColumns?: Record<string, 'left' | 'right' | undefined>
  onPinColumn?: (pinned: Record<string, 'left' | 'right' | undefined>) => void
  activeId?: string | number | null
  visibleColumns?: string[]
  sortDescriptors?: { column: string; direction: 'ascending' | 'descending' }[]
  onSortChange?: (sorts: { column: string; direction: 'ascending' | 'descending' }[]) => void
}

export default function ProposeTable({
  data,
  page,
  totalRecord,
  totalRecordFiltered,
  limit,
  isLoading,
  onChangePage,
  onChangeLimit,
  onRowClick,
  onViewDetail,
  onApproveClick,
  selectedKeys,
  onSelectionChange,
  columnWidths = {},
  onColumnResize,
  pinnedColumns = {},
  onPinColumn,
  activeId,
  visibleColumns = [],
  sortDescriptors = [],
  onSortChange
}: ProposeTableProps) {
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null)

  const columns: TableColumnType<ProposeData>[] = useMemo(
    () => [
      {
        uid: 'stt',
        name: 'STT',
        className: 'w-12 text-center',
        width: 40,
        pinned: pinnedColumns['stt'] || 'left'
      },
      {
        uid: 'tieu_de',
        name: 'Tiêu đề',
        sortable: true,
        width: 390,
        pinned: pinnedColumns['tieu_de'],
        render: (value, row) =>
          row ? (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="text-blue-700 dark:text-blue-400 truncate flex-1 cursor-pointer underline font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  onClick={() => onRowClick(row)}
                >
                  {String(value)}
                </span>

                <Tooltip content="Xem toàn màn hình">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 min-w-0"
                    onPress={() => {
                      if (row.id_de_xuat) {
                        onViewDetail?.(row.id_de_xuat, row)
                      }
                    }}
                  >
                    <Maximize2 size={14} className="text-gray-400 hover:text-blue-600" />
                  </Button>
                </Tooltip>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Attachments Icon */}
                  {(row.so_luong_file ?? 0) > 0 && (
                    <div className="flex items-center gap-1">
                      {row.file_dinh_kem?.map((file, idx) => (
                        <Tooltip key={idx} content={file.ten_file_goc}>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            color="warning"
                            className="w-6 h-6 min-w-0 bg-orange-50 dark:bg-orange-900/20 text-orange-600 border border-orange-100 dark:border-orange-800"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPreviewFile({ url: file.duong_dan, name: file.ten_file_goc })
                            }}
                          >
                            <Paperclip size={12} />
                          </Button>
                        </Tooltip>
                      ))}
                    </div>
                  )}

                  {/* Comments Count */}
                  {(row.so_luong_binh_luan ?? 0) > 0 && (
                    <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-800">
                      <MessageSquare size={12} className="fill-blue-600/10" />
                      <span className="">{row.so_luong_binh_luan ?? 0}</span>
                    </div>
                  )}
                </div>
              </div>
              {row.noi_dung && (
                <div
                  className="text-gray-400 truncate mt-0.5 line-clamp-1 opacity-80 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title={row.noi_dung}
                  onClick={() => onRowClick(row)}
                >
                  {row.noi_dung.replace(/<[^>]*>?/gm, '')}
                </div>
              )}
            </div>
          ) : null
      },
      {
        uid: 'ho_va_ten',
        name: 'Người trình ký',
        width: 200,
        pinned: pinnedColumns['ho_va_ten'],
        render: (value, row) => (
          <div className="flex items-center gap-2 py-1">
            <UserAvatarVertical
              name={String(value || '')}
              src={row?.avatar_nguoi_tao || row?.avatar}
              gender={row?.gioi_tinh}
              size="sm"
            />
          </div>
        )
      },
      {
        uid: 'trang_thai',
        name: 'Trạng thái',
        width: 180,
        pinned: pinnedColumns['trang_thai'],
        render: (value, row) => (
          <div className="flex items-center justify-start pl-2">
            {row ? <ProposeStatus status={String(value)} row={row} /> : null}
          </div>
        )
      },
      // {
      //   uid: 'actions',
      //   name: '',
      //   width: 100,
      //   pinned: pinnedColumns['actions'],
      //   sortable: false,
      //   disablePinning: true,
      //   render: (_, row) => {
      //     if (!row) return null
      //     const { user } = useAuthStore()
      //     const isTCHC = user?.ma_don_vi === 'PHONG_TCHC' || user?.loai_lanh_dao === 'LANH_DAO_TCHC'
      //     const isNotCompleted = row.trang_thai !== 'da_duyet' && row.trang_thai !== 'tu_choi'

      //     const canApprove =
      //       Number(row.can_approve || row.is_my_unit_turn) === 1 || (isTCHC && isNotCompleted)

      //     if (!canApprove) return null

      //     return (
      //       <div className="flex items-center justify-center">
      //         <Button
      //           size="sm"
      //           variant="solid"
      //           color="primary"
      //           onPress={() => {
      //             if (row?.id_de_xuat && onApproveClick) {
      //               onApproveClick(row.id_de_xuat, row)
      //             }
      //           }}
      //         >
      //           Xác nhận
      //         </Button>
      //       </div>
      //     )
      //   }
      // },
      {
        uid: 'created_at',
        name: 'Ngày gửi',
        sortable: true,
        width: 100,
        pinned: pinnedColumns['created_at'],
        render: (value) => (
          <div>
            <div>{formatDate('d/m/Y', String(value))}</div>
            <div>{formatDate('H:i:s', String(value))}</div>
          </div>
        )
      },
      {
        uid: 'ten_loai_de_xuat',
        name: 'Loại',
        pinned: pinnedColumns['ten_loai_de_xuat'],
        render: (value) => (
          <span className="text-gray-600 dark:text-gray-300 truncate block w-full">
            {String(value || 'Chưa xác định')}
          </span>
        )
      }
    ],
    [pinnedColumns, onViewDetail]
  )

  const visibleColumnsData = useMemo(() => {
    if (visibleColumns.length === 0) return columns
    return columns.filter((col) => visibleColumns.includes(col.uid))
  }, [columns, visibleColumns])

  return (
    <div className="bg-white dark:bg-gray-800 flex-1 flex flex-col overflow-hidden">
      <div className="overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          <TableHr<ProposeData>
            primaryKey="id_de_xuat"
            columns={visibleColumnsData}
            data={data}
            isLoading={isLoading}
            selectedKeys={selectedKeys}
            onSelectionChange={onSelectionChange}
            enableResizing={true}
            enablePinning={true}
            enableSorting={true}
            borderColor="border-gray-200 dark:border-gray-700"
            columnWidths={columnWidths}
            onColumnResize={(uid, width) => {
              onColumnResize?.({ ...columnWidths, [uid]: width })
            }}
            pinnedColumns={pinnedColumns}
            onPinColumn={(uid, pin) => {
              onPinColumn?.({ ...pinnedColumns, [uid]: pin })
            }}
            activeRowId={activeId}
            sortDescriptors={sortDescriptors}
            onSortChange={onSortChange}
          />
        </div>
      </div>

      <TablePagination
        page={page}
        total={totalRecord}
        filtered={totalRecordFiltered}
        limit={limit}
        onChangePage={onChangePage}
        onChangeLimit={onChangeLimit}
        className="p-2 border-t border-gray-200 dark:border-gray-700"
      />
      <FilePreviewModal
        isOpen={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        fileUrl={previewFile?.url || null}
        fileName={previewFile?.name}
      />
    </div>
  )
}
