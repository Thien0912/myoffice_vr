import { toast } from '@heroui-v3/react'
import { Role, rolesAxios } from '@renderer/api/admin/rolesAxios'
import { useRoleStore } from '@renderer/store/useRoleStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

interface Permission {
  ql_quyen_id: number | string
  ql_quyen_ten: string
  ql_quyen_mo_ta?: string
  ql_quyen_khoa: string
  ql_quyen_loai_module?: number | string
  ql_quyen_parent_id: number | string | null
  ql_quyen_action_type?: number | string
  ql_quyen_children?: Permission[]
}

interface UseRolePermissionLogicProps {
  activeRole: Role | undefined
}

export const useRolePermissionLogic = ({ activeRole }: UseRolePermissionLogicProps) => {
  const queryClient = useQueryClient()
  const { setHasUnsavedChanges } = useRoleStore()
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<(string | number)[]>([])
  const [search, setSearch] = useState('')

  // Fetch all permissions and current role's permissions
  const { data: permissionData, isLoading } = useQuery({
    queryKey: ['role-permissions-manage', activeRole?.ql_vai_tro_id],
    queryFn: async () => {
      if (!activeRole) return { all: [], current: [] }
      const res: any = await rolesAxios.getRolePermissions(activeRole.ql_vai_tro_id)
      if (res.success) {
        return {
          all: res.permissions || [],
          current: res.data?.ql_quyen || []
        }
      }
      return { all: [], current: [] }
    },
    enabled: !!activeRole?.ql_vai_tro_id
  })

  const groupedPermissions = useMemo(() => {
    const all = permissionData?.all || []
    const parents = all.filter(
      (p: Permission) =>
        !p.ql_quyen_parent_id || p.ql_quyen_parent_id === '0' || p.ql_quyen_parent_id === 0
    )

    const moduleMapping: Record<number, { ten: string; mo_ta: string }> = {
      1: { ten: 'Quản lý văn bản', mo_ta: 'Tất cả các chức năng liên quan đến văn bản' },
      2: { ten: 'Quản lý ngoài giờ', mo_ta: 'Tất cả các chức năng liên quan đến ngoài giờ' },
      9: { ten: 'Quản lý hồ sơ', mo_ta: 'Tất cả các chức năng liên quan đến hồ sơ' },
      8: { ten: 'Quản trị hệ thống', mo_ta: 'Quản trị hệ thống' },
      12: { ten: 'Quản lý danh mục hệ thống', mo_ta: 'Quản lý danh mục hệ thống' },
      13: { ten: 'Quản lý nghỉ phép', mo_ta: 'Quản lý nghỉ phép' }
    }

    const virtualModules: Record<number, any> = {}
    const result: any[] = []

    parents.forEach((parent: Permission) => {
      const moduleId = Number(parent.ql_quyen_loai_module)

      const children = all.filter(
        (p: Permission) => String(p.ql_quyen_parent_id) === String(parent.ql_quyen_id)
      )
      const filteredChildren = children.filter(
        (child) =>
          child.ql_quyen_ten.toLowerCase().includes(search.toLowerCase()) ||
          parent.ql_quyen_ten.toLowerCase().includes(search.toLowerCase())
      )

      if (
        filteredChildren.length === 0 &&
        !parent.ql_quyen_ten.toLowerCase().includes(search.toLowerCase())
      )
        return

      // Group by ql_quyen_loai_module dynamically if module exists (> 0)
      if (moduleId > 0) {
        if (!virtualModules[moduleId]) {
          virtualModules[moduleId] = {
            ql_quyen_id: `virtual-module-${moduleId}`,
            ql_quyen_ten: moduleMapping[moduleId]?.ten || `Nhóm chức năng ${moduleId}`,
            ql_quyen_mo_ta: moduleMapping[moduleId]?.mo_ta || '',
            ql_quyen_loai_module: moduleId,
            isMerged: true,
            subModules: []
          }
        }
        virtualModules[moduleId].subModules.push({
          ...parent,
          children: filteredChildren
        })
      } else {
        result.push({
          ...parent,
          ql_quyen_loai_module: 999, // push to bottom
          children: filteredChildren,
          subModules: [{ ...parent, children: filteredChildren, isMain: true }]
        })
      }
    })

    // Add virtual modules to result if they have items
    Object.values(virtualModules).forEach((vm) => {
      if (vm.subModules.length > 0) {
        result.push(vm)
      }
    })

    // Sort by ql_quyen_loai_module
    result.sort(
      (a, b) => (Number(a.ql_quyen_loai_module) || 999) - (Number(b.ql_quyen_loai_module) || 999)
    )

    return result
  }, [permissionData?.all, search])

  // Initialize selected permissions
  useEffect(() => {
    if (permissionData?.current) {
      const ids = (permissionData.current as Permission[]).map((p) => p.ql_quyen_id)
      setSelectedPermissionIds(ids)
    }
  }, [permissionData?.current])

  const togglePermission = (id: string | number) => {
    setSelectedPermissionIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const toggleGroup = (parentId: string | number, childrenIds: (string | number)[]) => {
    const allSelected = childrenIds.every((id) => selectedPermissionIds.includes(id))
    if (allSelected) {
      // Unselect all
      setSelectedPermissionIds((prev) =>
        prev.filter((id) => !childrenIds.includes(id) && id !== parentId)
      )
    } else {
      // Select all
      setSelectedPermissionIds((prev) => {
        const newIds = [...prev]
        if (!newIds.includes(parentId)) newIds.push(parentId)
        childrenIds.forEach((id) => {
          if (!newIds.includes(id)) newIds.push(id)
        })
        return newIds
      })
    }
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      rolesAxios.saveRolePermissions(activeRole!.ql_vai_tro_id, selectedPermissionIds),
    onSuccess: (res: any) => {
      if (res.success) {
        toast('Thành công', { description: 'Cập nhật quyền hạn thành công', variant: 'success' })
        queryClient.invalidateQueries({
          queryKey: ['role-permissions-manage', activeRole?.ql_vai_tro_id]
        })
        // Tải lại Role Detail để cập nhật badge hoặc info (nếu có)
        queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      } else {
        toast('Lỗi', { description: res.message || 'Cập nhật thất bại', variant: 'danger' })
      }
    }
  })

  const hasChanges = useMemo(() => {
    if (!permissionData?.current) return false
    const currentIds = (permissionData.current as Permission[])
      .map((p) => String(p.ql_quyen_id))
      .sort()
    const selectedIds = selectedPermissionIds.map((id) => String(id)).sort()
    return JSON.stringify(currentIds) !== JSON.stringify(selectedIds)
  }, [permissionData?.current, selectedPermissionIds])

  // Sync with global store for unsaved changes warning
  useEffect(() => {
    setHasUnsavedChanges(hasChanges)
    // Cleanup on unmount
    return () => setHasUnsavedChanges(false)
  }, [hasChanges, setHasUnsavedChanges])

  return {
    groupedPermissions,
    selectedPermissionIds,
    isLoading,
    search,
    setSearch,
    togglePermission,
    toggleGroup,
    handleSave: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    hasChanges
  }
}
