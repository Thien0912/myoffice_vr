import { useState, useEffect } from 'react'
import { Selection } from '@heroui/react'
import { useQuery, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query'
import { User } from '@renderer/api/admin/usersAxios'
import { Role } from '@renderer/api/admin/rolesAxios'
import { mockUsersAxios, mockRolesAxios } from '../fakeData'
import { toast } from "@heroui-v3/react";

interface UseRoleMemberLogicProps {
    activeRole: Role | undefined
}

export const useRoleMemberLogic = ({ activeRole }: UseRoleMemberLogicProps) => {
    const queryClient = useQueryClient()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // State for InRole Table
    const [searchInRole, setSearchInRole] = useState('')
    const [debouncedSearchInRole, setDebouncedSearchInRole] = useState('')
    const [pageInRole, setPageInRole] = useState(1)
    const [limitInRole, setLimitInRole] = useState(10)

    // State for Available Table
    const [searchAvailable, setSearchAvailable] = useState('')
    const [debouncedSearchAvailable, setDebouncedSearchAvailable] = useState('')
    const [pageAvailable, setPageAvailable] = useState(1)
    const [limitAvailable, setLimitAvailable] = useState(10)

    // Manage selection
    const [selectedInRole, setSelectedInRole] = useState<Selection>(new Set([]))
    const [selectedAvailable, setSelectedAvailable] = useState<Selection>(new Set([]))
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})

    // Mutations
    const addMembersMutation = useMutation({
        mutationFn: (userIds: (string | number)[]) => mockRolesAxios.addMember(activeRole!.ql_vai_tro_id, userIds as string[]),
        onSuccess: (res: any) => {
            if (res.success) {
                toast('Thành công', { description: 'Đã thêm thành viên vào vai trò', variant: 'success' })
                queryClient.invalidateQueries({ queryKey: ['role-members'] })
                queryClient.invalidateQueries({ queryKey: ['available-users'] })
                queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
                setSelectedAvailable(new Set([]))
            } else {
                toast('Lỗi', { description: res.message || 'Không thể thêm thành viên', variant: 'danger' })
            }
        }
    })

    const removeMembersMutation = useMutation({
        mutationFn: (userIds: (string | number)[]) => mockRolesAxios.removeMember(activeRole!.ql_vai_tro_id, userIds as string[]),
        onSuccess: (res: any) => {
            if (res.success) {
                toast('Thành công', { description: 'Đã xóa thành viên khỏi vai trò', variant: 'success' })
                queryClient.invalidateQueries({ queryKey: ['role-members'] })
                queryClient.invalidateQueries({ queryKey: ['available-users'] })
                queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
                setSelectedInRole(new Set([]))
            } else {
                toast('Lỗi', { description: res.message || 'Không thể xóa thành viên', variant: 'danger' })
            }
        }
    })

    const handleAddMembers = () => {
        if (selectedAvailable instanceof Set && selectedAvailable.size > 0) {
            const ids = Array.from(selectedAvailable)
            addMembersMutation.mutate(ids as (string | number)[])
        } else if (selectedAvailable === 'all') {
            toast('Thông báo', { description: 'Tính năng chọn tất cả đang được cập nhật', variant: 'warning' })
        } else {
            toast('Thông báo', { description: 'Vui lòng chọn người dùng muốn thêm', variant: 'warning' })
        }
    }

    const handleRemoveMembers = () => {
        if (selectedInRole instanceof Set && selectedInRole.size > 0) {
            const ids = Array.from(selectedInRole)
            removeMembersMutation.mutate(ids as (string | number)[])
        } else if (selectedInRole === 'all') {
            toast('Thông báo', { description: 'Tính năng chọn tất cả đang được cập nhật', variant: 'warning' })
        } else {
            toast('Thông báo', { description: 'Vui lòng chọn thành viên muốn xóa', variant: 'warning' })
        }
    }

    // Reset page & search when switching roles
    useEffect(() => {
        setPageInRole(1)
        setPageAvailable(1)
        setSearchInRole('')
        setSearchAvailable('')
        setSelectedInRole(new Set([]))
        setSelectedAvailable(new Set([]))
    }, [activeRole?.ql_vai_tro_id])

    // Debounce search InRole
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchInRole(searchInRole)
            setPageInRole(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchInRole])

    // Debounce search Available
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchAvailable(searchAvailable)
            setPageAvailable(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchAvailable])

    // Queries
    const { data: currentMembersData, isLoading: isLoadingCurrent } = useQuery({
        queryKey: ['role-members', activeRole?.ql_vai_tro_id, pageInRole, limitInRole, debouncedSearchInRole],
        queryFn: async () => {
            if (!activeRole) return { data: [], recordsTotal: 0, recordsFiltered: 0 }
            const res: any = await mockUsersAxios.getAll({
                page: pageInRole,
                per_page: limitInRole,
                search: debouncedSearchInRole,
                ql_vai_tro_id: activeRole.ql_vai_tro_id,
                active_flag: 1
            })
            return res?.data || { data: [], recordsTotal: 0, recordsFiltered: 0 }
        },
        enabled: !!activeRole?.ql_vai_tro_id,
        placeholderData: keepPreviousData
    })

    const { data: availableUsersData, isLoading: isLoadingAvailable } = useQuery({
        queryKey: ['available-users', activeRole?.ql_vai_tro_id, pageAvailable, limitAvailable, debouncedSearchAvailable],
        queryFn: async () => {
            if (!activeRole) return { data: [], recordsTotal: 0, recordsFiltered: 0 }
            const res: any = await mockUsersAxios.getAll({
                page: pageAvailable,
                per_page: limitAvailable,
                search: debouncedSearchAvailable,
                active_flag: 1,
                exclude_ql_vai_tro_id: activeRole.ql_vai_tro_id
            })
            return res?.data || { data: [], recordsTotal: 0, recordsFiltered: 0 }
        },
        enabled: !!activeRole?.ql_vai_tro_id,
        placeholderData: keepPreviousData
    })

    const currentMembers: User[] = Array.isArray(currentMembersData?.data) ? currentMembersData.data : []
    const availableUsers: User[] = Array.isArray(availableUsersData?.data) ? availableUsersData.data : []
    const recordsFilteredCurrent = currentMembersData?.recordsFiltered || 0
    const recordsFilteredAvailable = availableUsersData?.recordsFiltered || 0

    return {
        isAddModalOpen,
        setIsAddModalOpen,
        // InRole State
        searchInRole,
        setSearchInRole,
        pageInRole,
        setPageInRole,
        limitInRole,
        setLimitInRole,
        // Available State
        searchAvailable,
        setSearchAvailable,
        pageAvailable,
        setPageAvailable,
        limitAvailable,
        setLimitAvailable,
        // Other
        selectedInRole,
        setSelectedInRole,
        selectedAvailable,
        setSelectedAvailable,
        columnWidths,
        setColumnWidths,
        currentMembers,
        availableUsers,
        isLoadingCurrent,
        isLoadingAvailable,
        recordsFilteredCurrent,
        recordsFilteredAvailable,
        handleAddMembers,
        handleRemoveMembers,
        isPendingAdd: addMembersMutation.isPending,
        isPendingRemove: removeMembersMutation.isPending
    }
}
