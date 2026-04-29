import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { rolesAxios, Role } from '@renderer/api/admin/rolesAxios'
import { useRoleStore } from '@renderer/store/useRoleStore'
import { Selection } from '@heroui/react'
import { toast } from "@heroui-v3/react";

export const useRoleLogic = () => {
    const {
        columnWidths,
        setColumnWidth,
        pinnedColumns,
        visibleColumns,
        setVisibleColumns,
        reset,
        page,
        setPage,
        limit,
        setLimit,
        search,
        setSearch,
        sortDescriptors,
        setSortDescriptors,
        activeRoleId,
        setActiveRoleId,
        isCollapsed,
        setIsCollapsed,
        activeTab,
        setActiveTab,
        hasUnsavedChanges,
        setHasUnsavedChanges
    } = useRoleStore()

    const queryClient = useQueryClient()
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))
    const [isResetting, setIsResetting] = useState(false)
    const [recordsTotal, setRecordsTotal] = useState(0)
    const [recordsFiltered, setRecordsFiltered] = useState(0)

    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        content: '',
        onConfirm: () => { },
        isDanger: false,
        isLoading: false
    })

    // Role Modal State
    const [roleModal, setRoleModal] = useState<{ isOpen: boolean; role: Role | null }>({
        isOpen: false,
        role: null
    })

    const handleCreateRole = () => {
        setRoleModal({ isOpen: true, role: null })
    }

    const handleEditRole = (role: Role) => {
        setRoleModal({ isOpen: true, role })
    }

    const handleDeleteRole = (role: Role) => {
        setConfirmModal({
            isOpen: true,
            title: 'Xác nhận xóa vai trò',
            content: `Bạn có chắc chắn muốn xóa vai trò "${role.ql_vai_tro_ten}"? Hành động này không thể hoàn tác.`,
            isDanger: true,
            isLoading: false,
            onConfirm: async () => {
                setConfirmModal((p) => ({ ...p, isLoading: true }))
                try {
                    const res = await rolesAxios.delete(role.ql_vai_tro_id)
                    if (res.success) {
                        toast('Thành công', { description: 'Xóa vai trò thành công', variant: 'success' })
                        queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
                        queryClient.invalidateQueries({ queryKey: ['roleOptionsSidebar'] })
                        setConfirmModal((p) => ({ ...p, isOpen: false }))
                    } else {
                        toast('Lỗi', { description: res.message || 'Xóa thất bại', variant: 'danger' })
                    }
                } catch (error: any) {
                    toast('Lỗi', { description: error.message || 'Có lỗi xảy ra', variant: 'danger' })
                } finally {
                    setConfirmModal((p) => ({ ...p, isLoading: false }))
                }
            }
        })
    }

    const handleResetTable = () => {
        setIsResetting(true)
        setActiveRoleId(undefined)
        setTimeout(() => {
            reset()
            setIsResetting(false)
        }, 500)
    }

    const { data: responseData, isLoading } = useQuery({
        queryKey: ['admin-roles', page, limit, search, sortDescriptors, activeRoleId],
        queryFn: async () => {
            const order = sortDescriptors.map((desc) => ({
                column: desc.column,
                dir: desc.direction === 'ascending' ? 'asc' : 'desc'
            }))

            const params = {
                page,
                per_page: limit,
                search: activeRoleId ? '' : search,
                id: activeRoleId,
                order: JSON.stringify(order)
            }

            const res: any = await rolesAxios.getAll(params)
            return res?.data || { data: [], recordsTotal: 0, recordsFiltered: 0 }
        },
        placeholderData: keepPreviousData
    })

    useEffect(() => {
        if (responseData) {
            setRecordsTotal(responseData.recordsTotal || 0)
            setRecordsFiltered(responseData.recordsFiltered || 0)

            if (!activeRoleId && responseData.data?.length > 0) {
                const firstRole = responseData.data[0]
                setActiveRoleId(firstRole.ql_vai_tro_id)
            }
        }
    }, [responseData, activeRoleId])

    const roles: Role[] = Array.isArray(responseData?.data) ? responseData.data : []
    const activeRole = roles.find(r => String(r.ql_vai_tro_id) === String(activeRoleId))

    const handleRoleSelect = (role: any) => {
        const roleId = role.ql_vai_tro_id || role.value

        const changeRole = () => {
            if (activeRoleId !== roleId) {
                setActiveRoleId(roleId)
                setPage(1)
            }
        }

        if (hasUnsavedChanges) {
            setConfirmModal({
                isOpen: true,
                title: 'Thay đổi chưa được lưu',
                content: 'Bạn có các thay đổi chưa được lưu. Nếu chuyển vai trò, các thay đổi này sẽ bị mất. Bạn có chắc chắn muốn tiếp tục?',
                isDanger: true,
                isLoading: false,
                onConfirm: () => {
                    setHasUnsavedChanges(false)
                    changeRole()
                    setConfirmModal(prev => ({ ...prev, isOpen: false }))
                }
            })
            return
        }

        changeRole()
    }

    return {
        // State
        isCollapsed,
        setIsCollapsed,
        activeRoleId,
        activeRole,
        roles,
        isLoading,
        recordsTotal,
        recordsFiltered,
        selectedKeys,
        setSelectedKeys,
        isResetting,
        confirmModal,
        setConfirmModal,
        roleModal,
        setRoleModal,
        activeTab,
        setActiveTab,

        // Handlers
        handleCreateRole,
        handleEditRole,
        handleDeleteRole,
        handleResetTable,
        handleRoleSelect,
        queryClient
    }
}
