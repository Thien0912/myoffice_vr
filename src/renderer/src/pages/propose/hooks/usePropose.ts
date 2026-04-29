/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type */
import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { dexuatAxios } from '@renderer/api/hr/dexuatAxios'
import { useProposeStore } from '@renderer/store/useProposeStore'

export interface BinhLuan {
  id_binh_luan: string
  id_de_xuat: string
  parent_id?: string | null
  noi_dung: string
  created_at: string
  created_user_id: string
  updated_at: string
  updated_user_id: any
  deleted_at: any
  deleted_user_id: any
  ten_nguoi_binh_luan?: string
  ma_nhan_vien?: string
  avatar?: string
  gioi_tinh?: string | number
  ten_don_vi?: string
  ten_vi_tri_cong_viec?: string
  replies?: BinhLuan[]
  so_luong_reply?: number
}

export type ProposeData = {
  id_de_xuat: string
  tieu_de: string
  noi_dung: string
  nhap: string
  trang_thai?: string
  id_dx_loai_de_xuat?: string
  created_at: string
  created_user_id: string
  updated_at: string
  nguoi_tao: string
  ma_nhan_vien_tao: string
  avatar_nguoi_tao?: string
  ten_loai_de_xuat?: string
  mo_ta_loai_de_xuat?: string
  thoi_gian_binh_luan?: string
  thoi_gian_nguoi_duyet?: string
  thoi_gian_moi_nhat?: string
  binh_luan: any[]
  so_luong_binh_luan?: number
  da_duyet?: string | number | null
  cap_duyet?: string
  ly_do?: any
  thoi_gian_duyet?: string
  avatar?: string
  gioi_tinh?: string | number
  file_dinh_kem?: any[]
  so_luong_file?: number
  count_approved?: number | string
  count_total?: number | string
  nguoi_duyet?: any[]
  quy_trinh?: any[]
  is_unit_approved?: number | string
  is_my_unit_turn?: number | string
  [key: string]: any
}

export interface ProposeResponse {
  status: boolean
  message: string
  data: ProposeData[]
  recordsTotal: number
  recordsFiltered: number
}

export function usePropose() {
  const [searchParams, setSearchParams] = useSearchParams()
  const store = useProposeStore()

  // Sync activeTab with URL params if exists, otherwise use store
  const activeTab = searchParams.get('tab') || store.activeTab
  const page = store.page
  const limit = store.limit
  const search = store.search
  const viewType = store.viewType

  const [selectedKeys, setSelectedKeys] = useState<any>(new Set([]))
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(handler)
  }, [search])

  const setActiveTab = (tab: string) => {
    store.setActiveTab(tab)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('tab', tab)
    setSearchParams(newParams)
  }


  const instances = store.instances
  const addInstance = store.addInstance
  const closeInstance = store.closeInstance
  const minimizeInstance = store.minimizeInstance
  const restoreInstance = store.restoreInstance

  const filters = store.filters
  const setFilters = store.setFilters

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['propose', page, limit, debouncedSearch, activeTab, filters, store.sortDescriptors],
    queryFn: async () => {
      const response = await dexuatAxios.fetch({
        draw: page,
        start: (page - 1) * limit,
        length: limit,
        search: { value: debouncedSearch },
        searchKey: {
          tab: activeTab,
          ...(filters?.dateRange?.from ? { tu_ngay: filters.dateRange.from } : {}),
          ...(filters?.dateRange?.to ? { den_ngay: filters.dateRange.to } : {}),
          ...Object.fromEntries(
            Object.entries(filters || {}).filter(([key]) => key !== 'selectedClassify' && key !== 'dateRange')
          )
        }
      })

      if (response && (response as any).statisticals) {
        store.setStatisticals((response as any).statisticals)
      }

      return response as ProposeResponse
    }
  })

  // Client-side sorting as a fallback if backend doesn't handle it yet
  const sortedData = useMemo(() => {
    const list = [...(data?.data || [])]
    const sorts = store.sortDescriptors
    if (sorts.length === 0) return list

    return list.sort((a, b) => {
      for (const sort of sorts) {
        const aValue = a[sort.column]
        const bValue = b[sort.column]

        if (aValue === bValue) continue

        const multiplier = sort.direction === 'descending' ? -1 : 1
        if (aValue < bValue) return -1 * multiplier
        if (aValue > bValue) return 1 * multiplier
      }
      return 0
    })
  }, [data, store.sortDescriptors])

  return {
    page,
    setPage: store.setPage,
    limit,
    setLimit: store.setLimit,
    search,
    setSearch: store.setSearch,
    selectedKeys,
    setSelectedKeys,
    data: sortedData,
    total: data?.recordsTotal || 0,
    recordsFiltered: data?.recordsFiltered || 0,
    stats: {
      total: data?.recordsTotal || 0,
      pending: 0, // Cần API stats riêng hoặc tính toán từ data nếu trả về
      approved: 0,
      rejected: 0
    },
    showStatsCards: store.showStatsCards,
    setShowStatsCards: store.setShowStatsCards,
    isCollapsed: store.isCollapsed,
    setIsCollapsed: store.setIsCollapsed,
    activeTab,
    setActiveTab,
    viewType,
    setViewType: store.setViewType,
    sortDescriptors: store.sortDescriptors,
    setSortDescriptors: store.setSortDescriptors,
    isLoading,
    instances,
    columnWidths: store.columnWidths,
    setColumnWidths: store.setColumnWidths,
    setColumnWidth: store.setColumnWidth,
    pinnedColumns: store.pinnedColumns,
    setPinnedColumns: store.setPinnedColumns,
    setPinnedColumn: store.setPinnedColumn,
    addInstance,
    closeInstance,
    minimizeInstance,
    restoreInstance,
    refetch,
    setFilters,
    visibleColumns: store.visibleColumns,
    setVisibleColumns: store.setVisibleColumns
  }
}
