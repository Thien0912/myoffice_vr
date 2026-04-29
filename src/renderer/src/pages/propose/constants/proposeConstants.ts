export const STATUS_MAP = {
  nhap: { label: 'Nháp', color: 'default' as const },
  dang_xu_ly: { label: 'Đang xử lý', color: 'warning' as const },
  da_duyet: { label: 'Đã duyệt', color: 'success' as const },
  tu_choi: { label: 'Từ chối', color: 'danger' as const }
}

export const PROPOSE_TYPES = {
  purchase: { label: 'Mua sắm thiết bị/văn phòng phẩm' },
  repair: { label: 'Sửa chữa/Bảo trì' },
  personnel: { label: 'Nhân sự/Tuyển dụng' },
  financial: { label: 'Tài chính/Tạm ứng' },
  other: { label: 'Đề xuất khác' }
}

export const PRIORITY_MAP = {
  low: { label: 'Thấp', color: 'default' as const },
  medium: { label: 'Trung bình', color: 'warning' as const },
  high: { label: 'Cao', color: 'danger' as const }
}
