import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'

type PrintOptions = {
  thongTinChung?: boolean
  thongTinLienHe?: boolean
  bangCap?: boolean
  quaTrinhCongTac?: boolean
  hopDong?: boolean
  thuTucThoiViec?: boolean
}

/**
 * Tải template DOCX từ assets
 */
async function loadTemplate(): Promise<ArrayBuffer> {
  const templateUrl = new URL(
    '../../../assets/templates/down_templates/MauHosoNhansu.docx',
    import.meta.url
  )
  const response = await fetch(templateUrl)
  if (!response.ok) {
    throw new Error(`Không tìm thấy file template: ${response.statusText}`)
  }
  return response.arrayBuffer()
}

/**
 * Format dữ liệu employee cho template
 */
function formatEmployeeData(
  rawData: any,
  donviOptions: any[],
  vitriOptions: any[],
  options: PrintOptions = {}
): any {
  const opts: Required<PrintOptions> = {
    thongTinChung: true,
    thongTinLienHe: true,
    bangCap: true,
    quaTrinhCongTac: true,
    hopDong: true,
    thuTucThoiViec: true,
    ...options
  }
  // Helper: map ID to label
  const getDonviLabel = (id?: string | number) => {
    if (!id) return ''
    const found = donviOptions.find((opt) => String(opt.value) === String(id))
    return found ? found.label : String(id)
  }

  const getVitriLabel = (id?: string | number) => {
    if (!id) return ''
    const found = vitriOptions.find((opt) => String(opt.value) === String(id))
    return found ? found.label : String(id)
  }

  // Format date helper
  const formatDate = (d?: string | null) => {
    if (!d || d === '0000-00-00') return ''
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return ''
    return dt.toLocaleDateString('vi-VN')
  }

  const formatMonthYear = (d?: string | null) => {
    if (!d || d === '0000-00-00') return ''
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return ''
    return dt.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })
  }

  const genderLabel = (g?: number | string | null) => {
    if (g === 1 || g === '1') return 'Nam'
    if (g === 2 || g === '2') return 'Nữ'
    return g ? String(g) : ''
  }
  const thong_tin_chung = rawData.thong_tin_chung || {}
  const thong_tin_lien_he = opts.thongTinLienHe ? rawData.thong_tin_lien_he || {} : {}
  console.log('THONG TIN LIEN HE')
  console.log(thong_tin_lien_he)
  return {
    // Giữ nguyên flatten fields để tương thích template cũ
    // Thông tin cơ bản
    tt_emp_id: thong_tin_chung.ma_nhan_vien || '',
    tt_full_name: thong_tin_chung.ho_va_ten || '',
    tt_job_title: thong_tin_chung.ten_cong_viec || '',
    tt_department: thong_tin_chung.ten_don_vi || '',
    tt_gender: genderLabel(thong_tin_chung.gioi_tinh),
    tt_dob: formatDate(thong_tin_chung.ngay_sinh),
    tt_ethnicity: rawData.ten_dan_toc || '',
    tt_region: rawData.ten_ton_giao || '',
    tt_phone: rawData.so_dien_thoai || '',
    tt_nationality: rawData.ten_quoc_gia || '',

    // CCCD
    tt_cid: rawData.cccd_so || '',
    tt_cw: rawData.cccd_noi_cap || '',
    tt_con: formatDate(rawData.cccd_ngay_cap),
    tt_cat: formatDate(rawData.cccd_ngay_het_han),

    // Hộ chiếu
    tt_pid: rawData.ho_chieu_so || '',
    tt_pw: rawData.ho_chieu_noi_cap || '',
    tt_pon: formatDate(rawData.ho_chieu_ngay_cap),
    tt_pat: formatDate(rawData.ho_chieu_ngay_het_han),

    // Thông tin khác
    tt_ttvh: rawData.trinh_do_vh || '',
    tt_tddt: rawData.trinh_do_dt || '',
    tt_khoadtao: rawData.khoa_dt || rawData.ten_don_vi || '',
    tt_noidt: rawData.noi_dt || '',
    tt_chuyennganh: rawData.nganh_dt || '',
    tt_xeploai: rawData.xep_loai_tn || '',
    tt_namtotnghiep: rawData.nam_tn || '',
    tt_nghe: rawData.ten_cong_viec || rawData.chuc_danh || '',
    tt_ngayvaolam: formatDate(rawData.ngay_lam_chinh_thuc || rawData.ngay_tap_su || ''),
    tt_ngayketthuc: formatDate(
      rawData.ngay_lam_chinh_thuc_ket_thuc || rawData.ngay_tap_su_ket_thuc || ''
    ),

    // Flags để ẩn/hiện tiêu đề section trong template
    has_bang_cap: opts.bangCap && (rawData.bang_cap || []).length > 0,
    has_qua_trinh_cong_tac: opts.quaTrinhCongTac && (rawData.qua_trinh_cong_tac || []).length > 0,
    has_hop_dong: opts.hopDong && (rawData.hop_dong || []).length > 0,
    has_thoi_viec: opts.thuTucThoiViec && (rawData.thu_tuc_thoi_viec || []).length > 0,

    // Arrays / sections (tắt nếu unchecked để block {#...}{/...} rỗng)
    // Thông tin liên hệ: mảng 1 phần tử khi checked, rỗng khi unchecked
    thong_tin_lien_he: opts.thongTinLienHe
      ? [
          {
            lh_sdt: thong_tin_lien_he.so_dien_thoai || '',
            lh_email_personal: thong_tin_lien_he.email || '',
            lh_email_office: rawData.email || '',
            lh_home_town: thong_tin_lien_he.que_quan || '',
            lh_current_address:
              thong_tin_lien_he.cohn_dia_chi ||
              [
                thong_tin_lien_he.cohn_so_nha,
                thong_tin_lien_he.cohn_xa_phuong,
                thong_tin_lien_he.cohn_tinh_tp,
                thong_tin_lien_he.cohn_quoc_gia
              ]
                .filter(Boolean)
                .join(', '),
            lh_permanent_address:
              rawData.hktt_dia_chi ||
              [
                rawData.hktt_so_nha,
                rawData.hktt_id_xa_phuong,
                rawData.hktt_id_quan_huyen,
                rawData.hktt_id_tinh_tp
              ]
                .filter(Boolean)
                .join(', '),
            emergency_phone: rawData.lhkc_sdt_di_dong || '',
            emergency_email_personal: rawData.lhkc_email || '',
            emergency_email_office: '',
            emergency_home_town: rawData.que_quan || '',
            emergency_current_address: rawData.lhkc_dia_chi || '',
            emergency_permanent_address: rawData.lhkc_dia_chi || ''
          }
        ]
      : [],
    bc: opts.bangCap
      ? (rawData.bang_cap || []).map((item: any) => ({
          bc_tg:
            formatMonthYear(item.tu_thang) + ' - ' + formatMonthYear(item.den_thang) || 'Đến nay',
          bc_noidt: item.noi_dao_tao,
          bc_cn: item.chuyen_nganh || '',
          bc_td: item.trinh_do_dt || '',
          bc_xl: item.xep_loai_dt || ''
        }))
      : [],

    qtct: opts.quaTrinhCongTac
      ? (rawData.qua_trinh_cong_tac || []).map((item: any) => ({
          qtct_tg:
            formatMonthYear(item.ngay_bat_dau) + ' - ' + formatMonthYear(item.ngay_ket_thuc) ||
            'Đến nay',
          qtct_vt: item.ten_cong_viec || '',
          qtct_dv: item.ten_don_vi || '',
          qtct_qltt: item.ten_don_vi || ''
        }))
      : [],

    hd: opts.hopDong
      ? (rawData.hop_dong || []).map((item: any) => ({
          hd_so: item.so_hop_dong || '',
          hd_loai: item.loai_hop_dong_label || item.loai_hop_dong || '',
          hd_hl: item.thoi_han_hop_dong || '',
          hd_tg: formatDate(item.ngay_bat_dau) + ' - ' + formatDate(item.ngay_ket_thuc)
        }))
      : [],

    tv: opts.thuTucThoiViec
      ? (rawData.thu_tuc_thoi_viec || []).map((item: any) => ({
          tv_tt: item.ten_thu_tuc || '',
          tv_ngayht: item.updated_at || '',
          tv_st: 'Hoàn thành'
        }))
      : []
  }
}

