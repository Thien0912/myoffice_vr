import {
  baoMatData,
  caLamViecData,
  coQuanData,
  daoTAoData,
  donviData,
  hinhThucData,
  loaiNghiPhepData,
  loaiVanBanData,
  tinhChatData,
  viTriCongViecData,
  ngayLeData,
  phongBanData,
  trungTamData,
  truongData,
  khoaData
} from './data'

/* ── history types ─────────────────────────────────────────────────── */

export interface HistoryEntry {
  id: number
  hanh_dong: 'Tạo mới' | 'Cập nhật' | 'Xóa'
  bang_du_lieu: string
  ten_nguoi_thuc_hien: string
  thoi_gian: string
  chi_tiet?: Record<string, { cu: any; moi: any }>
  id_ban_ghi: string | number
  ten_ban_ghi?: string
  noi_dung?: string
}

export const ENTITY_LABELS: Record<string, string> = {
  baomat: 'Bảo mật',
  calamviec: 'Ca làm việc',
  coquan: 'Cơ quan',
  daotao: 'Đào tạo',
  donvi: 'Đơn vị',
  hinhthuc: 'Hình thức',
  loainghiphep: 'Loại nghỉ phép',
  loaivanban: 'Loại văn bản',
  tinhchat: 'Tính chất',
  vitricongviec: 'Vị trí công việc',
  ngayle: 'Lịch nghỉ phép',
  phongban: 'Phòng ban',
  trungtam: 'Trung tâm',
  truong: 'Trường',
  khoa: 'Khoa'
}

// Entity field name to Vietnamese label mapping
// Global, but each service can override via opts.nameField
export const DEFAULT_NAME_FIELDS: Record<string, string> = {
  baomat: 'ten_bao_mat',
  calamviec: 'ca_lam_viec',
  coquan: 'ten_co_quan',
  daotao: 'ten_khoa_hoc',
  donvi: 'ten_don_vi',
  hinhthuc: 'ten_hinh_thuc',
  loainghiphep: 'ten_loai_phep',
  loaivanban: 'ten_loai',
  tinhchat: 'ten_tinh_chat',
  vitricongviec: 'ten_cong_viec',
  ngayle: 'ten_ngay_le',
  phongban: 'ten_phong_ban',
  trungtam: 'ten_trung_tam',
  truong: 'ten_truong',
  khoa: 'ten_khoa'
}

/* ── shared history log ────────────────────────────────────────────── */

let historyNextId = 1
const historyLog: HistoryEntry[] = []

function pushHistory(entry: Omit<HistoryEntry, 'id'>) {
  historyLog.unshift({ ...entry, id: historyNextId++ })
  if (historyLog.length > 500) historyLog.length = 500
}

function computeDiffs(oldItem: Record<string, any>, newPayload: Record<string, any>, pk: string, inlineEdit?: boolean): Record<string, { cu: any; moi: any }> {
  const diffs: Record<string, { cu: any; moi: any }> = {}
  if (inlineEdit) {
    const col = newPayload.column
    const val = newPayload.value
    if (col && oldItem[col] !== val) {
      diffs[col] = { cu: oldItem[col] ?? '', moi: val ?? '' }
    }
    return diffs
  }
  for (const key of Object.keys({ ...oldItem, ...newPayload })) {
    if (key === pk || key === '_pk' || key === 'inline_edit' || key === 'column' || key === 'value') continue
    const oldVal = oldItem[key]
    const newVal = newPayload[key]
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diffs[key] = { cu: oldVal ?? '', moi: newVal ?? '' }
    }
  }
  return diffs
}

