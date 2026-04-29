import { AlertDialog, Button, Chip, cn, Tooltip, toast } from '@heroui-v3/react'
import { useLayoutStore } from '@renderer/store/useLayoutStore'
import {
  ArchiveRestore,
  Check,
  Clock,
  Copy,
  Delete,
  MessageSquare,
  Pencil,
  Plus,
  RotateCcw,
  Trash2
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { vanbandiAxios } from '../../api/documents/vanbandiAxios'
import ListBoxWrapper from './components/ListBox/ListBoxWrapper'
import TableDocument from './components/table/TableDocument'
// import { truncateMiddle } from '@renderer/utils/string'
// import OfficeIcon from '@renderer/components/OfficeIcon'
import { customDataApi } from '@renderer/api/callApi'
import { useVanbandiStore } from '@renderer/store/useVanbanStore'
import { getStatusDocument, STATUS_VBDI_MAP } from '../../utils/documents/statusVanban'
import DrawerDocument from './components/drawer/DrawerDocument'
import FormVanbandi from './components/form/FormVanbandi'
import ModalCompose from './components/modal/ModalCompose'
import { PopupFilter } from './components/table/Filters/PopupFilter'
import YearFilter from './components/table/Filters/YearFilter'
import RowActionCheckbox from './components/table/RowActionCheckbox'
// import { enscrypt } from '@renderer/utils/documents/userPreview'
// import openPopout from '@renderer/utils/openPopout'
import ContextMenu from '@renderer/components/ContextMenu'
import { useContextMenu } from '@renderer/hooks/useContextMenu'
import { useTableSort } from '@renderer/hooks/useTableSort'
import { ExistingFile } from '@renderer/shared/CommonInterface'
import { useComposeStore } from '@renderer/store/useComposeStore'
import { date } from '@renderer/utils/formatDate'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import BoxSearchFile from './components/BoxSearchFile'
import FileChip from './components/table/FileChip'

export const saoChepTinNhanZalo = (raw: string): void => {
  // Bước 1: Chuẩn hóa xuống dòng và khoảng trắng thừa
  let text = raw
    .replace(/\r\n|\n/g, '\n')
    .replace(/\s{2,}/g, ' ')
    .trim()

  // Bước 2: Xử lý trường hợp 2 dòng "Link:" — xóa dòng dư không có URL
  text = text.replace(/Link:\s*\n(?=Link:\s*http)/g, '')

  // Bước 3: Định dạng "Myoffice:" hoặc "Myoffice/Email:" => xuống dòng sau dấu :
  text = text
    .replace(/Kính chào Quý Thầy\/Cô!/, 'Kính chào Quý Thầy/Cô!\n')
    .replace(/(MyOffice\/Email:|MyOffice:|Myoffice\/Email:|Myoffice:)\s*/g, '$1\n')
    .replace(/(http[^\s]+)/, '$1')

  // Bước 4: Định dạng danh sách đơn vị nhận nếu còn bị dính
  const donViRegex = /=> Đơn vị nhận:\s*([^\n]+?)Kính nhờ/i
  const match = text.match(donViRegex)

  if (match) {
    const rawDonVi = match[1]
    const units = rawDonVi
      .split('+')
      .map((u) => u.trim())
      .filter(Boolean)
      .map((u) => u.trim())
    const unitList = units.join(', ')

    text = text.replace(donViRegex, `=> Đơn vị nhận: ${unitList}\nKính nhờ`)
  }

  // Bước 5: Tách dòng "Cảm ơn..."
  text = text.replace(/(vui lòng phản hồi lại giúp em ạ\.)(\s*)Cảm ơn/i, '$1\nCảm ơn')

  // Bước 6: Dọn sạch khoảng trắng đầu dòng
  text = text
    .split('\n')
    .map((line) => line.trimStart())
    .join('\n')

  // Bước 7: Copy vào clipboard
  navigator.clipboard
    .writeText(text)
    .then(() => {
      setTimeout(() => {
        toast('Đã sao chép nội dung tin nhắn Zalo', { variant: 'success' })
      }, 4000)
    })
    .catch((err) => {
      console.error('Could not copy text: ', err)
      toast('Lỗi khi sao chép', { variant: 'danger' })
    })
}

const COLOR_MAP: Record<string, string> = {
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
  green: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
  red: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100',
  teal: 'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100'
}

export default function VanbandiPage(): React.JSX.Element {
  const queryClient = useQueryClient()
  const { listBox, toggleListBox } = useLayoutStore()
  const location = useLocation()

  const { filters, setFilters, setStatisticals } = useVanbandiStore()
  const [page, setPage] = useState(filters.page ?? 1)
  const [length, setlength] = useState(filters.length ?? 10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [totalRecordFiltered, setTotalRecordFiltered] = useState(0)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([])
  const [existingFilesInternal, setExistingFilesInternal] = useState<ExistingFile[]>([])
  const [indexRow, setIndexRow] = useState<number>(-1)

  // Search văn bản đến
  const onSearchChange = (value: string): void => {
    setFilters({ searchValue: value, page: 1 })
  }
  // Cập nhật lại filter khi page hoặc length thay đổi
  useEffect(() => {
    setFilters({ page, length })
    setIndexRow(-1)
  }, [page, length])

  const [selectedRow, setSelectedRow] = useState<string | number>('')
  const [openDetail, setOpenDetail] = useState(false)
  const [openSearchFile, setOpenSearchFile] = useState(false)
  const { onOpen } = useComposeStore()

  // Auto open Create Modal if passed in navigation state
  useEffect(() => {
    if (location.state && (location.state as any).openCreateModal) {
      onOpen('vanbandi')
      // Clear the state
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const handleExport = () => {
    return vanbandiAxios.export(customDataApi(filters)).then((response) => {
      window.open(response.data, '_blank')
    })
  }

  const [isOpenComposeEdit, setIsOpenComposeEdit] = useState(false)
  const onOpenComposeEdit = useCallback(() => setIsOpenComposeEdit(true), [])
  const onCloseComposeEdit = useCallback(() => setIsOpenComposeEdit(false), [])
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())
  const [idsToRecall, setIdsToRecall] = useState<(string | number) | (string | number)[] | null>(
    null
  )
  const [idsToRestore, setIdsToRestore] = useState<(string | number) | (string | number)[] | null>(
    null
  )
  const [isRecalling, setIsRecalling] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  const [isOpenRecall, setIsOpenRecall] = useState(false)
  const onOpenRecall = useCallback(() => setIsOpenRecall(true), [])
  const onCloseRecall = useCallback(() => setIsOpenRecall(false), [])

  const [isOpenImport, setIsOpenImport] = useState(false)
  const onOpenImport = useCallback(() => setIsOpenImport(true), [])
  const onCloseImport = useCallback(() => setIsOpenImport(false), [])
  const [importFile, setImportFile] = useState<File | null>(null)

  const [isOpenRestore, setIsOpenRestore] = useState(false)
  const onOpenRestore = useCallback(() => setIsOpenRestore(true), [])
  const onCloseRestore = useCallback(() => setIsOpenRestore(false), [])

  const [idsToDelete, setIdsToDelete] = useState<(string | number) | (string | number)[] | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpenDelete, setIsOpenDelete] = useState(false)
  const onOpenDelete = useCallback(() => setIsOpenDelete(true), [])
  const onCloseDelete = useCallback(() => setIsOpenDelete(false), [])

  //handle selectedids
  const handleSelectedIds = useCallback((ids: Set<string | number>) => {
    setSelectedIds(ids)
  }, [])

  //Sort
  const { initialSortDescriptors, handleSortChange } = useTableSort({
    orders: filters.orders,
    setFilters
  })

  // Context Menu
  const { menu, handleContextMenu, handleCloseMenu } = useContextMenu(() => {
    setSelectedRow('')
    setIndexRow(-1)
  })
  const containerRef = useRef<HTMLDivElement>(null)

  const onContextMenuRow = (e: React.MouseEvent, row: any) => {
    e.preventDefault()
    setSelectedRow(row['id_van_ban'] || row['id'])

    handleContextMenu(e, row)

    const idx = (vanbandiData as any[])?.findIndex((r) => r.id_van_ban === row.id_van_ban) ?? -1
    if (idx !== -1) setIndexRow(idx)
  }

  const menuItems = (row: any) => {
    const items: any[] = [
      {
        label: 'Sao chép văn bản',
        icon: <Copy size={16} />,
        onClick: () => handleClone(row.id_van_ban)
      },
      {
        label: 'Sao chép tin nhắn Zalo',
        icon: <MessageSquare size={16} />,
        onClick: () => {
          if (row.noi_dung_tin_nhan_zalo) {
            saoChepTinNhanZalo(row.noi_dung_tin_nhan_zalo)
          } else {
            toast('Không tìm thấy nội dung tin nhắn Zalo', { variant: 'danger' })
          }
        }
      },
      {
        label: 'separator'
      },
      {
        label: 'Sửa văn bản',
        icon: <Pencil size={16} />,
        onClick: async () => {
          const id = row['id_van_ban'] as string | number
          const res = await vanbandiAxios.show(id)
          if (res.status == 200) {
            const data = res.data || {}
            setFormData({
              ...data,
              ids_hinh_thuc: (data.e_vb_hinh_thuc || []).map((item) => item.id_hinh_thuc).join(','),
              file_ban_hanh_old: data.files,
              file_noi_bo_old: data.files_tchc,
              ids_ql_nguoi_dung: data.e_nguoi_xu_ly.map((item) => item.id_nguoi_xu_ly).join(','),
              ids_don_vi_xu_ly: [...new Set(data.e_nguoi_xu_ly.map((item) => item.id_don_vi))].join(
                ','
              ),
              ids_co_quan: data.e_vb_co_quan.map((item) => item.id_co_quan).join(',')
            })

            const existingFiles = data.files.map((f) => ({
              id: Number(f.id_file_dinh_kem),
              name: f.ten_file_goc,
              size: convertSize(f.dung_luong),
              url: f.duong_dan,
              type: guessMimeType(f.ten_file_goc)
            }))

            setExistingFiles(existingFiles)

            const existingFilesInternal = data.files_tchc.map((f) => ({
              id: Number(f.id_file_dinh_kem),
              name: f.ten_file_goc,
              size: convertSize(f.dung_luong),
              url: f.duong_dan,
              type: guessMimeType(f.ten_file_goc)
            }))

            setExistingFilesInternal(existingFilesInternal)
          }

          setEditingId(id)
          onOpenComposeEdit()
        }
      },
      {
        label: 'Xác nhận hoàn thành',
        icon: <Check size={16} />,
        onClick: async () => {
          const response = await vanbandiAxios.update_by_key(row.id_van_ban, {
            key: 'trang_thai',
            value: STATUS_VBDI_MAP.HOAN_THANH.value
          })

          if (response.status === 200) {
            toast('Xác nhận hoàn thành thành công', { variant: 'success' })
            queryClient.invalidateQueries({
              queryKey: ['vanbandi']
            })
          } else {
            toast('Xác nhận hoàn thành thất bại', { variant: 'danger' })
          }
        }
      },
      row.deleted_at
        ? {
            label: 'Khôi phục',
            icon: <ArchiveRestore size={16} />,
            onClick: () => handleRestore(row.id_van_ban)
          }
        : {
            label: 'Thu hồi',
            icon: <RotateCcw size={16} />,
            onClick: () => handleRecall(row.id_van_ban)
          }
    ]

    if (!row.deleted_at) {
      items.push({
        label: 'Chuyển vào thùng rác',
        icon: <Trash2 size={16} className="text-red-500" />,
        className: 'text-red-500',
        onClick: () => handleDelete(row.id_van_ban)
      })
    }

    return items
  }

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
      console.log(
        'File đã bị xóa: ',
        deletedFiles.map((f) => f.name)
      )

      const deletedFileNames = deletedFiles.map((f) => f.name)

      // Duyệt tất cả key trong formData (files, files_tchc, file_ban_hanh_old…)
      const listFileOldName = ['file_ban_hanh_old', 'file_noi_bo_old']
      Object.keys(formData).forEach((key) => {
        if (!listFileOldName.includes(key)) return

        const value = formData[key]
        if (Array.isArray(value)) {
          // Tìm file trong từng mảng của formData
          const matched = value.filter((item) => deletedFileNames.includes(item.ten_file_goc))

          const notMatched = value.filter((item) => !deletedFileNames.includes(item.ten_file_goc))

          if (matched.length > 0) {
            // console.log(`🔥 FormData.${ key } có file tương ứng bị xoá: `, matched)
          }

          if (notMatched.length > 0) {
            // console.log(`🔥 FormData.${ key } có file tương ứng còn lại`, notMatched)
            setFormData((p) => ({ ...p, [key]: notMatched }))
          }
        }
      })
    }

    setFileGroups((p) => ({ ...p, [name]: files }))
  }

  // Preview file
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

  const handleDelete = (ids: (string | number) | (string | number)[]) => {
    setIdsToDelete(Array.isArray(ids) ? ids : [ids])
    onOpenDelete()
  }

  const confirmDelete = async () => {
    if (!idsToDelete) return
    setIsDeleting(true)
    const payload = Array.isArray(idsToDelete) ? idsToDelete : [idsToDelete]
    await vanbandiAxios
      .moveToTrash({ ids: payload })
      .then((response) => {
        if (response.status === 200) {
          vanbandiRefetch().then(() => {
            if (response.success) {
              toast(response.message || 'Đã chuyển vào thùng rác', { variant: 'success' })
            } else {
              toast(response.message || 'Chuyển vào thùng rác thất bại', { variant: 'danger' })
            }
          })
          setSelectedIds(new Set())
        }
      })
      .finally(() => {
        setIsDeleting(false)
        onCloseDelete()
        setIdsToDelete(null)
      })
  }

  const handleRecall = (ids: (string | number) | (string | number)[]) => {
    setIdsToRecall(Array.isArray(ids) ? ids : [ids])
    onOpenRecall()
  }

  const confirmRecall = async () => {
    if (!idsToRecall) return
    setIsRecalling(true)
    await vanbandiAxios
      .revoke({ ids: idsToRecall })
      .then((response) => {
        if (response.success) {
          vanbandiRefetch().then(() => {
            toast('Thu hồi văn bản thành công', { variant: 'success' })
          })
          setSelectedIds(new Set())
        } else {
          toast(`Thu hồi văn bản thất bại: ${response.message || ''}`, { variant: 'danger' })
        }
      })
      .finally(() => {
        setIsRecalling(false)
        onCloseRecall()
        setIdsToRecall(null)
      })
  }

  const handleRestore = (ids: (string | number) | (string | number)[]) => {
    setIdsToRestore(Array.isArray(ids) ? ids : [ids])
    onOpenRestore()
  }

  const confirmRestore = async () => {
    if (!idsToRestore) return
    setIsRestoring(true)
    await vanbandiAxios
      .restore({ ids: idsToRestore })
      .then((response) => {
        if (response.success) {
          vanbandiRefetch().then(() => {
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
    await vanbandiAxios.cloneVanban(id).then((response) => {
      if (response.success) {
        toast('Sao chép văn bản thành công', { variant: 'success' })
        vanbandiRefetch()
        setSelectedRow(response.data.id_van_ban)
      } else {
        toast('Sao chép văn bản thất bại', { variant: 'danger' })
      }
    })
  }

  const onClickRow = async (row: object): Promise<void> => {
    const id = row['id_van_ban'] as string | number
    setOpenDetail(true)
    setSelectedRow(id)

    // Tìm index của row này để đồng bộ highlight
    const idx = (vanbandiData as any[])?.findIndex((r) => r.id_van_ban === id) ?? -1
    if (idx !== -1) setIndexRow(idx)
  }

  // Tùy chỉnh columns
  const customColumns = filters.tableColumn.map((col) => {
    switch (col.uid) {
      case 'ten_nguoi_tao':
        return {
          ...col,
          className: 'w-22 hidden lg:table-cell',
          render: (value, row) => (
            <div className="text-zinc-500 dark:text-zinc-400 overflow-hidden text-ellipsis whitespace-nowrap w-30">
              {value}
              <div>
                <small>{row.email_nguoi_tao}</small>
              </div>
            </div>
          )
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
          render: (value, row) => {
            const status = getStatusDocument(value, row.loai_van_ban || '2')

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
          render: (value, row) => {
            return (
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
                    {(row.files?.length > 0 || row.files_tchc?.length > 0) && (
                      <FileChip
                        files={row.files}
                        otherFiles={row.files_tchc}
                        onClickRow={() => onClickRow(row)}
                      />
                    )}
                  </div>
                </div>
                <span>
                  <ActionRowDocument
                    data={row}
                    onDelete={handleDelete}
                    onRecall={handleRecall}
                    onRestore={handleRestore}
                    onOpenComposeEdit={async () => {
                      const id = row['id_van_ban'] as string | number
                      const res = await vanbandiAxios.show(id)
                      if (res.status == 200) {
                        const data = res.data || {}
                        setFormData({
                          ...data,
                          ids_hinh_thuc: (data.e_vb_hinh_thuc || [])
                            .map((item) => item.id_hinh_thuc)
                            .join(','),
                          file_ban_hanh_old: data.files,
                          file_noi_bo_old: data.files_tchc,
                          ids_ql_nguoi_dung: data.e_nguoi_xu_ly
                            .map((item) => item.id_nguoi_xu_ly)
                            .join(','),
                          ids_don_vi_xu_ly: [
                            ...new Set(data.e_nguoi_xu_ly.map((item) => item.id_don_vi))
                          ].join(','),
                          ids_co_quan: data.e_vb_co_quan.map((item) => item.id_co_quan).join(',')
                        })

                        const existingFiles = data.files.map((f) => ({
                          id: Number(f.id_file_dinh_kem),
                          name: f.ten_file_goc,
                          size: convertSize(f.dung_luong),
                          url: f.duong_dan, // hoặc API cung cấp URL decode
                          type: guessMimeType(f.ten_file_goc)
                        }))

                        setExistingFiles(existingFiles)

                        // console.log('existingFiles: ', existingFiles)

                        const existingFilesInternal = data.files_tchc.map((f) => ({
                          id: Number(f.id_file_dinh_kem),
                          name: f.ten_file_goc,
                          size: convertSize(f.dung_luong),
                          url: f.duong_dan, // hoặc API cung cấp URL decode
                          type: guessMimeType(f.ten_file_goc)
                        }))

                        setExistingFilesInternal(existingFilesInternal)
                      }

                      setEditingId(id)
                      onOpenComposeEdit()
                    }}
                  />
                </span>
              </div>
            )
          }
        }

      default:
        return col
    }
  })

  // useQuery danh sách văn bản
  const {
    data: vanbandiData = [],
    isLoading: vanbandiIsLoading,
    isFetching: vanbandiIsFetching,
    refetch: vanbandiRefetch
  } = useQuery({
    queryKey: ['vanbandi', filters, length],
    queryFn: () => {
      return vanbandiAxios.fetch(customDataApi(filters)).then((response) => {
        setTotalRecord(response.recordsTotal || 0)
        setTotalRecordFiltered(response.recordsFiltered || 0)

        if (response.thoi_han) {
          setStatisticals([
            { classify: 'all', count: response.thoi_han.all || 0 },
            { classify: 'luu_tru', count: response.thoi_han.luu_tru || 0 },
            { classify: 'cho_xu_ly', count: response.thoi_han.cho_xu_ly || 0 },
            { classify: 'hoan_thanh', count: response.thoi_han.hoan_thanh || 0 },
            { classify: 'thu_hoi', count: response.thoi_han.thu_hoi || 0 }
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
      return vanbandiAxios.show(selectedRow!).then((response) => response.data || null)
    },
    enabled: !!selectedRow && openDetail // Chỉ chạy khi có selectedRow và drawer đang mở
  })

  // Xử lý khi indexRow thay đổi - cập nhật selectedRow
  useEffect(() => {
    if (indexRow >= 0 && vanbandiData && vanbandiData[indexRow]) {
      const row = vanbandiData[indexRow]
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
      if (!vanbandiData || (vanbandiData as any[]).length === 0) return

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
        setIndexRow((prev) => (prev < (vanbandiData as any[]).length - 1 ? prev + 1 : prev))
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
  }, [vanbandiData, indexRow, openDetail])

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
  const menuActionCheckboxs = () => {
    const items = [
      {
        label: 'Chuyển vào thùng rác mục đã chọn',
        icon: <Delete size={15} />,
        onClick: () => {
          handleDelete([...selectedIds])
          setSelectedIds(new Set())
        }
      }
    ]

    if (filters.selectedClassify === 'thu_hoi') {
      items.unshift({
        label: 'Khôi phục mục đã chọn',
        icon: <RotateCcw size={14} className="text-teal-500" />,
        onClick: () => {
          handleRestore(Array.from(selectedIds))
          setSelectedIds(new Set())
        }
      })
    } else {
      items.unshift({
        label: 'Thu hồi mục đã chọn',
        icon: <RotateCcw size={14} className="text-orange-500" />,
        onClick: () => {
          handleRecall(Array.from(selectedIds))
          setSelectedIds(new Set())
        }
      })
    }

    return items
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
      vanbandiAxios
        .files({
          page: pageParam,
          limit: 20,
          search: searchFile,
          fileType: filterFile.fileType,
          author: filterFile.author,
          date: filterFile.date
        })
        .then((res) => {
          // API trả về object với structure: { status, message, page, limit, data: [...] }
          // Cần lấy res.data.data thay vì res.data
          const files = Array.isArray(res.data) ? res.data : res.data?.data || []
          return files
        }),
    getNextPageParam: (lastPage, pages) => (lastPage?.length ? pages.length + 1 : undefined)
  })

  const handleImport = () => {
    if (!importFile) {
      return Promise.resolve()
    }

    return vanbandiAxios.import({ file_excel: importFile }).then((response) => {
      if (response.success) {
        toast(response.message || 'Import thành công', { variant: 'success' })
        onCloseImport()
        setImportFile(null)
        vanbandiRefetch()
      } else {
        toast(response.message || 'Import thất bại', { variant: 'danger' })
      }
    })
  }

  const allFiles = dataFiles?.pages.flat() || []

  useEffect(() => {
    const timeout = setTimeout(() => {
      refetch()
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchFile, filterFile])

  useEffect(() => {
    console.log('formData: ', formData)
  }, [formData])

  return (
    <div className="space-y-2">
      <div className="lg:flex gap-0">
        <div className="">
          <div className="block xl:hidden">
            <Button
              isIconOnly
              variant="primary"
              onPress={toggleListBox}
              className="rounded-full text-white fixed z-10 right-4 bottom-7 shadow-lg w-15 h-15"
            >
              <Plus />
            </Button>
          </div>
          <div
            className={`fixed xl:hidden top-0 left-0 right-0 bottom-0 bg-gray-500/50 dark:bg-gray-900/50 z-20 ${listBox ? 'block' : 'hidden'}`}
            onClick={toggleListBox}
          ></div>
          <ListBoxWrapper open={listBox} onOpenCompose={() => onOpen('vanbandi')} />
        </div>
        <div ref={containerRef} className="lg:flex-1 space-y-3 relative">
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
            // DataIO={<DataIO onExport={handleExport} onImport={onOpenImport} />}
            RowActionComponent={
              selectedIds.size > 0 ? (
                <RowActionCheckbox selectedIds={[...selectedIds]} menu={menuActionCheckboxs()} />
              ) : undefined
            }
            columns={customColumns}
            initVisibleColumns={filters.initial_visible_columns}
            page={filters.page}
            totalRecordFiltered={totalRecordFiltered}
            data={(vanbandiData as Record<string, unknown>[]) || []}
            onPageChange={setPage}
            length={length}
            setlength={setlength}
            totalRecord={totalRecord}
            onSearchChange={onSearchChange}
            onClickRow={onClickRow}
            selectedRow={selectedRow}
            isLoading={vanbandiIsLoading || vanbandiIsFetching}
            handleSelectedIds={handleSelectedIds}
            selectedIds={selectedIds}
            onSortChange={handleSortChange}
            indexRow={indexRow}
            setIndexRow={setIndexRow}
            initialSortDescriptors={initialSortDescriptors}
            onContextMenuRow={onContextMenuRow}
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
        title="Sửa văn bản đi"
        isOpenCompose={isOpenComposeEdit}
        onClose={() => {
          onCloseComposeEdit()
          setFormData({})
          setFileGroups({})
        }}
        size="5xl"
        fileGroups={fileGroups}
        handleSubmitApi={(_id, data) => vanbandiAxios.update(String(editingId), data!)}
        onSubmitSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ['vanbandi']
          })
          queryClient.invalidateQueries({
            queryKey: ['detail']
          })
          setFormData({})
          setFileGroups({})
        }}
        formData={formData}
      >
        <FormVanbandi
          formData={formData}
          setFormData={setFormData}
          onFilesChange={onFilesChange}
          existingFiles={existingFiles}
          existingFilesInternal={existingFilesInternal}
          fileGroups={fileGroups}
        />
      </ModalCompose>

      {/* Modal Thu hồi */}
      <AlertDialog>
        <AlertDialog.Backdrop isOpen={isOpenRecall} onOpenChange={onCloseRecall}>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[400px]">
              <AlertDialog.Header className="flex flex-col gap-1">
                <AlertDialog.Heading>Xác nhận thu hồi</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>
                  Bạn có chắc chắn muốn thu hồi văn bản này? Hành động này sẽ xóa toàn bộ quá trình
                  xử lý và không thể hoàn tác trọn vẹn.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button variant="ghost" onPress={onCloseRecall}>
                  Hủy
                </Button>
                <Button variant="danger" onPress={confirmRecall}>
                  Xác nhận
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>

      {/* Modal Khôi phục */}
      <AlertDialog>
        <AlertDialog.Backdrop isOpen={isOpenRestore} onOpenChange={onCloseRestore}>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[400px]">
              <AlertDialog.Header className="flex flex-col gap-1">
                <AlertDialog.Heading>Xác nhận khôi phục</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>Bạn có chắc chắn muốn khôi phục văn bản này?</p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button variant="ghost" onPress={onCloseRestore}>
                  Hủy
                </Button>
                <Button variant="primary" onPress={confirmRestore}>
                  Xác nhận
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>

      {/* Modal Xóa */}
      <AlertDialog>
        <AlertDialog.Backdrop isOpen={isOpenDelete} onOpenChange={onCloseDelete}>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[400px]">
              <AlertDialog.Header className="flex flex-col gap-1">
                <AlertDialog.Heading>Xác nhận chuyển vào thùng rác</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>Bạn có chắc chắn muốn chuyển văn bản này vào thùng rác?</p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button variant="ghost" onPress={onCloseDelete}>
                  Hủy
                </Button>
                <Button variant="danger" onPress={confirmDelete}>
                  Xác nhận
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>

      {/* <ImportModal
        isOpenImport={isOpenImport}
        onCloseImport={onCloseImport}
        FileImportVanBan={MauNhapVanBanDi}
        importFile={importFile}
        setImportFile={setImportFile}
        onConfirm={() => {
          handleImport()
        }}
      /> */}
    </div>
  )
}

function ActionRowDocument({
  data,
  onOpenComposeEdit = () => {},
  onDelete,
  onRestore
}: {
  data: Record<string, unknown>
  onDelete: (id: string | number) => void
  onRecall: (id: string | number) => void
  onRestore: (id: string | number) => void
  onOpenComposeEdit?: () => void
}): React.JSX.Element {
  if (!data) return <></>
  const id = data.id_van_ban as string | number

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-1 w-0 overflow-hidden group-hover:w-auto transition-all duration-500">
        <Tooltip>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            className="rounded-full"
            onPress={() => {
              onOpenComposeEdit()
            }}
          >
            <Pencil size={14} />
          </Button>
          <Tooltip.Content className="capitalize bg-slate-100 px-2 py-1 rounded-sm text-xs">
            Sửa
          </Tooltip.Content>
        </Tooltip>

        {(data.noi_dung_tin_nhan_zalo as string) && (
          <Tooltip>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              className="rounded-full"
              onPress={() => saoChepTinNhanZalo(data.noi_dung_tin_nhan_zalo as string)}
            >
              <Copy size={14} />
            </Button>
            <Tooltip.Content className="capitalize bg-slate-100 px-2 py-1 rounded-sm text-xs">
              Tin nhắn Zalo
            </Tooltip.Content>
          </Tooltip>
        )}

        {!data.deleted_at ? (
          <>
            <Tooltip>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                className="rounded-full"
                onPress={() => {
                  onDelete(id)
                }}
              >
                <Trash2 size={14} className="text-red-500" />
              </Button>
              <Tooltip.Content className="capitalize bg-slate-100 px-2 py-1 rounded-sm text-xs">
                Chuyển vào thùng rác
              </Tooltip.Content>
            </Tooltip>
          </>
        ) : (
          <Tooltip>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              className="rounded-full"
              onPress={() => onRestore(id)}
            >
              <ArchiveRestore size={14} className="text-teal-500" />
            </Button>
            <Tooltip.Content className="capitalize bg-slate-100 px-2 py-1 rounded-sm text-xs">
              Khôi phục
            </Tooltip.Content>
          </Tooltip>
        )}
      </div>
      <span className="text-slate-400 dark:text-slate-500 text-[10px] truncate">
        {date('vi', data.ngay_ky as string)}
      </span>
      {/* {data.files?.length > 0 && (
        <Paperclip className="size-3 text-slate-400 dark:text-slate-500" />
      )} */}
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