/**
 * Tạo file DOCX từ dữ liệu
 */
export async function generateDocx(
  employeeData: any,
  donviOptions: any[],
  vitriOptions: any[],
  options?: PrintOptions
): Promise<ArrayBuffer> {
  const content = await loadTemplate()
  const zip = new PizZip(content)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true
  })

  const formattedData = formatEmployeeData(employeeData, donviOptions, vitriOptions, options)
  doc.setData(formattedData)

  try {
    doc.render()
  } catch (error) {
    console.error('❌ Lỗi render DOCX:', error)
    throw error
  }

  return doc.getZip().generate({ type: 'arraybuffer' })
}

/**
 * Tạo nhiều file và tải về dưới dạng ZIP
 *
 * LƯU Ý: Hiện tại tạo file DOCX. Để chuyển sang PDF cần:
 * 1. Tạo DOCX như bình thường (dòng 180-189)
 * 2. Gửi DOCX buffer lên backend API để convert sang PDF
 *    Ví dụ: POST /api/convert-docx-to-pdf với FormData chứa file DOCX
 *    Backend dùng LibreOffice/unoconv/soffice để convert
 * 3. Nhận PDF buffer từ backend response
 * 4. Thêm PDF buffer vào ZIP thay vì DOCX (dòng 190)
 *
 * Flow hiện tại: DOCX → ZIP
 * Flow mong muốn: DOCX → Backend Convert → PDF → ZIP
 */
