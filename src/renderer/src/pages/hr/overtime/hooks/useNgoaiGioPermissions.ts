import { useMemo } from 'react'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { canAccess } from '@renderer/utils/permissions/permissions'

/**
 * Hook phân quyền module Ngoài Giờ — mirror 1:1 logic BE (Hrm_ngoaigio_model).
 *
 * 5 tầng vai trò (cao → thấp):
 *  1. Super Admin   → xem tất cả, duyệt tất cả
 *  2. Phòng TCHC    → xem tất cả, duyệt cấp 2
 *  3. Văn thư ĐV    → xem cùng đơn vị, tạo hộ
 *  4. Lãnh đạo ĐV   → xem đơn vị lãnh đạo, duyệt cấp 1
 *  5. Nhân viên     → chỉ xem đơn mình + đơn được phân duyệt
 */
export const useNgoaiGioPermissions = () => {
  const user = useAuthStore((s) => s.user)

  return useMemo(() => {
    // --- Role detection (Giữ lại tạm thời nếu có component cũ dùng tới) ---
    const isSuperAdmin = user?.ql_nguoi_dung_is_admin === '1'
    const isPhongTCHC = user?.ma_don_vi === 'PHONG_TCHC'

    const maVaiTro = user?.vai_tro?.find(
      (v) => v.is_active === 1 || v.is_active === '1'
    )?.ql_ma_vai_tro
    const isVanThuDonVi = maVaiTro === 'VAN_THU_DON_VI'

    const isLanhDao = user?.ql_nguoi_dung_la_lanh_dao === '1'
    const isLanhDaoDonVi = isLanhDao && user?.loai_lanh_dao === 'LANH_DAO_DON_VI'
    const isLanhDaoTCHC = isLanhDao && user?.loai_lanh_dao === 'LANH_DAO_TCHC'

    // --- Derived: Data scope (Phân dải dữ liệu được thấy) ---

    /** Cấp 1: Xem được TẤT CẢ đơn (Super Admin + Quyền xem tất cả) */
    const canViewAll = canAccess('ngoaigio.xemtatca')

    /** Cấp 2: Xem được đơn CÙNG đơn vị */
    const canViewUnit = canAccess('ngoaigio.xemdonvi')

    /** Cấp 3: Xem cá nhân (mặc định ai cũng có) */
    const canViewPersonal = canAccess('ngoaigio.xemcanhan') || true

    // --- Derived: Actions (Các Thao tác) ---

    /** Quyền tạo đơn cho bản thân */
    const canCreate = canAccess('ngoaigio.them') || true // Đặt true do tạo cho bản thân ai cũng cần, hoặc check theo db

    /** Quyền tạo đơn hộ cho người khác */
    const canCreateFor = canAccess('ngoaigio.taoho')

    /** Quyền sửa/xoá đơn */
    const canEdit = canAccess('ngoaigio.sua')
    const canDelete = canAccess('ngoaigio.xoa')

    /** Quyền duyệt đơn (Gộp cả duyệt cấp 1 & 2 thành 1 mã quyền ngoaigio.duyet) */
    const canApprove = canAccess('ngoaigio.duyet')
    const canApproveDotXuat = canAccess('ngoaigio.duyetdotxuat')
    const canApproveByTCHC = canAccess('ngoaigio.duyetbytochuc')

    const canExportExcel = canAccess('ngoaigio.xuatexcel')

    const canViewChamCong = canAccess('bangchamcong.xem')

    // Fallback cho properties duyệt level 1, 2 cũ:
    const canApproveLevel1 = canApprove
    const canApproveLevel2 = canApproveByTCHC

    // --- Derived: UI Visibility (Hiển thị View) ---

    /** Xem UI tabs quản lý hoặc grid chung cho admin/lãnh đạo */
    const canViewManagement = canViewAll || canViewUnit

    /** Hiển thị dropdown chọn nhân viên khi tạo mới */
    const canSelectEmployee = canCreateFor

    // Quyền bypass lock ngày/khung giờ: Lãnh đạo + Super Admin
    const canByLeader = isSuperAdmin || isLanhDao || isLanhDaoDonVi || isLanhDaoTCHC

    const canRegister = canAccess('ngoaigio.dangkydotxuat')

    console.log({
      canApproveLevel1,
      canApproveLevel2,
      canByLeader,
      isSuperAdmin,
      isLanhDao,
      isLanhDaoDonVi,
      isLanhDaoTCHC
    })

    return {
      // Role flags
      isSuperAdmin,
      isPhongTCHC,
      isVanThuDonVi,
      isLanhDaoDonVi,
      isLanhDaoTCHC,
      canApproveDotXuat,
      canApproveByTCHC,

      // Data scope
      canViewAll,
      canViewUnit,
      canViewPersonal,

      // Action by Lãnh đạo
      canByLeader,

      // Actions
      canApprove,
      canApproveLevel1,
      canApproveLevel2,
      canCreate,
      canCreateFor,
      canEdit,
      canDelete,
      canExportExcel,
      canViewChamCong,

      // UI visibility
      canViewManagement,
      canSelectEmployee
    }
  }, [user]) // Re-run when user changes (which means permissions fetched/changed)
}
