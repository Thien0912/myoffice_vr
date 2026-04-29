// Status văn bản đến => DNCOFFIC_FRONTEND
// export const STATUS_VBDEN = [
//   { key: 'LUU_TRU', label: 'Lưu trữ', value: 6, color: 'sky' },
//   { key: 'CHO_BUT_PHE', label: 'Chờ bút phê', value: 2, color: 'blue' },
//   { key: 'DA_BUT_PHE', label: 'Đã bút phê', value: 3, color: 'orange' },
//   { key: 'DA_CHUYEN', label: 'Đã chuyển', value: 4, color: 'blue' },
//   { key: 'DA_XU_LY', label: 'Đã xử lý', value: 5, color: 'amber' },
//   { key: 'HOAN_THANH', label: 'Hoàn thành', value: 10, color: 'green' }
// ]
export const STATUS_VBDEN_MAP: Record<string, { label: string; color: string; value: number }> = {
  LUU_TRU: { label: 'Lưu trữ', color: 'sky', value: 6 },
  TIEP_NHAN: { label: 'Tiếp nhận', color: 'blue', value: 1 },
  CHO_BUT_PHE: { label: 'Chờ bút phê', color: 'blue', value: 2 },
  DA_BUT_PHE: { label: 'Đã bút phê', color: 'orange', value: 3 },
  DA_CHUYEN: { label: 'Đã chuyển', color: 'blue', value: 4 },
  DA_XU_LY: { label: 'Đã xử lý', color: 'amber', value: 5 },
  HOAN_THANH: { label: 'Hoàn thành', color: 'green', value: 10 }
}

export const STATUS_VBDI_MAP: Record<string, { label: string; color: string; value: number }> = {
  TAO_MOI: { label: 'Tạo mới', color: 'teal', value: 1 },
  DA_BAN_HANH: { label: 'Đã ban hành', color: 'blue', value: 2 },
  CHO_XU_LY: { label: 'Chờ xử lý', color: 'yellow', value: 3 },
  DA_PHAN_HOI: { label: 'Đã phản hồi', color: 'green', value: 4 },
  CHUA_PHAN_HOI: { label: 'Chưa phản hồi', color: 'red', value: 5 },
  LUU_TRU: { label: 'Lưu trữ', color: 'brown', value: 6 },
  HOAN_THANH: { label: 'Hoàn thành', color: 'teal', value: 7 }
}

export const getStatusDocument = (status: number, type: string) => {
  const statusMap = type === '1' ? STATUS_VBDEN_MAP : STATUS_VBDI_MAP
  const matchedStatus = Object.values(statusMap).find((s) => s.value === Number(status))
  return matchedStatus || { label: 'Không xác định', color: 'gray', value: 0 }
}
