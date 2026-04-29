import {
  Clock,
  Eye,
  MailOpen,
  MessageSquarePlus,
  MessagesSquare,
  Paperclip,
  Plus,
  Trash2
} from 'lucide-react'

import { Button, Chip, Tooltip, cn, toast } from '@heroui-v3/react'
import { useLayoutStore } from '@renderer/store/useLayoutStore'
import ListBoxWrapper from './components/ListBox/ListBoxWrapper'
import TableDocument from './components/table/TableDocument'

import { customDataApi } from '@renderer/api/callApi'
import { vanbandendonviAxios } from '@renderer/api/documents/vanbandendonviAxios'
import ContextMenu from '@renderer/components/ContextMenu'
import { useContextMenu } from '@renderer/hooks/useContextMenu'
import { useTableSort } from '@renderer/hooks/useTableSort'
import { VanBanData } from '@renderer/shared/CommonInterface'
import { useVanbandendonviStore } from '@renderer/store/useVanbanStore'
import { getStatusDocument } from '@renderer/utils/documents/statusVanban'
import { date } from '@renderer/utils/formatDate'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import DrawerDocument from './components/drawer/DrawerDocument'
import FormPhanhoi from './components/form/FormPhanhoi'
import FormVanbanden from './components/form/FormVanbanden'
import FormViewDonvixuly from './components/form/FormViewDonvixuly'
import InputPhanhoi from './components/InputPhanhoi'
import ModalCompose from './components/modal/ModalCompose'
import FileChip from './components/table/FileChip'
import { PopupFilter } from './components/table/Filters/PopupFilter'
import RowActionCheckbox from './components/table/RowActionCheckbox'

const COLOR_MAP = {
  sky: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
  blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  orange:
    'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  amber:
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  green:
    'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  gray: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
}

