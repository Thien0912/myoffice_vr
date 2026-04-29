function formatTypeVanban(loai_van_ban: number | null): string {
  switch (loai_van_ban) {
    case 1:
      return 'Văn bản đến'
    case 2:
      return 'Văn bản đi'
    case 3:
      return 'Văn bản nội bộ'
    default:
      return 'Không xác định'
  }
}