export function getHistory(params: {
  bang_du_lieu?: string
  search?: string
  hanh_dong?: string
  page?: number
  length?: number
} = {}) {
  let filtered = [...historyLog]

  if (params.bang_du_lieu) {
    filtered = filtered.filter((h) => h.bang_du_lieu === params.bang_du_lieu)
  }

  if (params.search) {
    const s = params.search.toLowerCase()
    filtered = filtered.filter((h) =>
      h.ten_nguoi_thuc_hien?.toLowerCase().includes(s) ||
      h.noi_dung?.toLowerCase().includes(s) ||
      h.ten_ban_ghi?.toLowerCase().includes(s) ||
      JSON.stringify(h.chi_tiet || {}).toLowerCase().includes(s)
    )
  }

  if (params.hanh_dong) {
    filtered = filtered.filter((h) => h.hanh_dong === params.hanh_dong)
  }

  const total = filtered.length
  const page = params.page || 1
  const length = params.length || 20
  const start = (page - 1) * length
  const paged = filtered.slice(start, start + length)

  return { data: paged, recordsTotal: total, recordsFiltered: total }
}

export function getHistoryEntityOptions() {
  const entities = [...new Set(historyLog.map((h) => h.bang_du_lieu))]
  return entities.map((key) => ({
    value: key,
    label: ENTITY_LABELS[key] || key
  }))
}

/* ── helper: convert FormData to plain object ──────────────────────── */

function formDataToObject(fd: FormData | Record<string, any>): Record<string, any> {
  if (!(fd instanceof FormData)) return fd
  const obj: Record<string, any> = {}
  fd.forEach((value, key) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        obj[key] = parsed
      } catch {
        obj[key] = value
      }
    } else {
      obj[key] = value
    }
  })
  return obj
}

/* ── helper: create a mock CRUD service ─────────────────────────────── */

