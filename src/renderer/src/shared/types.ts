// types.ts
export interface SelectedItem {
  id: string
  label: string
}

export interface UserItem {
  id: string
  name: string
}

export interface UnitItem {
  id: string
  name: string
}

export interface FormVanbandiData {
  so_hieu_van_ban?: string
  trich_yeu?: string
  nguoi_ky?: string
  ngay_ky?: string
  tra_loi_cv_den?: string
  ngay_tra_loi?: string
  id_loai?: string
  id_don_vi_soan?: string
  can_bo_soan?: string
  id_don_vi?: string
  noi_luu_tru?: string
  linh_vuc?: string
  id_tinh_chat?: string
  id_bao_mat?: string
  id_nguoi_nhan?: string
  selectedItems?: SelectedItem[]
  selectedUsers?: UserItem[]
}

export interface ContextMenuProps {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
}

export type TextareaProps = {
  label: string
  name?: string
  value?: string
  defaultValue?: string
  isRequired?: boolean
  rows?: number
  onChange?: (val: string) => void
  id?: string
}
