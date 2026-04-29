export interface RequiredFields {
  ngay_ket_thuc: boolean
  muc_luong: boolean
  luong_co_ban: boolean
  muc_luong_bao_hiem: boolean
}

export interface LoaiHopDongItem {
  label: string
  value: string
  color: string
  time: string
  percent: string
  required: RequiredFields
}

export const LOAI_HOP_DONG: Record<string, LoaiHopDongItem> = {
  Hoc_viec: {
    label: 'Học việc',
    value: 'Hoc_viec',
    color: 'cyan',
    time: '2',
    percent: '100',
    required: {
      ngay_ket_thuc: true,
      muc_luong: true,
      luong_co_ban: false,
      muc_luong_bao_hiem: false
    }
  },

  Thu_viec: {
    label: 'Thử việc',
    value: 'Thu_viec',
    color: 'red',
    time: '2',
    percent: '85',
    required: {
      ngay_ket_thuc: true,
      muc_luong: true,
      luong_co_ban: false,
      muc_luong_bao_hiem: false
    }
  },

  Co_thoi_han: {
    label: 'Chính thức',
    value: 'Co_thoi_han',
    color: 'yellow',
    time: '12',
    percent: '100',
    required: {
      ngay_ket_thuc: true,
      muc_luong: false,
      luong_co_ban: true,
      muc_luong_bao_hiem: true
    }
  },

  Khong_thoi_han: {
    label: 'Không xác định thời hạn',
    value: 'Khong_thoi_han',
    color: 'green',
    time: '',
    percent: '100',
    required: {
      ngay_ket_thuc: false,
      muc_luong: false,
      luong_co_ban: true,
      muc_luong_bao_hiem: true
    }
  },

  Dao_tao: {
    label: 'Hợp đồng đào tạo',
    value: 'Dao_tao',
    color: 'blue',
    time: '',
    percent: '50',
    required: {
      ngay_ket_thuc: false,
      muc_luong: false,
      luong_co_ban: true,
      muc_luong_bao_hiem: true
    }
  },

  Co_van: {
    label: 'Hợp đồng cố vấn',
    value: 'Co_van',
    color: 'blue',
    time: '12',
    percent: '0',
    required: {
      ngay_ket_thuc: true,
      muc_luong: false,
      luong_co_ban: true,
      muc_luong_bao_hiem: true
    }
  }
}

export interface HinhThucLamViecItem {
  label: string
  value: string
  color: string
}

export const HINH_THUC_LAM_VIEC: Record<string, HinhThucLamViecItem> = {
  TOAN_THOI_GIAN: {
    label: 'Toàn thời gian',
    value: 'TOAN_THOI_GIAN',
    color: '#3577f1'
  },
  BAN_THOI_GIAN: {
    label: 'Bán thời gian',
    value: 'BAN_THOI_GIAN',
    color: '#45cb85'
  },
  CONG_TAC_VIEN: {
    label: 'Cộng tác viên',
    value: 'CONG_TAC_VIEN',
    color: '#ffbe0b'
  },
  LAM_VIEC_TU_XA: {
    label: 'Làm việc từ xa',
    value: 'LAM_VIEC_TU_XA',
    color: '#f4a261'
  }
}

export const formatNumber = (num) => {
  if (!num) return ''
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export const unformatNumber = (val) => {
  return val.replace(/\./g, '')
}

export const convertSize = (str: string | number): number => {
  if (typeof str === 'number') return str  // already bytes
  if (!str || typeof str !== 'string') return 0
  if (!str.includes(' ')) return parseFloat(str) || 0  // plain numeric string → bytes
  const [num, unit] = str.split(' ')
  const n = parseFloat(num)
  if (unit === 'KB') return n * 1024
  if (unit === 'MB') return n * 1024 * 1024
  return n
}

export const guessMimeType = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'pdf':
      return 'application/pdf'
    case 'doc':
    case 'docx':
      return 'application/msword'
    case 'xlsx':
    case 'xls':
      return 'application/vnd.ms-excel'
    default:
      return 'application/octet-stream'
  }
}