function createMockService<T extends Record<string, any>>(
  name: string,
  initialData: T[],
  pk: string,
  opts?: { mapPayload?: (p: any) => any; nameField?: string }
) {
  let data: T[] = [...initialData]
  let nextId: number =
    data.reduce((max, d) => Math.max(max, Number(d[pk] || 0)), 0) + 1

  const label = ENTITY_LABELS[name] || name
  const nameField = opts?.nameField || DEFAULT_NAME_FIELDS[name] || 'ten'

  function cloneItem(item: T): T {
    return JSON.parse(JSON.stringify(item))
  }

  return {
    _pk: pk,

    fetch(params: Record<string, any> = {}, id?: string | number) {
      if (id !== undefined && id !== null) {
        const item = data.find((d) => String(d[pk]) === String(id))
        return Promise.resolve({ success: true, data: item ? cloneItem(item) : null })
      }

      let filtered = [...data]
      const search = (params.searchValue || '').toString().toLowerCase()
      const searchKey = params.searchKey

      if (search) {
        filtered = filtered.filter((row) =>
          Object.values(row).some((v) =>
            String(v || '').toLowerCase().includes(search)
          )
        )
      }

      if (searchKey) {
        try {
          const parsed = JSON.parse(searchKey)
          const classify = parsed.selectedClassify
          if (classify && classify !== 'all') {
            filtered = filtered.filter(
              (row) => row.loai === classify || row.thuoc_nhom === classify
            )
          }
        } catch { /* ignore */ }
      }

      const order: { column: string; dir: string }[] = params.order || []
      for (const o of order.reverse()) {
        const col = o.column
        const dir = o.dir === 'asc' ? 1 : -1
        filtered.sort((a, b) => {
          const va = a[col] ?? ''
          const vb = b[col] ?? ''
          if (va < vb) return -1 * dir
          if (va > vb) return 1 * dir
          return 0
        })
      }

      const recordsFiltered = filtered.length
      const start = params.start || 0
      const length = params.length !== undefined ? params.length : 10
      const paged = length > 0 ? filtered.slice(start, start + length) : filtered

      return Promise.resolve({
        success: true,
        data: paged.map(cloneItem),
        recordsTotal: data.length,
        recordsFiltered
      })
    },

    show(id: string | number) {
      const item = data.find((d) => String(d[pk]) === String(id))
      return Promise.resolve({ success: true, data: item ? cloneItem(item) : null })
    },

    create(payload: any) {
      const plain = formDataToObject(payload)
      const id = nextId++
      const mapped = opts?.mapPayload ? opts.mapPayload(plain) : plain
      if (mapped instanceof FormData) {
        return Promise.resolve({ success: false, message: 'Invalid payload format' })
      }
      const newItem: any = { ...mapped, [pk]: id }
      data.unshift(newItem)

      const chi_tiet: Record<string, { cu: any; moi: any }> = {}
      for (const key of Object.keys(newItem)) {
        if (key === pk || key === '_pk') continue
        chi_tiet[key] = { cu: null, moi: newItem[key] ?? '' }
      }

      pushHistory({
        hanh_dong: 'Tạo mới',
        bang_du_lieu: name,
        ten_nguoi_thuc_hien: 'Người dùng (Mock)',
        thoi_gian: new Date().toISOString(),
        chi_tiet,
        id_ban_ghi: id,
        ten_ban_ghi: newItem[nameField] || `#${id}`,
        noi_dung: `Tạo mới ${label.toLowerCase()} "${newItem[nameField] || '#' + id}"`
      })

      return Promise.resolve({ success: true, data: cloneItem(newItem) })
    },

    update(id: string | number, payload: any) {
      const idx = data.findIndex((d) => String(d[pk]) === String(id))
      if (idx >= 0) {
        const oldItem = { ...data[idx] }
        const plain = formDataToObject(payload)

        if (plain?.inline_edit) {
          data[idx] = { ...data[idx], [plain.column]: plain.value }
        } else {
          data[idx] = { ...data[idx], ...plain, [pk]: data[idx][pk] }
        }

        const diffs = computeDiffs(oldItem, plain, pk, plain?.inline_edit)
        if (Object.keys(diffs).length > 0) {
          pushHistory({
            hanh_dong: 'Cập nhật',
            bang_du_lieu: name,
            ten_nguoi_thuc_hien: 'Người dùng (Mock)',
            thoi_gian: new Date().toISOString(),
            chi_tiet: diffs,
            id_ban_ghi: id,
            ten_ban_ghi: data[idx][nameField] || `#${id}`,
            noi_dung: `Cập nhật ${label.toLowerCase()} "${data[idx][nameField] || '#' + id}"`
          })
        }

        return Promise.resolve({ success: true })
      }
      return Promise.resolve({ success: false, message: 'Không tìm thấy bản ghi' })
    },

    delete(id: string | number) {
      const idx = data.findIndex((d) => String(d[pk]) === String(id))
      if (idx >= 0) {
        const deletedItem = { ...data[idx] }
        data.splice(idx, 1)

        const chi_tiet: Record<string, { cu: any; moi: any }> = {}
        for (const key of Object.keys(deletedItem)) {
          if (key === pk || key === '_pk') continue
          chi_tiet[key] = { cu: deletedItem[key] ?? '', moi: null }
        }

        pushHistory({
          hanh_dong: 'Xóa',
          bang_du_lieu: name,
          ten_nguoi_thuc_hien: 'Người dùng (Mock)',
          thoi_gian: new Date().toISOString(),
          chi_tiet,
          id_ban_ghi: id,
          ten_ban_ghi: deletedItem[nameField] || `#${id}`,
          noi_dung: `Xóa ${label.toLowerCase()} "${deletedItem[nameField] || '#' + id}"`
        })

        return Promise.resolve({ success: true })
      }
      return Promise.resolve({ success: false, message: 'Không tìm thấy bản ghi' })
    }
  }
}

/* ── singletons ─────────────────────────────────────────────────────── */

export const baomatAxios = createMockService('baomat', baoMatData, 'id_bao_mat')

export const caLamViecAxios = createMockService('calamviec', caLamViecData, 'id')

export const coquanAxios = createMockService('coquan', coQuanData, 'id_co_quan')

export const daotaoAxios = createMockService('daotao', daoTAoData, 'id_dao_tao')

