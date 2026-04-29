import { callApi } from '../callApi'

export interface Role {
  ql_vai_tro_id: number | string
  ql_vai_tro_ten: string
  ql_vai_tro_mo_ta?: string
  ql_vai_tro_ngay_tao?: string
  ql_vai_tro_ngay_cap_nhat?: string
  vai_tro?: string
  total_members?: number
  [key: string]: any
}

export const rolesAxios = {
  getAll: (params?: any) => {
    return callApi('admin/ql/roles', {
      method: 'GET',
      params
    })
  },
  getOptions: () => {
    return callApi('admin/ql/roles/options', {
      method: 'GET'
    })
  },
  create: (data: any) => {
    return callApi('admin/ql/roles/create', {
      method: 'POST',
      data
    })
  },
  update: (id: string | number, data: any) => {
    return callApi(`admin/ql/roles/update/${id}`, {
      method: 'PUT',
      data
    })
  },
  delete: (id: string | number) => {
    return callApi(`admin/ql/roles/delete/${id}`, {
      method: 'DELETE'
    })
  },
  getPermissions: () => {
    return callApi('admin/ql/roles/permissions', {
      method: 'GET'
    })
  },
  addMember: (roleId: string | number, userIds: string[]) => {
    return callApi(`admin/ql/roles/add_user/${roleId}`, {
      method: 'POST',
      data: { user_ids: userIds }
    })
  },
  removeMember: (roleId: string | number, userIds: string[]) => {
    return callApi(`admin/ql/roles/remove_user/${roleId}`, {
      method: 'POST',
      data: { user_ids: userIds }
    })
  },
  getDetail: (id: string | number) => {
    return callApi(`admin/ql/roles/show/${id}`, {
      method: 'GET'
    })
  },
  getRolePermissions: (roleId: string | number) => {
    return callApi(`admin/ql/roles/role_permissions/${roleId}`, {
      method: 'GET'
    })
  },
  saveRolePermissions: (roleId: string | number, permissionIds: (string | number)[]) => {
    return callApi(`admin/ql/roles/set_role_permissions/${roleId}`, {
      method: 'PUT',
      data: { permission_ids: permissionIds }
    })
  }
}
