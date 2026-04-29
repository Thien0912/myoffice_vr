import { toast } from "@heroui-v3/react"
import { Button, Chip, Tooltip, useDisclosure } from '@heroui/react'
import { convertSize, guessMimeType } from '@renderer/api/danhmuc/hopDong'
import { hopdongAxios } from '@renderer/api/hr/hopdongAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import { DataGrid, DataGridColumn } from '@renderer/components/DataGrid'
import OfficeIcon from '@renderer/components/OfficeIcon'
import { useSidePanel } from '@renderer/components/side-panel'
import FormHopDong from '@renderer/pages/hr/contract/FormHopdong'
import { ExistingFile } from '@renderer/shared/CommonInterface'
import { useHopdongStore } from '@renderer/store/useProfileStore'
import { enscrypt } from '@renderer/utils/documents/userPreview'
import openPopout from '@renderer/utils/openPopout'
import { truncateMiddle } from '@renderer/utils/string'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit, Plus, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { dispatchSectionChanged, SECTION_EVENTS } from '../../constants/sectionEvents'

interface HopdongData {
  id_hop_dong: string
  id_nhan_vien: string
  ten_hop_dong: string
  so_hop_dong: string
  ngay_bat_dau: string
  ngay_ket_thuc: string | null
  muc_luong: string | null
  luong_co_ban: string | null
  muc_luong_bao_hiem: string | null
  id_ty_le_bao_hiem: string | null
  loai_hop_dong: string
  dang_hieu_luc: string
  files_hop_dong?: any[]
  // Thêm các trường khác nếu cần thiết
}

interface HopdongProps {
  hopDongList?: HopdongData[]
  user?: {
    id_nhan_vien: string
    id_vi_tri_cong_viec: string
    id_don_vi_cong_tac: string
    ma_nhan_vien: string
  }
}