const _donviSvc = createMockService('donvi', donviData, 'id_don_vi')
export const DonviAxios = {
  ..._donviSvc,
  fetchTheoPhongBan: () => {
    const groups: Record<string, any[]> = {}
    donviData.forEach((d) => {
      const key = d.loai || 'KHAC'
      if (!groups[key]) groups[key] = []
      groups[key].push({ value: String(d.id_don_vi), text: d.ten_don_vi })
    })
    return Promise.resolve({
      success: true,
      data: Object.entries(groups).map(([label, options]) => ({ label, options }))
    })
  },
  fetchTheoPhongBanV2: () => {
    const groups: Record<string, any[]> = {}
    donviData.forEach((d) => {
      const key = d.loai || 'KHAC'
      if (!groups[key]) groups[key] = []
      groups[key].push({ value: String(d.id_don_vi), text: d.ten_don_vi })
    })
    return Promise.resolve({
      success: true,
      data: Object.entries(groups).map(([label, options]) => ({ label, options }))
    })
  }
}

export const hinhthucAxios = createMockService('hinhthuc', hinhThucData, 'id_hinh_thuc')

export const LoaiNghiPhepAxios = createMockService('loainghiphep', loaiNghiPhepData, 'id_loai_phep')

const _loaiVanBanSvc = createMockService('loaivanban', loaiVanBanData, 'id_loai')
export const loaivanbanAxios = {
  ..._loaiVanBanSvc,
  fetchByUnitId: (params: any = {}) => {
    return _loaiVanBanSvc.fetch(params)
  }
}

export const tinhchatAxios = createMockService('tinhchat', tinhChatData, 'id_tinh_chat')

export const vitricongviecAxios = createMockService('vitricongviec', viTriCongViecData, 'id_vi_tri_cong_viec')

/* ── ngayleAxios (different interface) ──────────────────────────────── */

const _ngayLeSvc = createMockService('ngayle', ngayLeData, 'id_ngay_le')
export const ngayleAxios = {
  getAll: (params: any = {}) => _ngayLeSvc.fetch(params),
  create: (data: any) => _ngayLeSvc.create(data),
  update: (id: string | number, data: any) => _ngayLeSvc.update(id, data),
  delete: (id: string | number) => _ngayLeSvc.delete(id)
}

/* ── donviDemo services (PhongBan, TrungTam, Truong, Khoa) ─────────── */

export const PhongBanAxios = createMockService('phongban', phongBanData, 'id')

export const TrungTamAxios = createMockService('trungtam', trungTamData, 'id')

export const TruongAxios = createMockService('truong', truongData, 'id_truong')

const _khoaSvc = createMockService('khoa', khoaData, 'id_khoa')
export const KhoaAxios = {
  ..._khoaSvc,
  getByTruong: async (idTruong: string | number) => {
    const res = await _khoaSvc.fetch({ length: 10000 })
    const filtered = (res.data || []).filter((d: any) => String(d.id_truong) === String(idTruong))
    return { success: true, data: filtered.map((d: any) => ({ ...d })) }
  }
}

/* ── LOAI_DON_VI ───────────────────────────────────────────────────── */

export const LOAI_DON_VI = {
  LANH_DAO: {
    label: 'Lãnh đạo',
    value: 'LANH_DAO',
    color: 'red'
  },
  PHONG: {
    label: 'Phòng',
    value: 'PHONG',
    color: 'green'
  },
  KHOA_BOMON: {
    label: 'Khoa/Bộ môn',
    value: 'KHOA_BOMON',
    color: 'yellow'
  },
  BAN: {
    label: 'Ban',
    value: 'BAN',
    color: 'red'
  },
  VIEN: {
    label: 'Viện',
    value: 'VIEN',
    color: 'red'
  },
  TRUNG_TAM: {
    label: 'Trung tâm',
    value: 'TRUNG_TAM',
    color: 'red'
  },
  DON_VI_KHAC: {
    label: 'Đơn vị khác',
    value: 'DON_VI_KHAC',
    color: 'red'
  },
  PHONG_BAN: {
    label: 'Phòng ban',
    value: 'PHONG_BAN',
    color: 'green'
  },
  KHOA: {
    label: 'Khoa',
    value: 'KHOA',
    color: 'primary'
  }
} as const