export async function generateMultipleDocx(
  employeeList: any[],
  donviOptions: any[],
  vitriOptions: any[],
  options?: PrintOptions
): Promise<void> {
  // Lazy load JSZip only when needed
  const JSZip = (await import('jszip')).default

  const zip = new JSZip()

  console.log(`📦 Đang tạo ${employeeList.length} file DOCX...`)

  for (let i = 0; i < employeeList.length; i++) {
    const emp = employeeList[i]

    // Bước 1: Tạo DOCX từ template
    const docxBuffer = await generateDocx(emp, donviOptions, vitriOptions, options)

    // TODO: Bước 2 - Gửi DOCX lên backend để convert sang PDF
    // const formData = new FormData()
    // const docxBlob = new Blob([docxBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    // formData.append('file', docxBlob, 'temp.docx')
    // const response = await fetch('/api/convert-docx-to-pdf', { method: 'POST', body: formData })
    // const pdfBuffer = await response.arrayBuffer()

    // Bước 3: Thêm file vào ZIP (hiện tại DOCX, sau này sẽ là PDF)
    const fileName =
      `${emp.thong_tin_chung?.ma_nhan_vien || i + 1}_${emp.thong_tin_chung?.ho_va_ten || 'nhanvien'}_${new Date().getTime()}.docx`.replace(
        /[/\\?%*:|"<>]/g,
        '-'
      ) // sanitize filename

    // Nếu có PDF buffer từ backend, đổi extension thành .pdf và dùng pdfBuffer
    // const fileName = `${emp.thong_tin_chung?.ma_nhan_vien || i + 1}_${emp.thong_tin_chung?.ho_va_ten || 'nhanvien'}.pdf`
    // zip.file(fileName, pdfBuffer)

    zip.file(fileName, docxBuffer) // Tạm thời dùng DOCX
    console.log(`✅ Đã tạo: ${fileName}`)
  }

  console.log('🗜️ Đang nén file ZIP...')
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, `hosonhansu_${new Date().getTime()}.zip`)
  console.log('🎉 Hoàn tất!')
}

/**
 * Tải về một file DOCX đơn lẻ
 */
export async function downloadSingleDocx(
  employeeData: any,
  donviOptions: any[],
  vitriOptions: any[],
  options?: PrintOptions
): Promise<void> {
  const docxBuffer = await generateDocx(employeeData, donviOptions, vitriOptions, options)
  const fileName =
    `${employeeData.ma_nhan_vien || 'nhanvien'}_${employeeData.ho_va_ten || 'hosonhansu'}.docx`.replace(
      /[/\\?%*:|"<>]/g,
      '-'
    )

  const blob = new Blob([docxBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  })
  saveAs(blob, fileName)
  console.log(`✅ Đã tải: ${fileName}`)
}