export default function VanbandendonviPage(): React.JSX.Element {
  const processingIdRef = useRef<string | number | null>(null)
  const { id_van_ban } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const idsFromUrl = searchParams.get('ids')
  // const [formData, setFormData] = useState<Record<string, object>>({})
  const { listBox, toggleListBox } = useLayoutStore()

  const { filters, setFilters, setStatisticals } = useVanbandendonviStore()
  const [page, setPage] = useState(filters.page ?? 1)
  const [length, setlength] = useState(filters.length ?? 30)
  const [totalRecord, setTotalRecord] = useState(0)
  const [totalRecordFiltered, setTotalRecordFiltered] = useState(0)

  const [indexRow, setIndexRow] = useState<number>(-1)

  // Cập nhật lại filter khi page hoặc length thay đổi
  useEffect(() => {
    setFilters({ page, length })
    setIndexRow(-1)
  }, [page, length])

  useEffect(() => {
    if (id_van_ban) {
      handleCloseMenu()
      markAsSeen(id_van_ban).then((success) => {
        if (success) {
          setSelectedRow(id_van_ban)
          setOpenDetail(true)
        }
        // Nếu thất bại (thu hồi / không có quyền): chỉ hiện toast, giữ nguyên trang
      })
    }
  }, [id_van_ban])
  const [contextRow, setContextRow] = useState<string | number>('')
  const [selectedRow, setSelectedRow] = useState<string | number>('')
  const [openDetail, setOpenDetail] = useState(false)

  const [isOpenCompose, setIsOpenCompose] = useState(false)
  const onOpenCompose = () => setIsOpenCompose(true)
  const onCloseCompose = () => setIsOpenCompose(false)
  //Phản hồi
  const [isOpenPhanhoi, setIsOpenPhanhoi] = useState(false)
  const onOpenPhanhoi = () => setIsOpenPhanhoi(true)
  const onClosePhanhoi = () => setIsOpenPhanhoi(false)

  // Xem đơn vị được phân công
  const [isOpenXemPhanCong, setIsOpenXemPhanCong] = useState(false)
  const onOpenXemPhanCong = () => setIsOpenXemPhanCong(true)
  const onCloseXemPhanCong = () => setIsOpenXemPhanCong(false)

  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())

  const { initialSortDescriptors, handleSortChange } = useTableSort({
    orders: filters.orders,
    setFilters
  })

  //handle selectedids
  const handleSelectedIds = useCallback((ids: Set<string | number>) => {
    setSelectedIds(ids)
  }, [])

  // Quản lý file từ form con
  const [fileGroups, setFileGroups] = useState<Record<string, File[]>>({})
  const onFilesChange = (name: string, files: File[]) => {
    setFileGroups((p) => ({ ...p, [name]: files }))
  }

  // Preview file
  const handleMoveToTrash = async (ids: (string | number) | (string | number)[]) => {
    const payload = Array.isArray(ids) ? ids : [ids]
    await vanbandendonviAxios.moveToTrash({ ids: payload }).then((response) => {
      if (response.success) {
        vanbandendonviRefetch().then(() => {
          toast('Chuyển vào thùng rác thành công', { variant: 'success' })
        })
      } else {
        toast('Chuyển vào thùng rác thất bại', { variant: 'danger' })
      }
    })
  }

  const markAsSeen = async (ids: (string | number) | (string | number)[]): Promise<boolean> => {
    const payload = Array.isArray(ids) ? ids : [ids]
    try {
      const response: any = await vanbandendonviAxios.createXemvanban({ ids: payload })
      if (response.success === false) {
        toast(response.message || 'Thao tác thất bại', { variant: 'danger' })
        return false
      }
      vanbandendonviRefetch()
      return true
    } catch (e: any) {
      console.error(e)
      toast('Lỗi hệ thống', { variant: 'danger' })
      return false
    }
  }

  const markAsComment = async (ids: (string | number) | (string | number)[]) => {
    const payload = Array.isArray(ids) ? ids : [ids]
    await vanbandendonviAxios.createPhanhoinhanh({ ids: payload }).then(() => {
      vanbandendonviRefetch()
      if (openDetail) {
        detailRefetch()
      }
      toast('Đã thêm phản hồi thành công')
    })
  }

  // test gitlab
  const onClickRow = (row: object) => {
    const id = row['id_van_ban'] as string | number
    setOpenDetail(true)
    handleCloseMenu()
    setSelectedRow(id)
    processingIdRef.current = id
    markAsSeen(id)

    // Tìm index của row này để đồng bộ highlight
    const idx = vanbandendonviData?.findIndex((r) => r.id_van_ban === id) ?? -1
    if (idx !== -1) setIndexRow(idx)
  }

  // Tùy chỉnh columns
  const customColumns = filters.tableColumn.map((col) => {
    switch (col.uid) {
      case 'ten_nguoi_tao':
        return {
          ...col,
          className: 'w-22 hidden lg:table-cell',
          render: (_, row: any) => (
            <div className="overflow-hidden text-ellipsis whitespace-nowrap w-30">
              {row.ten_nguoi_chuyen_xu_ly}
              <div>
                <small className="opacity-80">{row.email_nguoi_chuyen_xu_ly}</small>
              </div>
            </div>
          )
        }

      case 'so_van_ban':
        return {
          ...col,
          className: 'w-18 hidden lg:table-cell',
          render: (value) => <div className="pl-3">{value}</div>
        }

      case 'so_hieu_van_ban':
        return {
          ...col,
          className: 'w-5 hidden lg:table-cell',
          render: (value) => (
            <div className="truncate overflow-hidden text-ellipsis whitespace-nowrap w-28">
              {value}
            </div>
          )
        }

      case 'trang_thai':
        return {
          ...col,
          className: 'w-28 text-center hidden lg:table-cell',
          render: (value, row) => {
            const status = getStatusDocument(value, row.loai_van_ban)

            return (
              <Chip
                size="sm"
                variant="soft"
                className={`text-xs font-medium ${COLOR_MAP[status.color] || COLOR_MAP.gray}`}
              >
                {status.label}
              </Chip>
            )
          }
        }

      case 'trich_yeu':
        return {
          ...col,
          render: (value, row: any) => (
            <div className="flex justify-between gap-2 items-center p-0.5 pr-3">
              <div className="flex flex-col grow">
                <div className="flex items-center gap-2 mb-0.5">
                  {Number(row?.da_xem) === 0 && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 shrink-0"></span>
                  )}
                  <span className="line-clamp-1 select-text! cursor-text">{value}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {row.thoi_gian_xu_ly &&
                    (() => {
                      const now = new Date()
                      now.setHours(0, 0, 0, 0)
                      const deadline = new Date(row.thoi_gian_xu_ly)
                      deadline.setHours(0, 0, 0, 0)
                      const diffTime = deadline.getTime() - now.getTime()
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                      let colorClass = ''
                      if (diffDays < 0) {
                        // Quá hạn - Red
                        colorClass =
                          'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                      } else if (diffDays === 0) {
                        // Hôm nay - Amber
                        colorClass =
                          'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                      } else if (diffDays <= 5) {
                        // Sắp tới hạn (<= 5 ngày) - Blue
                        colorClass =
                          'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                      } else {
                        // Trên 5 ngày - Green
                        colorClass =
                          'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                      }

                      return (
                        <div
                          className={cn(
                            'flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-sm border',
                            colorClass
                          )}
                        >
                          <Clock size={12} />
                          <span>Hạn xử lý: {date('vi', row.thoi_gian_xu_ly)}</span>
                        </div>
                      )
                    })()}
                  {row.files?.length > 0 && (
                    <FileChip files={row.files} onClickRow={() => onClickRow(row)} />
                  )}
                </div>
              </div>
              <span>
                <ActionRowDocument
                  row={row}
                  onMarkSeen={markAsSeen}
                  onMarkComment={markAsComment}
                  onMoveToTrash={handleMoveToTrash}
                />
              </span>
            </div>
          )
        }

      default:
        return col
    }
  })

  // useQuery danh sách văn bản
  const {
    data: vanbandendonviData,
    isLoading: vanbandendonviIsLoading,
    isFetching: vanbandendonviIsFetching,
    refetch: vanbandendonviRefetch
  } = useQuery({
    queryKey: ['vanbandendonvi', filters, length],
    queryFn: () => {
      const payload = customDataApi(filters)
      if (idsFromUrl) {
        const searchKeyObj = JSON.parse(payload.searchKey)
        searchKeyObj.ids = idsFromUrl
        payload.searchKey = JSON.stringify(searchKeyObj)
      }

      return vanbandendonviAxios.fetch(payload).then((response) => {
        setTotalRecord(response.recordsTotal || 0)
        setTotalRecordFiltered(response.recordsFiltered || 0)

        if (response.thoi_han) {
          setStatisticals([
            { classify: 'all', count: response.thoi_han.all || 0 },
            { classify: 'chua_xem', count: response.thoi_han.chua_xem || 0 },
            { classify: 'da_xem', count: response.thoi_han.da_xem || 0 },
            { classify: 'tiep_nhan', count: response.thoi_han.tiep_nhan || 0 },
            { classify: 'cho_but_phe', count: response.thoi_han.cho_but_phe || 0 },
            { classify: 'qua_han', count: response.thoi_han.qua_han || 0 },
            { classify: 'hom_nay', count: response.thoi_han.hom_nay || 0 },
            { classify: 'duoi_5_ngay', count: response.thoi_han.duoi_5_ngay || 0 },
            { classify: 'tren_5_ngay', count: response.thoi_han.tren_5_ngay || 0 },
            { classify: 'luu_tru', count: response.thoi_han.luu_tru || 0 },
            { classify: 'da_but_phe', count: response.thoi_han.da_but_phe || 0 },
            { classify: 'nhan_hom_nay', count: response.thoi_han.nhan_hom_nay || 0 },
            {
              classify: 'da_chuyen_don_vi_xu_ly',
              count: response.thoi_han.da_chuyen_don_vi_xu_ly || 0
            },
            { classify: 'da_xu_ly', count: response.thoi_han.da_xu_ly || 0 },
            { classify: 'hoan_thanh', count: response.thoi_han.hoan_thanh || 0 },
            { classify: 'thu_hoi', count: response.thoi_han.thu_hoi || 0 }
          ])
        }

        return response.data || []
      })
    }
  })

  // useQuery detail văn bản
  const {
    data: detailData,
    isLoading: detailIsLoading,
    isFetching: detailIsFetching,
    refetch: detailRefetch
  } = useQuery({
    queryKey: ['detail', selectedRow],
    queryFn: async () => {
      return vanbandendonviAxios
        .show(selectedRow!)
        .then((response) => {
          if (!response.success || !response.data || Array.isArray(response.data)) {
            setOpenDetail(false)
            toast(response.message || 'Không thể tải chi tiết văn bản', { variant: 'danger' })
            navigate('/vanbandendonvi', { replace: true })
            return null
          }
          return response.data
        })
        .catch((e) => {
          console.error(e)
          setOpenDetail(false)
          toast('Lỗi kết nối', { variant: 'danger' })
          navigate('/vanbandendonvi', { replace: true })
          return null
        })
    },
    enabled: !!selectedRow // Chỉ chạy khi có selectedRow và click trái
  })

  // Xóa ID trên URL khi đã mở Drawer và có dữ liệu thành công
  useEffect(() => {
    if (id_van_ban && detailData && openDetail) {
      navigate('/vanbandendonvi', { replace: true })
    }
  }, [id_van_ban, detailData, openDetail, navigate])

  // Xử lý khi indexRow thay đổi - cập nhật selectedRow
  useEffect(() => {
    if (indexRow >= 0 && vanbandendonviData && vanbandendonviData[indexRow]) {
      const row = vanbandendonviData[indexRow]
      const id = row['id_van_ban'] as string | number
      setSelectedRow(id)

      // Auto open detail only if the user is explicitly navigating at the start
      // or if we want it to stay open when switching rows.
      if (openDetail) {
        setOpenDetail(true) // Keep it open if it was already open
      }

      // Chỉ gọi markAsSeen khi ID thay đổi (người dùng chuyển sang dòng khác)
      // Điều này ngăn vòng lặp do refetch dữ liệu làm useEffect chạy lại
      if (id !== processingIdRef.current) {
        processingIdRef.current = id
        markAsSeen(id)
      }
    }
  }, [indexRow]) // ONLY trigger when indexRow changes numerically

  // Reset indexRow when filters change (page change, search change, filter change)
  useEffect(() => {
    setIndexRow(-1)
  }, [filters]) // Reset highlight/index when filters change, NOT just when data refetches

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!vanbandendonviData || vanbandendonviData.length === 0) return

      // Tránh phiền toái khi đang gõ vào input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setIndexRow((prev) => (prev < vanbandendonviData.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setIndexRow((prev) => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === 'Enter') {
        if (indexRow >= 0) {
          setOpenDetail(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [vanbandendonviData, indexRow, openDetail])

  // Tự động cuộn tới hàng đang chọn (hỗ trợ phím mũi tên)
  useEffect(() => {
    if (indexRow >= 0) {
      const rowElement = document.querySelector(`[data-row-index="${indexRow}"]`)
      if (rowElement) {
        rowElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [indexRow])

  //Context menu
  const { menu, handleContextMenu, handleCloseMenu } = useContextMenu(() => {
    setSelectedRow('')
    setIndexRow(-1)
  })
  const menuItems = (row: any) => [
    {
      label: 'Xem phản hồi',
      icon: <MessagesSquare size={15} />,
      onClick: () => {
        onOpenPhanhoi()
        setContextRow(row.id_van_ban)
      }
    },
    {
      label: 'Đánh dấu là đã xem',
      icon: <MailOpen size={15} />,
      onClick: () => {
        markAsSeen(row.id_van_ban)
        setContextRow(row.id_van_ban)
      }
    },
    {
      label: 'Thêm phản hồi ngay',
      icon: <MessageSquarePlus size={15} />,
      onClick: () => {
        markAsComment(row.id_van_ban)
        setContextRow(row.id_van_ban)
      }
    },
    {
      label: 'Xem đơn vị được phân công',
      icon: <Eye size={15} />,
      onClick: () => {
        onOpenXemPhanCong()
        setSelectedRow(row.id_van_ban)
      }
    },
    { label: 'separator' },
    {
      label: 'Xem chi tiết',
      icon: <Eye size={15} />,
      onClick: () => {
        setOpenDetail(true)
        setSelectedRow(row.id_van_ban)
      }
    },
    { label: 'separator' },
    {
      label: 'Chuyển vào thùng rác',
      icon: <Trash2 size={15} className="text-danger" />,
      onClick: () => handleMoveToTrash(row.id_van_ban)
    }
  ]
  const containerRef = useRef<HTMLDivElement>(null)

  // Trong component VanbandendonviPage
  const onContextMenuRow = (e: React.MouseEvent, row: any) => {
    e.preventDefault() // ngăn menu mặc định
    const id = row['id_van_ban'] || row['id']
    setSelectedRow(id) // <-- set row hiện tại

    handleContextMenu(e, row) // lưu menu vị trí + row

    // Update ref to prevent useEffect from triggering markAsSeen
    processingIdRef.current = id

    // Tìm index của row này để đồng bộ highlight
    const idx = vanbandendonviData?.findIndex((r) => r.id_van_ban === id) ?? -1
    if (idx !== -1) setIndexRow(idx)
  }

  const menuActionCheckboxs = () => [
    {
      label: 'Đánh dấu là đã xem',
      icon: <MailOpen size={15} />,
      onClick: () => {
        markAsSeen([...selectedIds])
        setSelectedIds(new Set())
      }
    },
    {
      label: 'Thêm phản hồi ngay',
      icon: <MessageSquarePlus size={15} />,
      onClick: () => {
        markAsComment([...selectedIds])
        setSelectedIds(new Set())
      }
    }
  ]

  return (
    <div className="space-y-2">
      <div className="lg:flex gap-0">
        <div className="">
          <div className="block xl:hidden">
            <Button
              isIconOnly
              variant="primary"
              onPress={toggleListBox}
              className="rounded-full fixed z-10 right-4 bottom-7 shadow-lg w-15 h-15"
            >
              <Plus />
            </Button>
          </div>
          <div
            className={`fixed xl:hidden top-0 left-0 right-0 bottom-0 bg-gray-500/50 dark:bg-gray-900/50 z-20 ${listBox ? 'block' : 'hidden'}`}
            onClick={toggleListBox}
          ></div>
          <ListBoxWrapper open={listBox} onOpenCompose={onOpenCompose} />
        </div>

        <div ref={containerRef} className="lg:flex-1 space-y-3 relative">
          <TableDocument
            title="Danh sách văn bản"
            primaryKey="id_van_ban"
            FiltersComponent={<PopupFilter />}
            RowActionComponent={
              selectedIds.size > 0 ? (
                <RowActionCheckbox selectedIds={[...selectedIds]} menu={menuActionCheckboxs()} />
              ) : undefined
            }
            columns={customColumns}
            initVisibleColumns={filters.initial_visible_columns}
            page={filters.page}
            totalRecordFiltered={totalRecordFiltered}
            data={vanbandendonviData || []}
            onPageChange={setPage}
            length={length}
            setlength={setlength}
            totalRecord={totalRecord}
            onClickRow={onClickRow}
            selectedRow={selectedRow}
            handleSelectedIds={handleSelectedIds}
            onContextMenuRow={onContextMenuRow}
            isLoading={vanbandendonviIsLoading || vanbandendonviIsFetching}
            selectedIds={selectedIds}
            onSortChange={handleSortChange}
            indexRow={indexRow}
            setIndexRow={setIndexRow}
            initialSortDescriptors={initialSortDescriptors}
            hasSeenStatus={true}
          />
          {/* Context menu */}
          {menu.row && (
            <ContextMenu
              x={menu.x}
              y={menu.y}
              isOpen={menu.isOpen}
              items={menuItems(menu.row)}
              onClose={handleCloseMenu}
            />
          )}
        </div>
      </div>
      {/* Bản xem chi tiết */}
      <DrawerDocument
        open={openDetail}
        isLoading={detailIsLoading || detailIsFetching}
        onClose={() => setOpenDetail(false)}
        data={detailData}
        indexRow={indexRow}
        setIndexRow={setIndexRow}
      />

      {/* Modal thêm văn bản */}
      <ModalCompose
        title="Văn bản đến"
        isOpenCompose={isOpenCompose}
        onClose={onCloseCompose}
        size="5xl"
        handleSubmitApi={(_id, data) => vanbandendonviAxios.create(data!)}
        fileGroups={fileGroups}
        onSubmitSuccess={function (): void {
          throw new Error('Function not implemented.')
        }}
        formData={{}}
      >
        <FormVanbanden onFilesChange={onFilesChange} />
      </ModalCompose>

      {/* Modal xem phản hồi */}
      <ModalCompose
        title="Phản hồi"
        isOpenCompose={isOpenPhanhoi}
        onClose={onClosePhanhoi}
        idSubmitApi={contextRow}
        handleSubmitApi={(_id, data) => vanbandendonviAxios.createPhanhoi(_id!, data!)}
        fileGroups={fileGroups}
        onSubmitSuccess={() => {
          // console.log('thành công')
        }}
        formData={{}}
        footerContent={
          <>
            <InputPhanhoi name="noi_dung" />
          </>
        }
      >
        <FormPhanhoi id={contextRow} onFilesChange={onFilesChange} />
      </ModalCompose>

      {/* Comfirm Xem đơn vị được phân công */}
      <ModalCompose
        title="Đơn vị được phân công"
        size="4xl"
        isOpenCompose={isOpenXemPhanCong}
        onClose={onCloseXemPhanCong}
        idSubmitApi={selectedRow}
        footerContent={
          <Button variant="primary" onPress={onCloseXemPhanCong}>
            Đóng
          </Button>
        }
      >
        <FormViewDonvixuly row={detailData} />
      </ModalCompose>

      {/* Comfirm xác nhận hoàn thành */}
      {/* Confirm xóa văn bản */}
    </div>
  )
}

type ActionRowDocumentProps = {
  row: VanBanData
  onMarkSeen?: (ids: (string | number) | (string | number)[]) => void
  onMarkComment?: (ids: (string | number) | (string | number)[]) => void
  onMoveToTrash?: (ids: (string | number) | (string | number)[]) => void
}
function ActionRowDocument({
  row,
  onMarkSeen,
  onMarkComment,
  onMoveToTrash
}: ActionRowDocumentProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-1 w-0 overflow-hidden group-hover:w-auto transition-all duration-500">
        <Tooltip>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            className="rounded-full"
            onPress={() => onMarkSeen?.(row.id_van_ban)}
          >
            <MailOpen size={14} />
          </Button>
          <Tooltip.Content className="capitalize bg-slate-100 rounded-none text-xs px-2 py-1">
            Đánh dấu đã đọc
          </Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            className="rounded-full"
            onPress={() => onMarkComment?.(row.id_van_ban)}
          >
            <MessageSquarePlus size={14} />
          </Button>
          <Tooltip.Content className="capitalize bg-slate-100 rounded-none text-xs px-2 py-1">
            Thêm phản hồi
          </Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            className="rounded-full"
            onPress={() => onMoveToTrash?.(row.id_van_ban)}
          >
            <Trash2 size={14} className="text-danger" />
          </Button>
          <Tooltip.Content className="capitalize bg-slate-100 rounded-none text-xs px-2 py-1">
            Chuyển vào thùng rác
          </Tooltip.Content>
        </Tooltip>
      </div>
      <span className="text-slate-400 dark:text-slate-500 text-[10px] truncate">
        {date('vi', row.ngay_giao_xu_ly as string)}
      </span>
      {row.files?.length > 0 && <Paperclip className="size-3 text-slate-400 dark:text-slate-500" />}
    </div>
  )
}
