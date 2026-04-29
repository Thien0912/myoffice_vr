import { Button, Chip, Tooltip, cn, toast } from '@heroui-v3/react'
import { customDataApi } from '@renderer/api/callApi'
import OfficeIcon from '@renderer/components/OfficeIcon'
import { useLayoutStore } from '@renderer/store/useLayoutStore'
import { truncateMiddle } from '@renderer/utils/string'
import { Clock, Paperclip, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import {
  vanbannoiboAxios
  // columns,
  // INITIAL_VISIBLE_COLUMNS
} from '../../api/documents/vanbannoiboAxios'
import { STATUS_VBDI_MAP } from '../../utils/documents/statusVanban'
import DrawerDocument from './components/drawer/DrawerDocument'
import ListBoxWrapper from './components/ListBox/ListBoxWrapper'
import TableDocument from './components/table/TableDocument'
// import { VanBanData } from '@renderer/shared/CommonInterface'
import ConfirmModal from '@renderer/components/ConfirmModal'
import { ExistingFile } from '@renderer/shared/CommonInterface'
import { useVanbannoiboStore } from '@renderer/store/useVanbanStore'
import { enscrypt } from '@renderer/utils/documents/userPreview'
import { date } from '@renderer/utils/formatDate'
import openPopout from '@renderer/utils/openPopout'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import BoxSearchFile from './components/BoxSearchFile'
import FormVanbannoibo from './components/form/FormVanbannoibo'
import ModalCompose from './components/modal/ModalCompose'
import { PopupFilter } from './components/table/Filters/PopupFilter'
import RowActionCheckbox from './components/table/RowActionCheckbox'

import { useComposeStore } from '@renderer/store/useComposeStore'

const COLOR_MAP = {
  teal: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800',
  blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  yellow:
    'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  green:
    'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  brown:
    'bg-amber-200 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800', // dùng amber gần giống brown vì tw không có màu brown
  gray: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
}

export default function VanbannoiboPage(): React.JSX.Element {
  const queryClient = useQueryClient()
  // const [page, setPage] = useState(1)
  const { listBox, toggleListBox } = useLayoutStore()
  const [length, setlength] = useState(30)
  const [totalRecord, setTotalRecord] = useState(0)
  const [totalRecordFiltered, setTotalRecordFiltered] = useState(0)
  const [selectedRow, setSelectedRow] = useState<string | number>('')
  const [openDetail, setOpenDetail] = useState(false)
  const [openSearchFile, setOpenSearchFile] = useState(false)
  const [indexRow, setIndexRow] = useState<number>(-1)
  // const [vanbandis, setVanbandis] = useState([])
  // const [dataDetail, setDataDetail] = useState<VanBanData | null>(null)
  const { filters, setFilters, setCreate, setStatisticals } = useVanbannoiboStore()
  const [page, setPage] = useState(filters.page ?? 1)
  const { onOpen: onOpenComposeGlobal } = useComposeStore()
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())
  const lengthSelectedIds = selectedIds.size

  const [isOpenMoveTrash, setIsOpenMoveTrash] = useState(false)
  const onOpenMoveTrash = () => setIsOpenMoveTrash(true)
  const onCloseMoveTrash = () => setIsOpenMoveTrash(false)

  const [idsToMoveTrash, setIdsToMoveTrash] = useState<(string | number)[] | null>(null)
  const [isMovingTrash, setIsMovingTrash] = useState(false)

  const [idsToRestore, setIdsToRestore] = useState<(string | number)[] | null>(null)
  const [isOpenRestore, setIsOpenRestore] = useState(false)
  const onOpenRestore = () => setIsOpenRestore(true)
  const onCloseRestore = () => setIsOpenRestore(false)

  const [isRestoring, setIsRestoring] = useState(false)
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([])
  const [editingId, setEditingId] = useState<string | number | null>(null)

  const [isOpenComposeEdit, setIsOpenComposeEdit] = useState(false)
  const onOpenComposeEdit = () => setIsOpenComposeEdit(true)
  const onCloseComposeEdit = () => setIsOpenComposeEdit(false)

  // Cập nhật lại filter khi page hoặc length thay đổi
  useEffect(() => {
    setFilters({ page, length })
    setIndexRow(-1)
  }, [page, length])

  //handle selectedids
  const handleSelectedIds = useCallback((ids: Set<string | number>) => {
    setSelectedIds(ids)
  }, [])

  // Quản lý dữ liệu từ form trong modal
  const [formData, setFormData] = useState<Record<string, object>>({})
  // Quản lý file từ form con
  const [fileGroups, setFileGroups] = useState<Record<string, File[]>>({})
  const onFilesChange = (name: string, files: File[]) => {
    const oldFiles = fileGroups[name] || []
    const deletedFiles = oldFiles.filter(
      (old) => !files.some((f) => f.name === old.name && f.size === old.size)
    )

    if (deletedFiles.length > 0) {
      // console.log(
      //   'File đã bị xóa: ',
      //   deletedFiles.map((f) => f.name)
      // )

      const deletedFileNames = deletedFiles.map((f) => f.name)

      // Duyệt tất cả key trong formData (files, files_tchc, file_ban_hanh_old…)
      const listFileOldName = ['file_dinh_kem_old']
      Object.keys(formData).forEach((key) => {
        if (!listFileOldName.includes(key)) return

        const value = formData[key]
        if (Array.isArray(value)) {
          // Tìm file trong từng mảng của formData
          const matched = value.filter((item) => deletedFileNames.includes(item.ten_file_goc))

          const notMatched = value.filter((item) => !deletedFileNames.includes(item.ten_file_goc))

          if (matched.length > 0) {
            // console.log(`🔥 FormData.${key} có file tương ứng bị xoá:`, matched)
          }

          if (notMatched.length > 0) {
            // console.log(`🔥 FormData.${key} có file tương ứng còn lại`, notMatched)
            setFormData((p) => ({ ...p, [key]: notMatched }))
          }
        }
      })
    }

    setFileGroups((p) => ({ ...p, [name]: files }))
  }

  const onSearchChange = (value: string): void => {
    console.log('Search value:', value)
  }

  // Preview file
  const handlePreview = async (url: string, name: string): Promise<void> => {
    const link = await enscrypt(url, name)
    if (link) {
      openPopout(link, name)
    }
  }

  const convertSize = (str: string) => {
    const [num, unit] = str.split(' ')
    const n = parseFloat(num)
    if (unit === 'KB') return n * 1024
    if (unit === 'MB') return n * 1024 * 1024
    return n
  }

  const guessMimeType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg'
      case 'png':
        return 'image/png'
      case 'pdf':
        return 'application/pdf'
      case 'doc':
      case 'docx':
        return 'application/msword'
      case 'xlsx':
      case 'xls':
        return 'application/vnd.ms-excel'
      default:
        return 'application/octet-stream'
    }
  }
  const handleMoveToTrash = (ids: (string | number) | (string | number)[]) => {
    setIdsToMoveTrash(Array.isArray(ids) ? ids : [ids])
    onOpenMoveTrash()
  }

  const confirmMoveToTrash = async () => {
    if (!idsToMoveTrash) return
    setIsMovingTrash(true)
    await vanbannoiboAxios
      .moveToTrash({ ids: idsToMoveTrash })
      .then((response) => {
        if (response.success) {
          vanbannoiboRefetch().then(() => {
            toast('Chuyển vào thùng rác thành công', { variant: 'success' })
          })
          setSelectedIds(new Set())
        } else {
          toast(`Chuyển vào thùng rác thất bại: ${response.message || ''}`, { variant: 'danger' })
        }
      })
      .finally(() => {
        setIsMovingTrash(false)
        onCloseMoveTrash()
        setIdsToMoveTrash(null)
      })
  }

  const handleRestore = (ids: (string | number) | (string | number)[]) => {
    setIdsToRestore(Array.isArray(ids) ? ids : [ids])
    onOpenRestore()
  }

  const confirmRestore = async () => {
    if (!idsToRestore) return
    setIsRestoring(true)
    await vanbannoiboAxios
      .restore({ ids: idsToRestore })
      .then((response) => {
        if (response.success) {
          vanbannoiboRefetch().then(() => {
            toast('Khôi phục văn bản thành công', { variant: 'success' })
          })
          setSelectedIds(new Set())
        } else {
          toast(`Khôi phục văn bản thất bại: ${response.message || ''}`, { variant: 'danger' })
        }
      })
      .finally(() => {
        setIsRestoring(false)
        onCloseRestore()
        setIdsToRestore(null)
      })
  }

  const handleClone = async (id: string | number) => {
    await vanbannoiboAxios.cloneVanban(id).then(async (response) => {
      if (response.success) {
        toast('Tạo bản sao thành công', { variant: 'success' })
        const res = await vanbannoiboRefetch()
        const newData = res.data || []
        const newId = response.data.id_van_ban
        const newIdx = (newData as any[]).findIndex((r) => r.id_van_ban === newId)
        
        setSelectedRow(newId)
        setIndexRow(newIdx !== -1 ? newIdx : 0)
      } else {
        toast(`Tạo bản sao thất bại: ${response.message || ''}`, { variant: 'danger' })
      }
    })
  }

  const onClickRow = async (row: object): Promise<void> => {
    const id = row['id_van_ban'] as string | number
    setOpenDetail(true)
    setSelectedRow(id)

    // Tìm index của row này để đồng bộ highlight
    const idx = (vanbannoiboData as any[])?.findIndex((r) => r.id_van_ban === id) ?? -1
    if (idx !== -1) setIndexRow(idx)
  }

  // Tùy chỉnh columns
  const customColumns = filters.tableColumn.map((col) => {
    switch (col.uid) {
      case 'ten_nguoi_tao':
      case 'nguoi_tao_ho_ten':
        return {
          ...col,
          className: 'w-22 hidden lg:table-cell',
          render: (_value, row) => {
            return (
              <div className="flex flex-col text-zinc-500 dark:text-zinc-400">
                <span className="truncate w-30 font-medium">{row.nguoi_tao_ho_ten}</span>
                <span className="text-[11px] truncate w-30">{row.nguoi_tao_email}</span>
              </div>
            )
          }
        }

      case 'so_van_ban':
        return {
          ...col,
          className: 'w-18 hidden lg:table-cell',
          render: (value) => <div className="text-zinc-600 dark:text-zinc-300 pl-3">{value}</div>
        }

      case 'so_hieu_van_ban':
        return {
          ...col,
          className: 'w-5 hidden lg:table-cell',
          render: (value) => (
            <div className="text-zinc-600 dark:text-zinc-300 truncate overflow-hidden text-ellipsis whitespace-nowrap w-28">
              {value}
            </div>
          )
        }

      case 'trang_thai':
        return {
          ...col,
          className: 'w-28 text-center',
          render: (value) => {
            const matchedStatus = Object.values(STATUS_VBDI_MAP).find(
              (status) => status.value === Number(value)
            )

            const status = matchedStatus || { label: 'Không xác định', color: 'gray', value: 0 }

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
          render: (value, row) => (
            <div className="flex justify-between gap-2 items-center p-0.5 pr-3">
              <div className="flex flex-col grow">
                <span className="line-clamp-1 mb-0.5 text-gray-700 dark:text-gray-200 select-text! cursor-text">
                  {value}
                </span>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {row.thoi_gian_xu_ly && (
                    <div
                      className={cn(
                        'flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-sm border',
                        new Date(row.thoi_gian_xu_ly) < new Date()
                          ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                          : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                      )}
                    >
                      <Clock size={12} />
                      <span>Hạn xử lý: {date('vi', row.thoi_gian_xu_ly)}</span>
                    </div>
                  )}
                  {row.files?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      {row.files.slice(0, 2).map((f, index) => (
                        <Chip
                          key={f.ten_file_goc + index}
                          size="sm"
                          className="text-xs bg-transparent border-1 border-gray-300 dark:border-gray-600 p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreview(f.duong_dan, f.ten_file_goc)
                          }}
                        >
                          <div className="flex gap-2">
                            <OfficeIcon name={f.ten_file_goc} size={14} />
                            <span className="text-gray-600 dark:text-gray-300">
                              {truncateMiddle(f.ten_file_goc)}
                            </span>
                          </div>
                        </Chip>
                      ))}
                      {row.files.length > 2 && (
                        <Chip
                          size="sm"
                          variant="soft"
                          className="text-[10px] h-6 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 font-bold"
                          onClick={(e) => {
                            e.stopPropagation()
                            onClickRow(row)
                          }}
                        >
                          +{row.files.length - 2}
                        </Chip>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <span>
                <ActionRowDocument
                  data={row}
                  onMoveToTrash={handleMoveToTrash}
                  onRestore={handleRestore}
                  isTrashView={filters.selectedClassify === 'da_xoa'}
                  onOpenComposeEdit={async () => {
                    const id = row['id_van_ban'] as string | number
                    const res = await vanbannoiboAxios.show(id)
                    if (res.status == 200) {
                      const data = res.data || {}
                      setFormData({
                        ...data,
                        file_dinh_kem_old: data.files,
                        nguoi_don_vi: data.nguoi_xem.map((item) => item.ql_nguoi_dung_id).join(','),
                        nguoi_dong_so_huu: data.nguoi_xem
                          .filter((item) => item.ql_nguoi_dung_id == item.nguoi_dong_so_huu_id)
                          .map((item) => item.ql_nguoi_dung_id)
                          .join(',')
                      })

                      setCreate({
                        ids_ql_nguoi_dung: data.nguoi_xem
                          .map((item) => item.ql_nguoi_dung_id)
                          .join(',')
                      })

                      const existingFiles = data.files.map((f) => ({
                        id: Number(f.id_file_dinh_kem),
                        name: f.ten_file_goc,
                        size: convertSize(f.dung_luong),
                        url: `/uploads/${f.duong_dan}`, // hoặc API cung cấp URL decode
                        type: guessMimeType(f.ten_file_goc)
                      }))

                      setExistingFiles(existingFiles)
                    }

                    setEditingId(id)
                    onOpenComposeEdit()
                  }}
                />
              </span>
            </div>
          )
        }

      default:
        return col
    }
  })

  const {
    data: vanbannoiboData = [],
    isLoading: isLoadingVanbannoibo,
    isFetching: isFetchingVanbannoibo,
    refetch: vanbannoiboRefetch
  } = useQuery({
    queryKey: ['vanbannoibo', filters, length],
    queryFn: () => {
      return vanbannoiboAxios.fetch(customDataApi(filters)).then((response) => {
        setTotalRecord(response.recordsTotal || 0)
        setTotalRecordFiltered(response.recordsFiltered || 0)

        if (response.thoi_han) {
          setStatisticals([
            { classify: 'all', count: response.thoi_han.all || 0 },
            { classify: 'hom_nay', count: response.thoi_han.hom_nay || 0 },
            { classify: '7_ngay', count: response.thoi_han['7_ngay'] || 0 },
            { classify: 'trong_thang', count: response.thoi_han.trong_thang || 0 },
            { classify: 'truoc_do', count: response.thoi_han.truoc_do || 0 }
          ])
        }

        return response.data || []
      })
    }
  })

  // useQuery chi tiết văn bản
  const {
    data: detailData,
    isLoading: detailIsLoading,
    isFetching: detailIsFetching
    // refetch: detailRefetch
  } = useQuery({
    queryKey: ['detail', selectedRow],
    queryFn: async () => {
      return vanbannoiboAxios.show(selectedRow!).then((response) => response.data || null)
    },
    enabled: !!selectedRow // Chỉ chạy khi có selectedRow và click trái
  })

  // Xử lý khi indexRow thay đổi - cập nhật selectedRow
  useEffect(() => {
    if (indexRow >= 0 && vanbannoiboData && vanbannoiboData[indexRow]) {
      const row = vanbannoiboData[indexRow]
      const id = row['id_van_ban'] as string | number
      setSelectedRow(id)

      // Auto open detail only if the user is explicitly navigating at the start
      // or if we want it to stay open when switching rows.
      if (openDetail) {
        setOpenDetail(true) // Keep it open if it was already open
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
      if (!vanbannoiboData || (vanbannoiboData as any[]).length === 0) return

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
        setIndexRow((prev) => (prev < (vanbannoiboData as any[]).length - 1 ? prev + 1 : prev))
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
  }, [vanbannoiboData, indexRow, openDetail])

  // Tự động cuộn tới hàng đang chọn (hỗ trợ phím mũi tên)
  useEffect(() => {
    if (indexRow >= 0) {
      const rowElement = document.querySelector(`[data-row-index="${indexRow}"]`)
      if (rowElement) {
        rowElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [indexRow])

  // menu action khi có chọn nhiều checkbox
  // menu action khi có chọn nhiều checkbox
  const menuActionCheckboxs = () => {
    if (filters.selectedClassify === 'da_xoa') {
      return [
        {
          label: 'Khôi phục',
          icon: <RotateCcw size={15} />,
          onClick: () => {
            handleRestore([...selectedIds])
            setSelectedIds(new Set())
          }
        }
      ]
    }
    return [
      {
        label: 'Chuyển vào thùng rác',
        icon: <Trash2 size={15} />,
        onClick: () => {
          handleMoveToTrash([...selectedIds])
          setSelectedIds(new Set())
        }
      }
    ]
  }

  // File list
  const [searchFile, setSearchFile] = useState('')
  const [filterFile, setFilterFile] = useState<{
    fileType: string
    author: string
    date: { start: string; end: string } | null
  }>({ fileType: '', author: '', date: null })
  const {
    data: dataFiles,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery({
    queryKey: ['files', openSearchFile, searchFile, filterFile],
    enabled: !!openSearchFile,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      vanbannoiboAxios
        .files({
          page: pageParam,
          limit: 20,
          search: searchFile,
          fileType: filterFile.fileType,
          author: filterFile.author,
          date: filterFile.date
        })
        .then((res) => {
          const files = Array.isArray(res.data) ? res.data : res.data?.data || []
          return files
        }),
    getNextPageParam: (lastPage, pages) => (lastPage?.length ? pages.length + 1 : undefined)
  })

  const allFiles = dataFiles?.pages.flat() || []

  useEffect(() => {
    const timeout = setTimeout(() => {
      refetch()
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchFile, filterFile])

  return (
    <div className="space-y-2">
      <div className="lg:flex gap-0">
        <div className="">
          <div className="block xl:hidden">
            <Button
              isIconOnly
              variant="primary"
              className="rounded-full fixed z-10 right-4 bottom-7 shadow-lg w-15 h-15"
              onPress={toggleListBox}
            >
              <Plus />
            </Button>
          </div>
          <div
            className={`fixed xl:hidden top-0 left-0 right-0 bottom-0 bg-gray-500/50 dark:bg-gray-900/50 z-20 ${listBox ? 'block' : 'hidden'}`}
            onClick={toggleListBox}
          ></div>
          <ListBoxWrapper open={listBox} onOpenCompose={() => onOpenComposeGlobal('vanbannoibo')} />
        </div>
        <div className="lg:flex-1 space-y-3">
          <TableDocument
            title="Danh sách văn bản"
            primaryKey="id_van_ban"
            FiltersComponent={<PopupFilter />}
            SearchFile={
              <InputSearchFile
                openSearchFile={openSearchFile}
                setOpenSearchFile={setOpenSearchFile}
              />
            }
            RowActionComponent={
              lengthSelectedIds > 0 ? (
                <RowActionCheckbox selectedIds={[...selectedIds]} menu={menuActionCheckboxs()} />
              ) : undefined
            }
            columns={customColumns}
            initVisibleColumns={filters.initial_visible_columns}
            page={filters.page}
            totalRecordFiltered={totalRecordFiltered}
            data={vanbannoiboData as Record<string, unknown>[]}
            onPageChange={setPage}
            length={length}
            setlength={setlength}
            totalRecord={totalRecord}
            onSearchChange={onSearchChange}
            onClickRow={onClickRow}
            selectedRow={selectedRow}
            isLoading={isLoadingVanbannoibo || isFetchingVanbannoibo}
            handleSelectedIds={handleSelectedIds}
            selectedIds={selectedIds}
            indexRow={indexRow}
            setIndexRow={setIndexRow}
          />
        </div>
        {openSearchFile && (
          <div className="lg:min-w-sm">
            <BoxSearchFile
              data={allFiles}
              onLoadMore={fetchNextPage}
              hasMore={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              setSearchFile={setSearchFile}
              searchFile={searchFile}
              setFilterFile={setFilterFile}
              filterFile={filterFile}
            />
          </div>
        )}
        <ConfirmModal
          isOpen={isOpenMoveTrash}
          onClose={onCloseMoveTrash}
          onConfirm={confirmMoveToTrash}
          title="Xác nhận chuyển vào thùng rác"
          content="Bạn có chắc chắn muốn chuyển các văn bản đã chọn vào thùng rác?"
          isLoading={isMovingTrash}
          isDanger={true}
        />
        <ConfirmModal
          isOpen={isOpenRestore}
          onClose={onCloseRestore}
          onConfirm={confirmRestore}
          title="Xác nhận khôi phục"
          content="Bạn có chắc chắn muốn khôi phục các văn bản đã chọn?"
          isLoading={isRestoring}
          confirmText="Khôi phục"
        />
      </div>
      <DrawerDocument
        open={openDetail}
        isLoading={detailIsLoading || detailIsFetching}
        onClose={() => setOpenDetail(false)}
        data={detailData}
        indexRow={indexRow}
        setIndexRow={setIndexRow}
        actionClone={handleClone}
      />

      <ModalCompose
        title="Sửa văn bản nội bộ"
        isOpenCompose={isOpenComposeEdit}
        onClose={() => {
          onCloseComposeEdit()
          setFormData({})
          setFileGroups({})
          setCreate({
            ids_co_quan: '',
            ids_ql_nguoi_dung: '',
            ids_don_vi_xu_ly: ''
          })
        }}
        size="5xl"
        fileGroups={fileGroups}
        handleSubmitApi={(_id, data) => vanbannoiboAxios.update(String(editingId), data!)}
        onSubmitSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ['vanbannoibo']
          })
          setCreate({
            ids_co_quan: '',
            ids_ql_nguoi_dung: '',
            ids_don_vi_xu_ly: ''
          })
          setFormData({})
        }}
        formData={formData}
      >
        <FormVanbannoibo
          formData={formData}
          setFormData={setFormData}
          onFilesChange={onFilesChange}
          existingFiles={existingFiles}
        />
      </ModalCompose>
    </div>
  )
}

function ActionRowDocument({
  data,
  onOpenComposeEdit = () => {},
  onMoveToTrash,
  onRestore,
  isTrashView
}: {
  data: Record<string, unknown>
  onMoveToTrash?: (id: string | number) => void
  onRestore?: (id: string | number) => void
  onOpenComposeEdit?: () => void
  isTrashView?: boolean
}): React.JSX.Element {
  if (!data) return <></>
  const id = data.id_van_ban as string | number

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-1 w-0 overflow-hidden group-hover:w-auto transition-all duration-500">
        <Tooltip>
          <Button
            isIconOnly
            className="rounded-full"
            size="sm"
            variant="ghost"
            onPress={() => {
              onOpenComposeEdit()
            }}
          >
            <Pencil size={14} />
          </Button>
          <Tooltip.Content className="capitalize bg-slate-100 rounded-none px-2 py-1 text-xs text-gray-700">
            Sửa
          </Tooltip.Content>
        </Tooltip>
        {!isTrashView ? (
          <Tooltip>
            <Button
              isIconOnly
              className="rounded-full text-danger"
              size="sm"
              variant="ghost"
              onPress={() => {
                onMoveToTrash?.(id)
              }}
            >
              <Trash2 size={14} />
            </Button>
            <Tooltip.Content className="capitalize bg-slate-100 rounded-none px-2 py-1 text-xs text-gray-700">
              Chuyển vào thùng rác
            </Tooltip.Content>
          </Tooltip>
        ) : (
          <Tooltip>
            <Button
              isIconOnly
              className="rounded-full text-primary"
              size="sm"
              variant="ghost"
              onPress={() => {
                onRestore?.(id)
              }}
            >
              <RotateCcw size={14} />
            </Button>
            <Tooltip.Content className="capitalize bg-slate-100 rounded-none px-2 py-1 text-xs text-gray-700">
              Khôi phục
            </Tooltip.Content>
          </Tooltip>
        )}
      </div>
      <span className="text-slate-400 dark:text-slate-500 text-[10px] truncate">
        {date('vi', data.ngay_tao as string)}
      </span>
      {Array.isArray(data.files) && data.files.length > 0 && (
        <Paperclip className="size-3 text-slate-400 dark:text-slate-500" />
      )}
    </div>
  )
}

function InputSearchFile({
  openSearchFile,
  setOpenSearchFile
}: {
  openSearchFile: boolean
  setOpenSearchFile: (value: boolean) => void
}) {
  return null
}
