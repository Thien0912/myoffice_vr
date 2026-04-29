/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import { NhansuAxios } from '@renderer/api/danhmuc/nhansuAxios'
import { mapDonviGroupedOptions } from '@renderer/api/danhmuc/DonviAxios'
import { useState } from 'react'
import { Selection } from '@heroui/react'
import { useIntheStore } from '@renderer/store/hr/useIntheStore'

export function useInthe() {
    const {
        filters,
        setFilters,
        resetFilters,
        pinnedColumns,
        setPinnedColumn,
        columnWidths,
        setColumnWidth,
        sortDescriptors,
        setSortDescriptors,
        activeEmployee,
        setActiveEmployee
    } = useIntheStore()
    const { searchValue, idDonvi, page, length: limit } = filters

    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))

    // Fetch unit options for filter
    const { data: donviOptions = [] } = useQuery({
        queryKey: ['donviOptions'],
        queryFn: mapDonviGroupedOptions
    })

    // Fetch personnel data
    const { data: response, isLoading } = useQuery({
        queryKey: ['personnel-print-list', searchValue, idDonvi, page, limit, sortDescriptors],
        queryFn: async () => {
            // Define columns as expected by Datatables-style backend
            const backendColumns = [
                { data: 'stt', searchable: false, orderable: false },
                { data: 'ma_nhan_vien', searchable: true, orderable: true },
                { data: 'ho_va_ten', searchable: true, orderable: true },
                { data: 'hoc_ham', searchable: true, orderable: true },
                { data: 'trinh_do_dt', searchable: true, orderable: true },
                { data: 'ten_don_vi', searchable: true, orderable: true },
                { data: 'ten_cong_viec', searchable: true, orderable: true }
            ]

            const payload: any = {
                draw: 1,
                start: (page - 1) * limit,
                length: limit,
                search: { value: searchValue || '', regex: false },
                columns: backendColumns.map(col => ({ ...col, search: { value: '', regex: false } })),
                order: sortDescriptors.map(s => {
                    const colIndex = backendColumns.findIndex(c => c.data === s.column)
                    return {
                        column: colIndex !== -1 ? colIndex : 0,
                        dir: s.direction === 'ascending' ? 'asc' : 'desc'
                    }
                }),
                filter: {
                    id_don_vi: idDonvi || undefined
                }
            }
            const res = await NhansuAxios.fetch(payload)
            return res?.data
        }
    })

    const personnel = response?.data || []
    const total = response?.recordsTotal || 0
    const filtered = response?.recordsFiltered || 0

    const handleClearFilters = () => {
        resetFilters()
    }

    const setSearchValue = (val: string) => setFilters({ searchValue: val, page: 1 })
    const setIdDonvi = (val: string) => setFilters({ idDonvi: val, page: 1 })
    const setPage = (val: number) => setFilters({ page: val })
    const setLimit = (val: number) => setFilters({ length: val, page: 1 })

    return {
        searchValue,
        setSearchValue,
        idDonvi,
        setIdDonvi,
        page,
        setPage,
        limit,
        setLimit,
        selectedKeys,
        setSelectedKeys,
        pinnedColumns,
        setPinnedColumn,
        donviOptions,
        personnel,
        total,
        filtered,
        isLoading,
        handleClearFilters,
        columnWidths,
        setColumnWidth,
        sortDescriptors,
        setSortDescriptors,
        activeEmployee,
        setActiveEmployee
    }
}
