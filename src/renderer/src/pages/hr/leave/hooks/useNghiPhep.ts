import { Selection, toast } from '@heroui-v3/react'
import { nghiphepAxios } from '@renderer/api/hr/nghiphepAxios'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useNghiPhepStore } from '@renderer/store/useNghiPhepStore'
import { canAccess } from '@renderer/utils/permissions/permissions'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LeaveRequest } from '../mockData'

export const useNghiPhep = () => {
    const queryClient = useQueryClient()
    const { user } = useAuthStore()

    const isTCHC = user?.ma_don_vi === 'PHONG_TCHC'
    const isSuperAdmin = Number(user?.ql_nguoi_dung_is_admin) === 1

    const {
        page,
        setPage,
        limit,
        setLimit,
        search,
        setSearch,
        filter,
        setFilter,
        sortDescriptors,
        setSortDescriptors,
        showStatsCards,
        setShowStatsCards,
        showQuotaGrid,
        setShowQuotaGrid,
        quotaYear,
        setQuotaYear,
        month,
        setMonth,
        year,
        setYear,
        visibleColumns,
        setVisibleColumns,
        columnWidths,
        setColumnWidths,
        pinnedColumns,
        setPinnedColumns
    } = useNghiPhepStore()

    const initializedDefaultUnitRef = useRef(false)

    // Chỉ TCHC và Super Admin mới cần tự chọn đơn vị qua filter
    // Các vai trò khác: backend tự lọc theo identity, không cần gửi id_don_vi
    useEffect(() => {
        if (!user?.id_don_vi || initializedDefaultUnitRef.current) return

        if (isTCHC || isSuperAdmin) {
            // TCHC/SuperAdmin: auto-set đơn vị của mình làm mặc định, có thể thay đổi
            if (!('id_don_vi' in filter)) {
                setFilter({ ...filter, id_don_vi: String(user.id_don_vi) })
            }
        } else {
            // Các vai trò khác: xóa id_don_vi khỏi filter nếu còn tồn tại (persist từ lần trước)
            if ('id_don_vi' in filter) {
                const { id_don_vi: _, ...rest } = filter
                setFilter(rest)
            }
        }

        initializedDefaultUnitRef.current = true
    }, [user?.id_don_vi, isTCHC, isSuperAdmin, filter, setFilter])

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isCreateModalMinimized, setIsCreateModalMinimized] = useState(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isExportModalOpen, setIsExportModalOpen] = useState(false)
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))
    const [editingRow, setEditingRow] = useState<LeaveRequest | null>(null)
    const [viewingRow, setViewingRow] = useState<LeaveRequest | null>(null)
    const [isMinhChungModalOpen, setIsMinhChungModalOpen] = useState(false)
    const [minhChungRow, setMinhChungRow] = useState<LeaveRequest | null>(null)
    const [isPhucKhaoModalOpen, setIsPhucKhaoModalOpen] = useState(false)
    const [phucKhaoRow, setPhucKhaoRow] = useState<LeaveRequest | null>(null)

    // Handle action and uuid parameter from URL
    const [searchParams, setSearchParams] = useSearchParams()
    useEffect(() => {
        const action = searchParams.get('action')
        const uuid = searchParams.get('uuid')

        if (action === 'create' && !isCreateModalOpen) {
            setIsCreateModalOpen(true)
            setIsCreateModalMinimized(false)
            setEditingRow(null)
            searchParams.delete('action')
            setSearchParams(searchParams, { replace: true })
        }

        if (uuid && !isCreateModalOpen && !isDrawerOpen) {
            // Fetch detail by uuid
            const fetchDetail = async () => {
                try {
                    const resp = await nghiphepAxios.getDetail(uuid)
                    if (resp.success && resp.data) {
                        setViewingRow(resp.data)
                        setEditingRow(null)
                        setIsDrawerOpen(true)
                    }
                } catch (error) {
                    console.error('Error fetching detail by uuid:', error)
                } finally {
                    searchParams.delete('uuid')
                    setSearchParams(searchParams, { replace: true })
                }
            }
            fetchDetail()
        }
    }, [searchParams, isCreateModalOpen, isDrawerOpen])

    const handleEdit = useCallback((row: LeaveRequest) => {
        setEditingRow(row)
        setViewingRow(null)
        setIsCreateModalOpen(true)
        setIsCreateModalMinimized(false)
    }, [])

    const handleView = useCallback(async (row: LeaveRequest) => {
        if (!row.uuid_nghi_phep) return

        // Set initial data from list and open modal immediately
        setViewingRow(row)
        setEditingRow(null)
        setIsDrawerOpen(true)

        // Fetch fresh details from API
        try {
            const resp = await nghiphepAxios.getDetail(row.uuid_nghi_phep)
            if (resp.success && resp.data) {
                setViewingRow(resp.data)
            }
        } catch (error) {
            console.error('Error fetching detail:', error)
        }
    }, [])

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        type: 'approve' | 'reject' | 'recall' | null
        row: LeaveRequest | null
        level: 1 | 2 | null
        reason: string
        isBulk?: boolean
        bulkUuids?: string[]
        isOnBehalf?: boolean
        approverId?: string | number
        proofFile?: File | null
    }>({
        isOpen: false,
        type: null,
        row: null,
        level: null,
        reason: '',
        isOnBehalf: false,
        approverId: undefined
    })

    // Fetch approvers list
    // Fetch approvers list
    const { data: approversData } = useQuery({
        queryKey: ['approvers', confirmModal.row?.uuid_nghi_phep, confirmModal.bulkUuids],
        queryFn: async () => {
            let uuid = ''
            if (confirmModal.isBulk && confirmModal.bulkUuids && confirmModal.bulkUuids.length > 0) {
                uuid = confirmModal.bulkUuids[0]
            } else if (confirmModal.row?.uuid_nghi_phep) {
                uuid = confirmModal.row.uuid_nghi_phep
            }

            if (!uuid) return []
            const res = await nghiphepAxios.getApprovers(uuid)
            return res?.data || []
        },
        enabled: !!confirmModal.isOnBehalf && canAccess('nghiphep.approve_on_behalf')
    })

    // Debounce search để tránh fetch liên tục
    const [debouncedSearch, setDebouncedSearch] = useState(search)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

    // Fetch list data
    const { data: responseData, isLoading } = useQuery({
        queryKey: ['hrmNghiPhep', page, limit, debouncedSearch, filter, sortDescriptors],
        queryFn: async () => {
            const payload = {
                draw: page,
                start: (page - 1) * limit,
                length: limit,
                search: { value: debouncedSearch.trim() },
                searchKey: {
                    ...Object.fromEntries(
                        Object.entries(filter).filter(([_, v]) => v !== 'all')
                    )
                },
                order: sortDescriptors.map((desc) => ({
                    column: desc.column,
                    dir: desc.direction === 'ascending' ? 'asc' : 'desc'
                }))
            }
            const response = await nghiphepAxios.fetch(payload)
            return response?.data || { data: [], recordsTotal: 0, recordsFiltered: 0, thongke: null }
        }
    })

    const syncMutation = useMutation({
        mutationFn: (params: { path: string; uuid: string }) => nghiphepAxios.sync(params),
        onSuccess: (res) => {
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

    const handleSync = (path: string, uuid: string) => {
        syncMutation.mutate({ path, uuid })
    }

    const paginatedData = useMemo(() => responseData?.data || [], [responseData?.data])
    const totalRequests = responseData?.recordsTotal || 0
    const recordsFiltered = responseData?.recordsFiltered || 0
    const stats = responseData?.thongke

    // Stats from response or calculate if needed
    const rejectedRequests = stats?.rejected || 0
    const pendingRequests = stats?.pending || 0
    const approvedRequests = stats?.approved || 0

    // Mutations
    const approvalMutation = useMutation({
        mutationFn: (params: {
            uuids_nghi_phep: string | string[]
            hanh_dong: 'duyet' | 'tu_choi'
            ly_do?: string
        }) => nghiphepAxios.approve(params),
        onSuccess: (res, variables) => {
            if (res.success) {
                const isBulk =
                    Array.isArray(variables.uuids_nghi_phep) && variables.uuids_nghi_phep.length > 1
                const data = res.data

                // Gửi email sau khi duyệt/từ chối
                if (data.ket_qua) {
                    if (Array.isArray(data.ket_qua)) {
                        data.ket_qua.forEach((item) => {
                            if (item.success && item.uuid_nghi_phep) {
                                nghiphepAxios.sendEmailAfterApproved({
                                    uuid_nghi_phep: item.uuid_nghi_phep,
                                    hanh_dong: item.hanh_dong,
                                    cap_duyet: item.cap_duyet
                                })
                            }
                        })
                    } else if (data.ket_qua.uuid_nghi_phep) {
                        nghiphepAxios.sendEmailAfterApproved({
                            uuid_nghi_phep: data.ket_qua.uuid_nghi_phep,
                            hanh_dong: data.ket_qua.hanh_dong,
                            cap_duyet: data.ket_qua.cap_duyet
                        })
                    }
                }

                if (isBulk && data) {
                    const hasFailure = data.that_bai > 0
                    toast(res.message || 'Xử lý hàng loạt', { description: `Thành công: ${data.thanh_cong}, Thất bại: ${data.that_bai}`, variant: hasFailure ? 'warning' : 'success' })
                } else {
                    toast('Thông báo', { description: res.message || 'Đã thực hiện thao tác thành công', variant: 'success' })
                }
                queryClient.invalidateQueries({ queryKey: ['hrmNghiPhep'] })
                setIsCreateModalOpen(false)
            } else {
                toast('Thất bại', { description: res.message || 'Có lỗi xảy ra khi xử lý đơn', variant: 'danger' })
            }
        }
    })

    const approveOnBehalfMutation = useMutation({
        mutationFn: (params: {
            uuids_nghi_phep: string | string[]
            hanh_dong: 'duyet' | 'tu_choi'
            ly_do?: string
            id_nguoi_duyet_ho?: string | number
            minh_chung?: File | null
        }) => {
            const formData = new FormData()

            // Handle array or single string for uuids
            if (Array.isArray(params.uuids_nghi_phep)) {
                params.uuids_nghi_phep.forEach((uuid) => formData.append('uuids_nghi_phep[]', uuid))
            } else {
                formData.append('uuids_nghi_phep', params.uuids_nghi_phep)
            }

            formData.append('hanh_dong', params.hanh_dong)
            if (params.ly_do) formData.append('ly_do', params.ly_do)
            if (params.id_nguoi_duyet_ho) formData.append('id_nguoi_duyet_ho', String(params.id_nguoi_duyet_ho))
            if (params.minh_chung) formData.append('minh_chung_duyet_ho', params.minh_chung)

            return nghiphepAxios.approve_on_behalf(formData as any)
        },
        onSuccess: (res, variables) => {
            if (res.success) {
                const isBulk =
                    Array.isArray(variables.uuids_nghi_phep) && variables.uuids_nghi_phep.length > 1
                const data = res.data

                if (isBulk && data) {
                    const hasFailure = data.that_bai > 0
                    toast(res.message || 'Xử lý hàng loạt (duyệt hộ)', { description: `Thành công: ${data.thanh_cong}, Thất bại: ${data.that_bai}`, variant: hasFailure ? 'warning' : 'success' })
                } else {
                    toast('Thông báo', { description: res.message || 'Đã thực hiện thao tác duyệt hộ thành công', variant: 'success' })
                }
                queryClient.invalidateQueries({ queryKey: ['hrmNghiPhep'] })
                setIsCreateModalOpen(false)
            } else {
                toast('Thất bại', { description: res.message || 'Có lỗi xảy ra khi xử lý đơn', variant: 'danger' })
            }
        }
    })

    const recallMutation = useMutation({
        mutationFn: (uuids: string[]) => nghiphepAxios.recalls(uuids),
        onSuccess: (res) => {
            if (res.success) {
                toast('Thông báo', { description: res.message || 'Đã thu hồi đơn thành công', variant: 'success' })
                queryClient.invalidateQueries({ queryKey: ['hrmNghiPhep'] })
            } else {
                toast('Thất bại', { description: res.message || 'Có lỗi xảy ra khi thu hồi đơn', variant: 'danger' })
            }
        }
    })

    const minhChungMutation = useMutation({
        mutationFn: (params: { uuid_nghi_phep: string; minh_chung: File }) =>
            nghiphepAxios.minhChung(params),
        onSuccess: (res) => {
            if (res.success) {
                toast('Thông báo', { description: res.message || 'Bổ sung minh chứng thành công', variant: 'success' })
                queryClient.invalidateQueries({ queryKey: ['hrmNghiPhep'] })

                // Cập nhật viewingRow nếu đang xem đúng đơn này
                if (viewingRow && viewingRow.uuid_nghi_phep === minhChungRow?.uuid_nghi_phep) {
                    setViewingRow({ ...viewingRow, ...res.data })
                }

                setIsMinhChungModalOpen(false)
            } else {
                toast('Thất bại', { description: res.message || 'Có lỗi xảy ra khi bổ sung minh chứng', variant: 'danger' })
            }
        }
    })

    const handleMinhChung = useCallback((row: LeaveRequest) => {
        setMinhChungRow(row)
        setIsMinhChungModalOpen(true)
    }, [])

    const phucKhaoMutation = useMutation({
        mutationFn: (params: { uuid_nghi_phep: string; ly_do_nghi?: string }) =>
            nghiphepAxios.submitPhucKhao(params),
        onSuccess: (res) => {
            const message = typeof res.message === 'string' ? res.message : ''
            if (res.success) {
                toast('Phúc khảo thành công', { description: message || 'Yêu cầu phúc khảo đã được gửi. Lãnh đạo sẽ xem xét lại.', variant: 'success' })
                queryClient.invalidateQueries({ queryKey: ['hrmNghiPhep'] })
                setIsPhucKhaoModalOpen(false)
                setPhucKhaoRow(null)
            } else {
                toast('Thất bại', { description: message || 'Có lỗi xảy ra khi gửi phúc khảo', variant: 'danger' })
            }
        },
        onError: (err: any) => {
            const errMsg = err?.response?.data?.message
            toast('Lỗi', { description: (typeof errMsg === 'string' ? errMsg : '') || 'Có lỗi khi kết nối server', variant: 'danger' })
        }
    })

    const handlePhucKhao = useCallback((row: LeaveRequest) => {
        setPhucKhaoRow(row)
        setIsPhucKhaoModalOpen(true)
    }, [])

    const handleConfirmPhucKhao = useCallback(
        (formData: FormData) => {
            phucKhaoMutation.mutate(formData as any)
        },
        [phucKhaoMutation]
    )

    const handleApprove = (uuid: string, reason?: string) => {
        approvalMutation.mutate({ uuids_nghi_phep: [uuid], hanh_dong: 'duyet', ly_do: reason })
    }

    const handleReject = (uuid: string, reason?: string) => {
        approvalMutation.mutate({ uuids_nghi_phep: [uuid], hanh_dong: 'tu_choi', ly_do: reason })
    }

    const handleApproveOnBehalf = (uuid: string, reason?: string) => {
        approveOnBehalfMutation.mutate({
            uuids_nghi_phep: [uuid],
            hanh_dong: 'duyet',
            ly_do: reason
        })
    }

    const handleRejectOnBehalf = (uuid: string, reason?: string) => {
        approveOnBehalfMutation.mutate({
            uuids_nghi_phep: [uuid],
            hanh_dong: 'tu_choi',
            ly_do: reason
        })
    }

    const handleRecall = useCallback((row: LeaveRequest) => {
        const uuid = row.uuid_nghi_phep
        if (!uuid) return
        setConfirmModal({
            isOpen: true,
            type: 'recall',
            row,
            level: null,
            reason: ''
        })
    }, [])

    const handleConfirmAction = () => {
        if (!confirmModal.type) return

        // Validate: Người duyệt bắt buộc khi duyệt hộ
        if (confirmModal.isOnBehalf && !confirmModal.approverId) {
            toast('Thiếu thông tin', { description: 'Vui lòng chọn Người duyệt trước khi xác nhận', variant: 'warning' })
            return
        }

        if (confirmModal.isBulk && confirmModal.bulkUuids) {
            if (confirmModal.isOnBehalf) {
                // Bulk approve on behalf
                approveOnBehalfMutation.mutate(
                    {
                        uuids_nghi_phep: confirmModal.bulkUuids,
                        hanh_dong: confirmModal.type === 'approve' ? 'duyet' : 'tu_choi',
                        ly_do: confirmModal.reason,
                        id_nguoi_duyet_ho: confirmModal.approverId,
                        minh_chung: confirmModal.proofFile
                    },
                    {
                        onSuccess: (res) => {
                            if (res.success) {
                                setSelectedKeys(new Set([]))
                            }
                        }
                    }
                )
            } else {
                // Regular bulk approval
                approvalMutation.mutate(
                    {
                        uuids_nghi_phep: confirmModal.bulkUuids,
                        hanh_dong: confirmModal.type === 'approve' ? 'duyet' : 'tu_choi',
                        ly_do: confirmModal.reason
                    },
                    {
                        onSuccess: (res) => {
                            if (res.success) {
                                setSelectedKeys(new Set([]))
                            }
                        }
                    }
                )
            }
        } else if (confirmModal.row) {
            const uuid = confirmModal.row.uuid_nghi_phep
            if (!uuid) {
                toast('Lỗi', { description: 'Không tìm thấy mã định danh đơn (UUID)', variant: 'danger' })
                return
            }

            if (confirmModal.type === 'recall') {
                recallMutation.mutate([uuid])
            } else if (confirmModal.isOnBehalf) {
                approveOnBehalfMutation.mutate({
                    uuids_nghi_phep: [uuid],
                    hanh_dong: confirmModal.type === 'approve' ? 'duyet' : 'tu_choi',
                    ly_do: confirmModal.reason,
                    id_nguoi_duyet_ho: confirmModal.approverId,
                    minh_chung: confirmModal.proofFile
                })
            } else {
                approvalMutation.mutate({
                    uuids_nghi_phep: [uuid],
                    hanh_dong: confirmModal.type === 'approve' ? 'duyet' : 'tu_choi',
                    ly_do: confirmModal.reason
                })
            }
        }

        setConfirmModal({
            isOpen: false,
            type: null,
            row: null,
            level: null,
            reason: '',
            isOnBehalf: false,
            approverId: undefined
        })
    }

    const openConfirm = useCallback((
        row: LeaveRequest,
        level: 1 | 2 | null,
        type: 'approve' | 'reject',
        reason?: string,
        isOnBehalf?: boolean,
        approverId?: string | number
    ) => {
        setConfirmModal({
            isOpen: true,
            type,
            row,
            level,
            reason: reason || '',
            isOnBehalf: !!isOnBehalf,
            approverId: approverId
        })
    }, [])

    const handleBulkAction = (type: 'approve' | 'reject') => {
        let uuids: string[] = []

        if (selectedKeys === 'all') {
            uuids = paginatedData.map((item) => item.uuid_nghi_phep).filter(Boolean) as string[]
        } else {
            const selectedSet = selectedKeys as Set<string>
            // Need to find matching items in paginatedData since selectedKeys are usually IDs
            // But we need UUIDs for the API
            uuids = paginatedData
                .filter((item) => selectedSet.has(item.id_nghi_phep.toString()))
                .map((item) => item.uuid_nghi_phep)
                .filter(Boolean) as string[]
        }

        if (uuids.length === 0) {
            toast('Thông báo', { description: 'Vui lòng chọn ít nhất một đơn', variant: 'warning' })
            return
        }

        setConfirmModal({
            isOpen: true,
            type,
            row: null,
            level: null,
            reason: '',
            isBulk: true,
            bulkUuids: uuids
        })
    }

    const handleBulkApproveOnBehalf = (actionType: 'approve' | 'reject') => {
        const uuids = paginatedData
            .filter((item) => {
                const isSelected =
                    selectedKeys === 'all' || (selectedKeys as Set<string>).has(item.id_nghi_phep.toString())
                const isLevel1 = item.trang_thai_cap_mot === 'Cho_duyet'
                return isSelected && isLevel1
            })
            .map((item) => item.uuid_nghi_phep)
            .filter(Boolean) as string[]

        if (uuids.length === 0) {
            toast('Thông báo', { description: 'Vui lòng chọn ít nhất một đơn đang chờ phê duyệt cấp đơn vị (Cấp 1)', variant: 'warning' })
            return
        }

        setConfirmModal({
            isOpen: true,
            type: actionType,
            row: null,
            level: null,
            reason: '',
            isBulk: true,
            bulkUuids: uuids,
            isOnBehalf: true,
            approverId: undefined,
            proofFile: null
        })
    }

    const exportMutation = useMutation({
        mutationFn: (params: {
            year?: number
            month?: number | null
            start_date?: string
            end_date?: string
            id_loai_phep?: string | null
            ids_don_vi?: string | null
            co_tinh_luong?: number | null
        }) => nghiphepAxios.exportByUnit(params),
        onSuccess: (res) => {
            if (res.success && res.data) {
                const link = document.createElement('a')
                link.href = res.data
                link.setAttribute('target', '_blank')
                link.setAttribute('download', '')
                document.body.appendChild(link)
                link.click()
                link.remove()
                toast('Thông báo', { description: 'Đã xuất file thành công', variant: 'success' })
                setIsExportModalOpen(false)
            } else {
                toast('Thất bại', { description: res.message || 'Có lỗi xảy ra khi xuất file', variant: 'danger' })
            }
        },
        onError: (err: any) => {
            toast('Lỗi', { description: err.response?.data?.message || 'Có lỗi khi kết nối server', variant: 'danger' })
        }
    })

    const exportByEmployeeMutation = useMutation({
        mutationFn: (params: { year: number }) => nghiphepAxios.exportByEmployee(params),
        onSuccess: (res) => {
            if (res.success && res.data) {
                const link = document.createElement('a')
                link.href = res.data
                link.setAttribute('target', '_blank')
                link.setAttribute('download', '')
                document.body.appendChild(link)
                link.click()
                link.remove()
                toast('Thông báo', { description: 'Đã xuất file thành công', variant: 'success' })
                setIsExportModalOpen(false)
            } else {
                toast('Thất bại', { description: res.message || 'Có lỗi xảy ra khi xuất file', variant: 'danger' })
            }
        },
        onError: (err: any) => {
            toast('Lỗi', { description: err.response?.data?.message || 'Có lỗi khi kết nối server', variant: 'danger' })
        }
    })

    const handleExportByEmployee = (params: any) => {
        exportByEmployeeMutation.mutate(params)
    }

    const handleExport = (params: any) => {
        exportMutation.mutate(params)
    }

    const downloadTemplateMutation = useMutation({
        mutationFn: () => nghiphepAxios.downloadTemplate(),
        onSuccess: (res) => {
            if (res.success && res.data) {
                const link = document.createElement('a')
                link.href = res.data
                link.setAttribute('target', '_blank')
                link.setAttribute('download', 'Template_Import_Nghi_Phep.xlsx')
                document.body.appendChild(link)
                link.click()
                link.remove()
                toast('Thông báo', { description: 'Đã tải xuống file mẫu thành công', variant: 'success' })
            } else {
                toast('Thất bại', { description: res.message || 'Có lỗi xảy ra khi tải file mẫu', variant: 'danger' })
            }
        },
        onError: (err: any) => {
            toast('Lỗi', { description: err.response?.data?.message || 'Có lỗi khi kết nối server', variant: 'danger' })
        }
    })

    const handleDownloadTemplate = () => {
        downloadTemplateMutation.mutate()
    }

    const importMutation = useMutation({
        mutationFn: (file: File) => nghiphepAxios.importExcel(file),
        onSuccess: (res) => {
            if (res.success) {
                const data = res.data
                const errorCount = data.error_count || 0
                const successCount = data.success_count || 0

                let description = res.message || 'Import dữ liệu thành công'

                // Thêm thống kê chi tiết
                if (data.total > 0) {
                    description = `Import hoàn tất: ${successCount} thành công, ${errorCount} lỗi.`
                    if (data.file_result) {
                        description += ' File kết quả đang được tải xuống...'
                    }
                }

                toast(errorCount > 0 ? 'Hoàn thành với lỗi' : 'Thành công', { description: description, variant: errorCount > 0 ? 'warning' : 'success' })

                // Tự động tải file kết quả (cả thành công và thất bại)
                if (data.file_result) {
                    setTimeout(() => {
                        const link = document.createElement('a')
                        link.href = data.file_result
                        link.setAttribute('target', '_blank')
                        link.setAttribute('download', '')
                        document.body.appendChild(link)
                        link.click()
                        link.remove()
                    }, 500)
                }

                setIsImportModalOpen(false)
                // Refresh data
                queryClient.invalidateQueries({ queryKey: ['hrmNghiPhep'] })
            } else {
                toast('Thất bại', { description: res.message || 'Có lỗi xảy ra khi import', variant: 'danger' })
            }
        },
        onError: (err: any) => {
            toast('Lỗi', { description: err.response?.data?.message || 'Có lỗi khi kết nối server', variant: 'danger' })
        }
    })

    const handleImport = (file: File) => {
        importMutation.mutate(file)
    }

    const canApprove = canAccess('nghiphep.approve')

    const permissions = useMemo(() => ({
        canApproveLevel1: canApprove && (user?.loai_lanh_dao === 'LANH_DAO_DON_VI' || user?.loai_lanh_dao === 'LANH_DAO_TCHC'),
        canApproveLevel2: canApprove && (user?.loai_lanh_dao === 'LANH_DAO_TCHC'),
        canApproveOnBehalf: canAccess('nghiphep.approve_on_behalf') && user?.loai_lanh_dao !== 'LANH_DAO_DON_VI',
        canCreate: canAccess('nghiphep.create'),
        canUpdate: canAccess('nghiphep.update'),
        canDelete: canAccess('nghiphep.delete'),
        canApprove,
        canStats: canAccess('nghiphep.statistics'),
        canExportStats: canAccess('nghiphep.statistics'),
        canExportExcel: canAccess('nghiphep.export_by_unit'),
        canExportDoc: true,
        canImport: canAccess('nghiphep.import'),
        canViewDonViFilter: isTCHC || isSuperAdmin,
        isSuperAdmin
    }), [canApprove, isTCHC, isSuperAdmin, user?.loai_lanh_dao])

    return {
        showStatsCards,
        setShowStatsCards,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isCreateModalMinimized,
        setIsCreateModalMinimized,
        isDrawerOpen,
        setIsDrawerOpen,
        page,
        setPage,
        limit,
        setLimit,
        editingRow,
        setEditingRow,
        viewingRow,
        setViewingRow,
        handleEdit,
        handleView,
        handleImport,
        isImportModalOpen,
        setIsImportModalOpen,
        isImporting: importMutation.isPending,
        isDownloadingTemplate: downloadTemplateMutation.isPending,
        isExportModalOpen,
        setIsExportModalOpen,
        selectedKeys,
        setSelectedKeys,
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        paginatedData,
        recordsFiltered,
        isLoading,
        handleApprove,
        handleReject,
        handleApproveOnBehalf,
        handleRejectOnBehalf,
        handleRecall,
        isApproving: approvalMutation.isPending || approveOnBehalfMutation.isPending,
        isApprovingAction: (uuid: string) =>
            (approvalMutation.isPending &&
                Array.isArray(approvalMutation.variables?.uuids_nghi_phep) &&
                approvalMutation.variables.uuids_nghi_phep.includes(uuid)) ||
            (approveOnBehalfMutation.isPending &&
                Array.isArray(approveOnBehalfMutation.variables?.uuids_nghi_phep) &&
                approveOnBehalfMutation.variables.uuids_nghi_phep.includes(uuid)),
        approveActionType:
            approvalMutation.variables?.hanh_dong || approveOnBehalfMutation.variables?.hanh_dong,
        handleBulkAction,
        handleBulkApproveOnBehalf,
        handleExport,
        handleExportByEmployee,
        handleDownloadTemplate,
        isExporting: exportMutation.isPending || exportByEmployeeMutation.isPending,
        handleSync,
        isSyncing: syncMutation.isPending,
        confirmModal,
        setConfirmModal,
        handleConfirmAction,
        openConfirm,
        search,
        setSearch,
        filter,
        setFilter,
        sortDescriptors,
        setSortDescriptors,
        showQuotaGrid,
        setShowQuotaGrid,
        quotaYear,
        setQuotaYear,
        month,
        setMonth,
        year,
        setYear,
        pinnedColumns,
        setPinnedColumns,
        visibleColumns,
        setVisibleColumns,
        columnWidths,
        setColumnWidths,
        isMinhChungModalOpen,
        setIsMinhChungModalOpen,
        minhChungRow,
        handleMinhChung,
        minhChungMutation,
        permissions,
        approvers: (approversData as any) || [],
        isPhucKhaoModalOpen,
        setIsPhucKhaoModalOpen,
        phucKhaoRow,
        handlePhucKhao,
        handleConfirmPhucKhao,
        isPhucKhaoLoading: phucKhaoMutation.isPending
    }
}
