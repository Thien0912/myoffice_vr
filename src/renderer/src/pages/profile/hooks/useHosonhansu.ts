import { NhansuAxios } from '@renderer/api/danhmuc/nhansuAxios'
import { mapDonviGroupedOptions } from '@renderer/api/danhmuc/DonviAxios'
import { mapVitriOptions } from '@renderer/api/danhmuc/VitriAxios'
import { useNhansuStore } from '@renderer/store/useNhansuStore'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { Selection } from '@heroui/react'
import { BACKEND_COLUMNS_DEF } from '../components/table/TableColumns'

export const useHosonhansu = () => {
  const {
    filters,
    setFilters,
    sortDescriptors,
    setSortDescriptors: setSortDescriptorsStore,
    columnWidths,
    setColumnWidth,
    pinnedColumns,
    setPinnedColumn,
    visibleColumns,
    setVisibleColumns,
    showStatsCards,
    setShowStatsCards,
    setPage: setPageStore,
    setLength: setLengthStore
  } = useNhansuStore()

  // Nếu đã có searchValue từ store, luôn bắt đầu từ trang 1
  // vì page persist cũ có thể vượt quá kết quả tìm kiếm
  const initialPage = filters.searchValue ? 1 : (filters.page ?? 1)
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(filters.length ?? 10)
  const [recordsTotal, setRecordsTotal] = useState(0)
  const [recordsFiltered, setRecordsFiltered] = useState(0)
  const [users, setUsers] = useState<any[]>([])
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))
  const [isPrinting, setIsPrinting] = useState(false)

  const handleClearFilters = () => {
    setPage(1)
    setFilters({
      id_don_vi: '',
      id_vi_tri_cong_viec: '',
      trang_thai: '',
      ma_nhan_vien: '',
      ho_ten: '',
      email: '',
      so_cccd: '',
      ngay_sinh: '',
      dateRange: {
        fromDate: '',
        toDate: ''
      }
    })
  }

  // Fetch list data
  const { data: responseData, isLoading } = useQuery({
    queryKey: [
      'nhansuData',
      page,
      limit,
      filters.searchValue,
      filters.dateRange?.fromDate,
      filters.dateRange?.toDate,
      filters.id_don_vi,
      filters.id_vi_tri_cong_viec,
      filters.trang_thai,
      filters.ma_nhan_vien,
      filters.ho_ten,
      filters.email,
      filters.so_cccd,
      filters.ngay_sinh,
      sortDescriptors
    ],
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const columnsPayload = BACKEND_COLUMNS_DEF.map((col) => ({
        ...col,
        search: { value: '', regex: false }
      }))

      const payload: any = {
        start: (page - 1) * limit,
        length: limit,
        search: {
          value: filters.searchValue || '',
          regex: false
        },
        columns: columnsPayload
      }

      if (sortDescriptors.length > 0) {
        payload.order = sortDescriptors.map((d) => {
          const colIndex = BACKEND_COLUMNS_DEF.findIndex((c) => c.data === d.column)
          return {
            column: colIndex !== -1 ? colIndex : 0,
            dir: d.direction === 'ascending' ? 'asc' : 'desc'
          }
        })
      }

      const filterObj: any = {}
      if (filters.dateRange?.fromDate || filters.dateRange?.toDate) {
        filterObj.ngay_lam_chinh_thuc = {
          from: filters.dateRange?.fromDate || '',
          to: filters.dateRange?.toDate || ''
        }
      }
      if (filters.id_don_vi) filterObj.id_don_vi = filters.id_don_vi
      if (filters.id_vi_tri_cong_viec) filterObj.id_vi_tri_cong_viec = filters.id_vi_tri_cong_viec
      if (filters.trang_thai) filterObj.trang_thai = filters.trang_thai
      if (filters.ma_nhan_vien) filterObj.ma_nhan_vien = filters.ma_nhan_vien
      if (filters.ho_ten) filterObj.ho_ten = filters.ho_ten
      if (filters.email) filterObj.email = filters.email
      if (filters.so_cccd) filterObj.so_cccd = filters.so_cccd
      if (filters.ngay_sinh) filterObj.ngay_sinh = filters.ngay_sinh

      if (Object.keys(filterObj).length > 0) {
        payload.filter = filterObj
      }

      const response = await NhansuAxios.fetch(payload)
      return response.data
    }
  })

  // Options queries
  const { data: donviOptions = [] } = useQuery({
    queryKey: ['donviOptions'],
    queryFn: mapDonviGroupedOptions,
    staleTime: 5 * 60 * 1000
  })

  const { data: vitriOptions = [] } = useQuery({
    queryKey: ['vitriOptions'],
    queryFn: mapVitriOptions,
    staleTime: 5 * 60 * 1000
  })

  const { data: statsResponse } = useQuery({
    queryKey: ['nhansuStats'],
    queryFn: () => NhansuAxios.getThongKe(),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false
  })

  // Sync response data
  useEffect(() => {
    if (responseData?.data) {
      setUsers(responseData.data)
      setRecordsTotal(responseData.recordsTotal || 0)
      setRecordsFiltered(responseData.recordsFiltered)
    }
  }, [responseData])

  const setSortDescriptors = (descriptors: typeof sortDescriptors) => {
    setSortDescriptorsStore(descriptors)
  }

  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    isOpen: boolean
    row: any | null
  }>({
    x: 0,
    y: 0,
    isOpen: false,
    row: null
  })

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean
    id: string | number | null
  }>({
    isOpen: false,
    id: null
  })

  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState<{
    isOpen: boolean
    ids: string[] | null
  }>({
    isOpen: false,
    ids: null
  })

  const handleContextMenu = (e: React.MouseEvent, row: any) => {
    setContextMenu({ x: e.clientX, y: e.clientY, isOpen: true, row })
  }

  const handleCloseContextMenu = () => {
    setContextMenu({ x: 0, y: 0, isOpen: false, row: null })
  }

  const handleConfirmDelete = async () => {
    if (confirmDelete.id) {
      try {
        setIsDeleting(true)
        await NhansuAxios.delete({ ids: [confirmDelete.id] })
        setUsers(users.filter((u) => u.id_nhan_vien !== confirmDelete.id))
        setConfirmDelete({ isOpen: false, id: null })
      } catch (error) {
        console.error('❌ Lỗi xóa:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleBulkDelete = async () => {
    if (confirmBulkDelete.ids && confirmBulkDelete.ids.length > 0) {
      try {
        setIsDeleting(true)
        await NhansuAxios.delete({ ids: confirmBulkDelete.ids })
        setUsers((prev) =>
          prev.filter((u) => !confirmBulkDelete.ids?.includes(String(u.id_nhan_vien)))
        )
        setSelectedKeys(new Set([]))
        setConfirmBulkDelete({ isOpen: false, ids: null })
      } catch (error) {
        console.error('❌ Lỗi xóa nhiều:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleXoaNhanVienSelected = useCallback(() => {
    let idsToDelete: string[] = []
    if (selectedKeys === 'all') {
      idsToDelete = users.map((u) => String(u.id_nhan_vien))
    } else {
      idsToDelete = Array.from(selectedKeys).map(String)
    }

    if (idsToDelete.length > 0) {
      setConfirmBulkDelete({
        isOpen: true,
        ids: idsToDelete
      })
    }
  }, [selectedKeys, users])

  const handlePrint = useCallback(
    async (options: any, donviOptions: any[], vitriOptions: any[]) => {
      setIsPrinting(true)
      let selectedIds: string[] = []
      if (selectedKeys === 'all') {
        selectedIds = users.map((u) => String(u.id_nhan_vien))
      } else {
        selectedIds = Array.from(selectedKeys).map(String)
      }

      const employeeDataList: any[] = []
      try {
        const { generateMultipleDocx } = await import('../utils/docxGenerator')
        for (const id of selectedIds) {
          const response = await NhansuAxios.getNhanSuByID(Number(id))
          employeeDataList.push(response.data)
        }
        await generateMultipleDocx(employeeDataList, donviOptions, vitriOptions, options)
      } catch (error: any) {
        console.error('❌ Lỗi tạo file:', error)
        alert(`Lỗi tạo file: ${error?.message || 'Lỗi không xác định'}`)
      } finally {
        setIsPrinting(false)
      }
    },
    [selectedKeys, users]
  )

  const handleRowChange = useCallback((id: string | number, columnUid: string, value: any) => {
    setUsers((prev) =>
      prev.map((row) => {
        if (row.id_nhan_vien === id) {
          return { ...row, [columnUid]: value }
        }
        return row
      })
    )
  }, [])

  const exportExcelMutation = useMutation({
    mutationFn: (payload: any) => NhansuAxios.exportExcel(payload),
    onSuccess: (response) => {
      if (response.success && response.data.file_base64) {
        const link = document.createElement('a')
        link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${response.data.file_base64}`
        link.download = response.data.file_name || 'Danh_sach_nhan_su.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert(response.message || 'Lỗi khi xuất file Excel')
      }
    },
    onError: (error: any) => {
      console.error('❌ Lỗi xuất Excel:', error)
      alert('Lỗi kết nối máy chủ')
    }
  })

  const handleExportExcel = useCallback(() => {
    // Quick export uses current list filters
    const payload: any = {
      search: filters.searchValue || '',
      trang_thai: filters.trang_thai ? [filters.trang_thai] : undefined,
      don_vi: filters.id_don_vi ? [filters.id_don_vi] : undefined,
      chuc_vu: filters.id_vi_tri_cong_viec ? [filters.id_vi_tri_cong_viec] : undefined,
      ngay_vao_lam_from: filters.dateRange?.fromDate || '',
      ngay_vao_lam_to: filters.dateRange?.toDate || '',
      length: -1
    }

    exportExcelMutation.mutate(payload)
  }, [filters, exportExcelMutation])

  const handleExportExcelAdvanced = useCallback((options: any) => {
    exportExcelMutation.mutate({
      ...options,
      length: -1
    })
  }, [exportExcelMutation])

  return {
    page,
    setPage,
    limit,
    setLimit,
    debouncedSearch: filters.searchValue || '',
    setDebouncedSearch: (val: string) => setFilters({ searchValue: val }),
    recordsTotal,
    recordsFiltered,
    users,
    setUsers,
    selectedKeys,
    setSelectedKeys,
    sortDescriptors,
    setSortDescriptors,
    isPrinting,
    setIsPrinting,
    isLoading,
    donviOptions,
    vitriOptions,
    statsResponse,
    showStatsCards,
    setShowStatsCards,
    visibleColumns,
    setVisibleColumns,
    columnWidths,
    setColumnWidth,
    pinnedColumns,
    setPinnedColumn,
    handleRowChange,
    setPageStore,
    setLengthStore,
    contextMenu,
    handleContextMenu,
    handleCloseContextMenu,
    confirmDelete,
    setConfirmDelete,
    isDeleting,
    confirmBulkDelete,
    setConfirmBulkDelete,
    handleConfirmDelete,
    handleBulkDelete,
    handleXoaNhanVienSelected,
    handlePrint,
    handleExportExcel,
    handleExportExcelAdvanced,
    isExportingExcel: exportExcelMutation.isPending,
    handleClearFilters,
    filters,
    setFilters
  }
}