/* ── LOAI_DON_VI_DANH_MUC ─────────────────────────────────────────── */

export const LOAI_DON_VI_DANH_MUC = {
  PHONG_BAN: {
    label: 'Phòng ban',
    value: 'PHONG_BAN',
    color: 'green',
    icon: 'Building'
  },
  TRUNG_TAM: {
    label: 'Trung tâm',
    value: 'TRUNG_TAM',
    color: 'secondary',
    icon: 'Building2'
  },
  TRUONG: {
    label: 'Trường',
    value: 'TRUONG',
    color: 'warning',
    icon: 'School'
  },
  KHOA: {
    label: 'Khoa',
    value: 'KHOA',
    color: 'primary',
    icon: 'GraduationCap'
  }
} as const

/* ── map option helpers ─────────────────────────────────────────────── */

export const mapDonviOptions = async () =>
  donviData.map((d) => ({ value: String(d.id_don_vi), label: d.ten_don_vi }))

export const mapOptionsCoquan = async () =>
  coQuanData.map((d) => ({ value: d.id_co_quan, label: d.ten_co_quan }))

export const mapOptionsHinhThuc = async () =>
  hinhThucData.map((d) => ({ value: d.id_hinh_thuc, label: d.ten_hinh_thuc }))

export const mapOptionsTinhChat = async () =>
  tinhChatData.map((d) => ({ value: d.id_tinh_chat, label: d.ten_tinh_chat }))

export const mapOptionsBaoMat = async () =>
  baoMatData.map((d) => ({ value: d.id_bao_mat, label: d.ten_bao_mat }))

export const mapCaLamViecOptions = async () =>
  caLamViecData.map((d) => ({ value: String(d.id), label: d.ca_lam_viec }))

export const mapOptionsDaoTao = async () =>
  daoTAoData.map((d) => ({ value: d.id_dao_tao, label: d.ten_khoa_hoc }))

export const mapLoaiNghiPhepOptions = async () =>
  loaiNghiPhepData.map((d) => ({ value: String(d.id_loai_phep), label: d.ten_loai_phep }))

export const mapOptionsLoaiVanban = async (idDonViNguoiDung?: number | string) => {
  const grouped: Record<string, any[]> = {}
  loaiVanBanData.forEach((item: any) => {
    const key = item.thuoc_nhom || 'KHAC'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push({ value: item.id_loai, label: item.ten_loai })
  })

  const mapping: Record<string, string> = {
    DONVI: 'Đơn vị',
    BGH: 'Ban Giám Hiệu',
    HDT: 'Hội Đồng Trường',
    CTHDT: 'Chủ Tịch Hội Đồng Trường'
  }

  return Object.keys(grouped).map((key) => ({
    label: mapping[key] || key,
    options: grouped[key]
  }))
}

export const mapDonviGroupedOptions = async () => {
  const res = await DonviAxios.fetchTheoPhongBan()
  if (!res?.success || !Array.isArray(res.data)) return []
  return res.data.map((group: any) => ({
    label: group.label,
    options:
      group.options?.map((opt: any) => ({
        value: String(opt.value),
        label: opt.text || opt.label || ''
      })) || []
  }))
}

export const mapDonviGroupedOptionsV2 = async () => {
  const res = await DonviAxios.fetchTheoPhongBanV2()
  if (!res?.success || !Array.isArray(res.data)) return []
  return res.data.map((group: any) => ({
    label: group.label,
    options:
      group.options?.map((opt: any) => ({
        value: String(opt.value),
        label: opt.text || opt.label || ''
      })) || []
  }))
}