export default function Hopdong({ hopDongList, user }: HopdongProps) {
  // console.log('User passed to Hopdong:', user)
  const queryClient = useQueryClient()
  const { openPanel, closePanel, setBridgedToDrawer, updateFileGroups } = useSidePanel()

  const {
    filters,
    // setFilters,
    columnWidths,
    setColumnWidth,
    // pinnedColumns,
    setPinnedColumn,
    sortDescriptors,
    setSortDescriptors
  } = useHopdongStore()
  const [data, setData] = useState<HopdongData[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [fileGroups, setFileGroups] = useState<Record<string, File[]>>({})
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([])

  // Confirm Modal State
  const [deletingId, setDeletingId] = useState<(string | number) | (string | number)[] | null>(null)
  const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()

  const onFilesChange = (name: string, files: File[]) => {
    const oldFiles = fileGroups[name] || []
    const deletedFiles = oldFiles.filter(
      (old) => !files.some((f) => f.name === old.name && f.size === old.size)
    )

    if (deletedFiles.length > 0) {
      const deletedFileNames = deletedFiles.map((f) => f.name)

      const listFileOldName = ['files_dinh_kem_old']
      Object.keys(formData).forEach((key) => {
        if (!listFileOldName.includes(key)) return

        const value = formData[key]
        if (Array.isArray(value)) {
          const matched = value.filter((item) => deletedFileNames.includes(item.file_name))
          const notMatched = value.filter((item) => !deletedFileNames.includes(item.file_name))

          // if (matched.length > 0) {}
          if (notMatched.length > 0) {
            setFormData((p) => ({ ...p, [key]: notMatched }))
          }
        }
      })
    }

    setFileGroups((p) => ({ ...p, [name]: files }))
  }

  const {
    data: responseData,
    isLoading: isLoadingHopdong,
    // isFetching: isFetchingHopdong,
    refetch: hopdongRefetch
  } = useQuery<HopdongData[]>({
    queryKey: [
      'hopdongData',
      filters.page,
      filters.length,
      filters.searchValue,
      filters,
      sortDescriptors
    ],
    queryFn: async () => {
      const payload = {
        searchValue: filters.searchValue,
        searchKey: JSON.stringify({
          searchValue: filters.searchValue,
          selectedClassify: filters.selectedClassify || 'all',
          so_hop_dong: 'so_hop_dong' in filters ? filters.so_hop_dong : '',
          loai_hop_dong: 'loai_hop_dong' in filters ? filters.loai_hop_dong : '',
          ngay_ky_tu: 'ngay_ky_tu' in filters ? filters.ngay_ky_tu : '',
          ngay_ky_den: 'ngay_ky_den' in filters ? filters.ngay_ky_den : '',
          ngay_ket_thuc_tu: 'ngay_ket_thuc_tu' in filters ? filters.ngay_ket_thuc_tu : '',
          ngay_ket_thuc_den: 'ngay_ket_thuc_den' in filters ? filters.ngay_ket_thuc_den : ''
        }),
        fromDate: filters.dateRange.fromDate,
        toDate: filters.dateRange.toDate,
        order: sortDescriptors.map((desc) => ({
          column: desc.column,
          dir: desc.direction === 'ascending' ? 'asc' : 'desc'
        })),
        start: (filters.page - 1) * (filters.length || 10),
        // length: filters.length || 10,
        length: 5,
        // Additional
        page: filters.page
      }
      const response = await hopdongAxios.fetch(payload)
      return response.data // Giả sử API trả về { data: [...] } hoặc response chính là mảng
    },
    enabled: !hopDongList // Disable query if hopDongList is provided
  })

  useEffect(() => {
    if (hopDongList) {
      setData(hopDongList)
    } else if (responseData) {
      setData(responseData)
    }
  }, [hopDongList, responseData])

  useEffect(() => {
    if (user) {
      setFormData({
        id_nhan_vien: String(user.id_nhan_vien),
        id_vi_tri_cong_viec: String(user.id_vi_tri_cong_viec),
        id_don_vi_cong_tac: String(user.id_don_vi_cong_tac),
        ma_nhan_vien: String(user.ma_nhan_vien)
      })
    }
  }, [])

  // Sync local fileGroups to SidePanelContext ref so handleSecondarySubmit can read them
  useEffect(() => {
    updateFileGroups(fileGroups)
  }, [fileGroups])

  const resetForm = () => {
    setFormData({
      id_nhan_vien: String(user?.id_nhan_vien || ''),
      id_vi_tri_cong_viec: String(user?.id_vi_tri_cong_viec || ''),
      id_don_vi_cong_tac: String(user?.id_don_vi_cong_tac || ''),
      ma_nhan_vien: String(user?.ma_nhan_vien || '')
    })
    setFileGroups({})
    setExistingFiles([])
  }

  const handleOpenAdd = () => {
    resetForm()
    const addFormData = {
      id_nhan_vien: String(user?.id_nhan_vien || ''),
      id_vi_tri_cong_viec: String(user?.id_vi_tri_cong_viec || ''),
      id_don_vi_cong_tac: String(user?.id_don_vi_cong_tac || ''),
      ma_nhan_vien: String(user?.ma_nhan_vien || '')
    }
    openPanel({
      title: 'Thêm hợp đồng',
      content: <FormHopDong formData={addFormData} setFormData={setFormData} onFilesChange={onFilesChange} />,
      formData: addFormData,
      fileGroups: {},  // Files are synced reactively via updateFileGroups in the useEffect above
      onSubmit: (_id, data) => hopdongAxios.create(data!),
      onSubmitSuccess: (response) => {
        const newData = response.data
        queryClient.invalidateQueries({ queryKey: ['hopdongData'] })
        if (newData && typeof newData === 'object') {
          setData((prev) => [
            ...prev.map((item) => ({ ...item, dang_hieu_luc: '0' })),
            newData as HopdongData
          ])
        }
        resetForm()
        dispatchSectionChanged(SECTION_EVENTS.HOPDONG)
      }
    })
  }

  // Listen for external "Thêm mới" trigger from FormCollapse header
  useEffect(() => {
    const handler = () => handleOpenAdd()
    window.addEventListener('trigger-add-section-5', handler)
    return () => window.removeEventListener('trigger-add-section-5', handler)
  }, [user])

  const handleDelete = (ids: (string | number) | (string | number)[]) => {
    setDeletingId(ids)
    onOpenConfirm()
  }

  const onConfirmDelete = async () => {
    if (!deletingId) return
    const payload = Array.isArray(deletingId) ? deletingId : [deletingId]

    try {
      const response = await hopdongAxios.delete({ ids: payload })
      if (response.status === 200) {
        if (response.success) {
          toast(response.message || 'Xóa hợp đồng thành công', { variant: 'success' })
          // Remove row from local data
          setData((prev) => prev.filter((item) => !payload.includes(Number(item.id_hop_dong))))

          // Invalidate queries to ensure data consistency
          queryClient.invalidateQueries({ queryKey: ['hopdongData'] })
          dispatchSectionChanged(SECTION_EVENTS.HOPDONG)
        } else {
          toast(response.message || 'Xóa hợp đồng thất bại', { variant: 'danger' })
        }
      }
    } catch (error) {
      console.error(error)
      toast('Có lỗi xảy ra', { variant: 'danger' })
    } finally {
      onCloseConfirm()
      setDeletingId(null)
    }
  }

  const handleEdit = async (row: any) => {
    // const data = row
    const response = await hopdongAxios.show(row.id_hop_dong)
    // const data = response.data
    const { files_hop_dong, ...data } = response.data
    setEditingId(data.id_hop_dong)
    setFormData({
      ...data,
      // files_hop_dong: files_hop_dong,
      files_dinh_kem_old: files_hop_dong
    })

    if (files_hop_dong && files_hop_dong.length > 0) {
      const existingFiles = (files_hop_dong || []).map((f: any) => ({
        // id: Number(f.id_file_dinh_kem), không có id
        id: Number(f.file_path),
        name: f.file_name,
        size: convertSize(f.file_size),
        url: f.file_path, // hoặc API cung cấp URL decode
        type: guessMimeType(f.file_name)
      }))
      setExistingFiles(existingFiles)
    }

    setBridgedToDrawer(true)
    openPanel({
      title: 'Sửa hợp đồng',
      content: <FormHopDong formData={{ ...data, files_dinh_kem_old: files_hop_dong }} setFormData={setFormData} onFilesChange={onFilesChange} existingFiles={existingFiles} />,
      formData: { ...data, files_dinh_kem_old: files_hop_dong },
      fileGroups: {},  // Files are synced reactively via updateFileGroups in the useEffect above
      onSubmit: (_id, fd) => hopdongAxios.update(String(data.id_hop_dong), fd!),
      onSubmitSuccess: (response) => {
        const updatedData = response.data
        queryClient.invalidateQueries({ queryKey: ['hopdongData'] })
        if (updatedData && typeof updatedData === 'object') {
          setData((prev) =>
            prev.map((item) =>
              item.id_hop_dong === (updatedData as HopdongData).id_hop_dong
                ? (updatedData as HopdongData)
                : item
            )
          )
        }
        resetForm()
        dispatchSectionChanged(SECTION_EVENTS.HOPDONG)
      }
    })
  }

  // Preview file
  const handlePreview = async (url: string, name: string): Promise<void> => {
    const link = await enscrypt(url, name)
    if (link) {
      openPopout(link, name)
    }
  }

  const gridColumns: DataGridColumn[] = [
    { key: 'so_hop_dong', header: 'Số hợp đồng', width: 150 },
    { key: 'ten_hop_dong', header: 'Tên hợp đồng', flex: 2 },
    { key: 'files', header: 'File', flex: 2 },
    { key: 'dang_hieu_luc', header: 'Trạng thái', width: 120, align: 'center' },
    { key: 'luong_co_ban', header: 'Lương cơ bản', width: 140, align: 'right' },
    { key: 'ngay_bat_dau', header: 'Ngày bắt đầu', width: 110 },
    { key: 'ngay_ket_thuc', header: 'Ngày kết thúc', width: 110 },
    { key: 'actions', header: 'Thao tác', width: 80, align: 'right' }
  ]

  const renderCell = (row: HopdongData, col: DataGridColumn) => {
    switch (col.key) {
      case 'so_hop_dong':
        return (
          <span className="text-[13.5px] font-medium text-gray-800 truncate block">
            {row.so_hop_dong || '—'}
          </span>
        )
      case 'ten_hop_dong':
        return (
          <span className="text-[13px] text-gray-600 truncate block">
            {row.ten_hop_dong || '—'}
          </span>
        )
      case 'files': {
        let files: any[] = []
        try {
          if (typeof row.files_hop_dong === 'string') {
            const parsed = JSON.parse(row.files_hop_dong)
            files = Array.isArray(parsed) ? parsed : [parsed]
          } else if (Array.isArray(row.files_hop_dong)) {
            files = row.files_hop_dong
          } else if (row.files_hop_dong) {
            files = [row.files_hop_dong]
          }
        } catch (e) {
          files = []
        }

        if (!files?.length) return <span className="text-gray-400">—</span>

        return (
          <div className="flex flex-wrap gap-1">
            {files.map((f, index) => (
              <Chip
                key={(f.file_name || 'file') + index}
                size="sm"
                className="text-[11px] bg-gray-50 border-1 border-gray-200 p-0.5 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  if (f.file_path) {
                    handlePreview(f.file_path, f.file_name || 'document')
                  }
                }}
              >
                <div className="flex gap-1.5 items-center px-1">
                  <OfficeIcon name={f.file_name || 'file'} size={13} />
                  <span className="text-gray-600 max-w-[100px] truncate">
                    {truncateMiddle(f.file_name || 'File')}
                  </span>
                </div>
              </Chip>
            ))}
          </div>
        )
      }
      case 'dang_hieu_luc':
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${row.dang_hieu_luc === '1'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            {row.dang_hieu_luc === '1' ? 'Đang hiệu lực' : 'Hết hiệu lực'}
          </span>
        )
      case 'luong_co_ban':
        return (
          <span className="text-[13px] text-gray-700 font-medium">
            {row.luong_co_ban
              ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(row.luong_co_ban))
              : '—'}
          </span>
        )
      case 'ngay_bat_dau':
      case 'ngay_ket_thuc': {
        const val = row[col.key]
        return (
          <span className="text-[13px] text-gray-500">
            {val && !isNaN(new Date(val).getTime())
              ? new Date(val).toLocaleDateString('vi-VN')
              : '—'}
          </span>
        )
      }
      case 'actions':
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Tooltip content="Chỉnh sửa" color="primary" closeDelay={0}>
              <button
                type="button"
                onClick={() => handleEdit(row)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <Edit size={15} />
              </button>
            </Tooltip>
            <Tooltip content="Xóa" color="danger" closeDelay={0}>
              <button
                type="button"
                onClick={() => handleDelete(row.id_hop_dong)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer"
              >
                <Trash size={15} />
              </button>
            </Tooltip>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4 flex flex-col">
      <div className="justify-between items-center shrink-0 hidden">
        <h3 className="text-lg font-semibold text-gray-700">Danh sách hợp đồng</h3>
        <Button color="primary" size="sm" startContent={<Plus size={16} />} onPress={handleOpenAdd}>
          Thêm mới
        </Button>
      </div>

      <DataGrid<HopdongData>
        columns={gridColumns}
        data={data}
        rowKey={(item) => String(item.id_hop_dong)}
        renderCell={renderCell}
        emptyText="Chưa có hợp đồng nào"
      />

      <ConfirmModal
        isOpen={isOpenConfirm}
        onClose={onCloseConfirm}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa"
        content="Bạn có chắc chắn muốn xóa hợp đồng này không? Hành động này không thể hoàn tác."
        isDanger
      />
    </div>
  )
}
