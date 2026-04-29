import React, { useRef } from 'react'
// Nếu muốn xuất PDF thay vì Print dialog, bật html2pdf:
// import html2pdf from "html2pdf.js";

/** ────────────────── TYPES ────────────────── **/
export interface BangCapItem {
  tu_thang?: string | null // YYYY-MM-DD
  den_thang?: string | null // YYYY-MM-DD | '' | '0000-00-00'
  noi_dao_tao?: string | null
  chuyen_nganh?: string | null
  trinh_do_dt?: string | null
  xep_loai_dt?: string | null
}

export interface QuaTrinhCongTacItem {
  ngay_bat_dau?: string | null // YYYY-MM-DD
  ngay_ket_thuc?: string | null // YYYY-MM-DD | '' | '0000-00-00'
  ten_cong_viec?: string | null
  ten_don_vi?: string | null
  trinh_do_dt?: string | null // (giữ nguyên theo template gốc)
}

export interface HopDongItem {
  so_hop_dong?: string | null
  loai_hop_dong?: string | null // ví dụ: 'Xac_dinh_thoi_han'
  loai_hop_dong_label?: string | null // nếu backend trả sẵn label, ưu tiên hiển thị cái này
  thoi_han_hop_dong?: string | null
  ngay_bat_dau?: string | null // YYYY-MM-DD
  ngay_ket_thuc?: string | null // YYYY-MM-DD
}

export interface ThoiViecItem {
  ten_thu_tuc?: string | null
  nhom_thu_tuc?: string | null
  trang_thai?: 'Hoan_thanh' | 'Chua_hoan_thanh' | string | null
}

export interface PrintEmployeeData {
  // Header
  ho_va_ten?: string | null
  ma_nhan_vien?: string | null

  // 1. Thông tin chung
  gioi_tinh?: number | string | null // 1|2|khác
  ngay_sinh?: string | null
  noi_sinh?: string | null
  que_quan?: string | null
  cccd_so?: string | null
  cccd_noi_cap?: string | null
  cccd_ngay_cap?: string | null
  cccd_ngay_het_han?: string | null

  ho_chieu_so?: string | null
  ho_chieu_ngay_cap?: string | null
  ho_chieu_ngay_het_han?: string | null
  ho_chieu_noi_cap?: string | null

  ten_dan_toc?: string | null
  ten_ton_giao?: string | null
  ten_quoc_tich?: string | null

  trinh_do_vh?: string | null
  trinh_do_dt?: string | null
  noi_dt?: string | null
  ten_don_vi?: string | null
  nganh_dt?: string | null
  nam_tn?: string | null
  xep_loai_tn?: string | null

  // 2. Thông tin liên hệ
  so_dien_thoai?: string | null
  email?: string | null
  hktt_dia_chi?: string | null
  cohn_dia_chi?: string | null

  // Liên hệ khẩn cấp
  lhkc_ho_ten?: string | null
  lhkc_quan_he?: string | null
  lhkc_sdt_di_dong?: string | null
  lhkc_sdt_nha_rieng?: string | null
  lhkc_email?: string | null
  lhkc_dia_chi?: string | null

  // 4–7 danh sách
  bang_cap?: BangCapItem[]
  qua_trinh_cong_tac?: QuaTrinhCongTacItem[]
  hop_dong?: HopDongItem[]
  thoi_viec?: ThoiViecItem[]
}

/** ──────────────── UTILS ───────────────── **/
const empty = (v: unknown) => (v === null || v === undefined || v === '' ? '' : String(v))

const toDMY = (d?: string | null) => {
  if (!d) return ''
  // bỏ qua giá trị giả
  if (d === '0000-00-00') return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  return dt.toLocaleDateString('vi-VN')
}

const toMY = (d?: string | null) => {
  if (!d || d === '0000-00-00') return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  return dt.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })
}

const rangeMY = (from?: string | null, to?: string | null) => {
  const a = toMY(from)
  const b = !to || to === '0000-00-00' ? 'Đến nay' : toMY(to)
  if (!a && !b) return ''
  if (a && b) return `${a} - ${b}`
  return a || b
}

const genderLabel = (g?: number | string | null) => {
  if (g === 1 || g === '1') return 'Nam'
  if (g === 2 || g === '2') return 'Nữ'
  return g ? String(g) : ''
}

const hopDongLabel = (hd: HopDongItem) => hd.loai_hop_dong_label ?? hd.loai_hop_dong ?? ''

/** ─────────────── REUSABLE COMPONENTS ────────────── **/

interface RowProps {
  label: string
  value: string
  colSpan?: number
}

const Row: React.FC<RowProps> = ({ label, value, colSpan = 1 }) => (
  <tr>
    <td>{label}</td>
    <td colSpan={colSpan}>{empty(value)}</td>
  </tr>
)

interface TableHeaderProps {
  headers: string[]
  widths?: string[]
}

const TableHeader: React.FC<TableHeaderProps> = ({ headers, widths }) => (
  <thead>
    <tr style={{ backgroundColor: '#d9d9d9', fontWeight: 'bold', textAlign: 'center' as const }}>
      {headers.map((h, i) => (
        <th key={i} style={widths ? { width: widths[i] } : {}}>
          {h}
        </th>
      ))}
    </tr>
  </thead>
)

interface TableRowsProps {
  data: any[]
  columns: (item: any, idx: number) => React.ReactNode[]
  colSpan: number
  emptyMessage?: string
}

const TableRows: React.FC<TableRowsProps> = ({
  data,
  columns,
  colSpan,
  emptyMessage = 'Không có dữ liệu.'
}) => (
  <tbody>
    {data.length > 0 ? (
      data.map((item, idx) => (
        <tr key={idx}>
          {columns(item, idx).map((col, i) => (
            <td key={i}>{col}</td>
          ))}
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={colSpan} style={{ textAlign: 'center' }}>
          {emptyMessage}
        </td>
      </tr>
    )}
  </tbody>
)
interface Props {
  data: PrintEmployeeData
  donviOptions?: Array<{ value: string | number; label: string }>
  vitriOptions?: Array<{ value: string | number; label: string }>
}

const EmployeePrintTSX: React.FC<Props> = ({ data, donviOptions = [], vitriOptions = [] }) => {
  const printRef = useRef<HTMLDivElement>(null)

  // Helper to map ID to label
  const getDonviLabel = (id?: string | number) => {
    if (!id) return '-'
    const found = donviOptions.find((opt) => String(opt.value) === String(id))
    return found ? found.label : String(id)
  }

  const getVitriLabel = (id?: string | number) => {
    if (!id) return '-'
    const found = vitriOptions.find((opt) => String(opt.value) === String(id))
    return found ? found.label : String(id)
  }

  const onPrint = () => window.print()

  const onExportPdf = async () => {
    /**
        // Bật nếu muốn xuất PDF tự động thay vì mở Print dialog
        const el = printRef.current;
        if (el) {
          await html2pdf()
            .set({
              margin: 10,
              filename: `${data.ho_va_ten || "nhan-vien"}.pdf`,
              image: { type: "jpeg", quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true },
              jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            })
            .from(el)
            .save();
          return;
        }
        */
    onPrint()
  }

  const bangCap = data.bang_cap ?? []
  const qtct = data.qua_trinh_cong_tac ?? []
  const hopDong = data.hop_dong ?? []
  const thoiViec = data.thoi_viec ?? []

  const HeaderCoQuan: React.FC = () => (
    <div style={{ width: '100%', textAlign: 'center', marginBottom: 16 }}>
      <table style={{ width: '100%', border: 0, borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ width: '20%', textAlign: 'center' }}>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                  BỘ GIÁO DỤC VÀ ĐÀO TẠO
                </div>

                <div style={{ fontWeight: 'bold', marginTop: 2 }}>TRƯỜNG ĐẠI HỌC NAM CẦN THƠ</div>

                <div
                  style={{
                    width: 150,
                    height: 1,
                    background: '#000',
                    margin: '4px auto 0 auto'
                  }}
                />
              </div>
            </td>
            <td style={{ width: '10%' }}></td>

            <td style={{ width: '30%', textAlign: 'center' }}>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>

                <div style={{ fontWeight: 'bold', marginTop: 2 }}>Độc lập - Tự do - Hạnh phúc</div>

                <div
                  style={{
                    width: 150,
                    height: 1,
                    background: '#000',
                    margin: '4px auto 0 auto'
                  }}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      <style>{`
        .print-wrap {
          max-width: 210mm;
          margin: 0 auto;
          background: #fff;
          padding: 12mm;
          box-shadow: 0 0 1mm rgba(0,0,0,.15);
          font-family: 'Times New Roman', sans-serif;
          font-size: 13px;
        }
        h1 { text-align: center; font-weight: normal;  }
        .lh-1 { line-height: 10px; }
        table { width: 100%; border-collapse: collapse; }
        td, th { line-height: 17px; padding: 6px; }
        table[border="1"] td, table[border="1"] th { border: 1px solid #000; }
        .actions { display:flex; justify-content:center; gap:8px; margin: 12px 0; }
        button { padding:8px 12px; border:1px solid #999; background:#fff; border-radius:6px; cursor:pointer; }
        h3 { margin: 14px 0 8px; font-weight: bold; }
        h4 { margin: 10px 0 6px; }
        .container { width: 100%; }
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .actions { display: none !important; }
        }
        @page { size: A4; margin: 10mm; }
      `}</style>

      <div className="actions">
        <button onClick={onPrint}>In A4</button>
        <button onClick={onExportPdf}>Xuất PDF</button>
      </div>

      <div ref={printRef} className="print-area">
        <div className="print-wrap">
          <HeaderCoQuan />
          <div className="container">
            <h1>
              <strong>THÔNG TIN NHÂN VIÊN</strong>
            </h1>

            <div className="lh-1" style={{ marginBottom: 8 }}>
              <div>
                <strong>Họ và Tên</strong>: {empty(data.ho_va_ten)}
              </div>
              <div>
                <strong>Mã nhân viên</strong>: {empty(data.ma_nhan_vien)}
              </div>
            </div>

            {/* 1. THÔNG TIN CHUNG */}
            <table border={0}>
              <tbody>
                <tr>
                  <td colSpan={4}>
                    <h3>1. THÔNG TIN CHUNG</h3>
                  </td>
                </tr>
                <tr>
                  <td>Họ và Tên:</td>
                  <td>{empty(data.ho_va_ten)}</td>
                  <td>Mã nhân viên:</td>
                  <td>{empty(data.ma_nhan_vien)}</td>
                </tr>
                <tr>
                  <td>Giới tính:</td>
                  <td>{genderLabel(data.gioi_tinh)}</td>
                  <td>Ngày sinh:</td>
                  <td>{toDMY(data.ngay_sinh)}</td>
                </tr>
                <tr>
                  <td>Nơi sinh:</td>
                  <td>{empty(data.noi_sinh)}</td>
                  <td>Nguyên quán:</td>
                  <td>{empty(data.que_quan)}</td>
                </tr>
                <tr>
                  <td>Số CMND/CCCD:</td>
                  <td colSpan={3}>{empty(data.cccd_so)}</td>
                </tr>
                <tr>
                  <td>Nơi cấp:</td>
                  <td colSpan={3}>{empty(data.cccd_noi_cap)}</td>
                </tr>
                <tr>
                  <td>Ngày cấp:</td>
                  <td>{toDMY(data.cccd_ngay_cap)}</td>
                  <td>Ngày hết hạn:</td>
                  <td>{toDMY(data.cccd_ngay_het_han)}</td>
                </tr>
                <tr>
                  <td>Số hộ chiếu:</td>
                  <td colSpan={3}>{empty(data.ho_chieu_so)}</td>
                </tr>
                <tr>
                  <td>Ngày cấp:</td>
                  <td>{toDMY(data.ho_chieu_ngay_cap)}</td>
                  <td>Ngày hết hạn:</td>
                  <td>{toDMY(data.ho_chieu_ngay_het_han)}</td>
                </tr>
                <tr>
                  <td>Nơi cấp:</td>
                  <td colSpan={3}>{empty(data.ho_chieu_noi_cap)}</td>
                </tr>
                <tr>
                  <td>TT Hôn nhân:</td>
                  <td colSpan={3}></td>
                </tr>
                <tr>
                  <td>TP gia đình:</td>
                  <td></td>
                  <td>TP bản thân:</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Dân tộc:</td>
                  <td>{empty(data.ten_dan_toc)}</td>
                  <td>Tôn giáo:</td>
                  <td>{empty(data.ten_ton_giao)}</td>
                </tr>
                <tr>
                  <td>Quốc tịch:</td>
                  <td colSpan={3}>{empty(data.ten_quoc_tich)}</td>
                </tr>
                <tr>
                  <td>Trình độ văn hóa:</td>
                  <td colSpan={3}>{empty(data.trinh_do_vh)}</td>
                </tr>
                <tr>
                  <td>Trình độ đào tạo:</td>
                  <td colSpan={3}>{empty(data.trinh_do_dt)}</td>
                </tr>
                <tr>
                  <td>Nơi đào tạo:</td>
                  <td colSpan={3}>{empty(data.noi_dt)}</td>
                </tr>
                <tr>
                  <td>Khoa:</td>
                  <td>{empty(data.ten_don_vi)}</td>
                  <td>Chuyên ngành:</td>
                  <td>{empty(data.nganh_dt)}</td>
                </tr>
                <tr>
                  <td>Năm tốt nghiệp:</td>
                  <td>{empty(data.nam_tn)}</td>
                  <td>Xếp loại:</td>
                  <td>{empty(data.xep_loai_tn)}</td>
                </tr>
                <tr>
                  <td>Nghề nghiệp:</td>
                  <td colSpan={3}></td>
                </tr>
              </tbody>
            </table>

            {/* 2. THÔNG TIN LIÊN HỆ */}
            <table border={0}>
              <tbody>
                <tr>
                  <td colSpan={4}>
                    <h3>2. THÔNG TIN LIÊN HỆ</h3>
                  </td>
                </tr>
                <tr>
                  <td>ĐT di động:</td>
                  <td>{empty(data.so_dien_thoai)}</td>
                  <td>ĐT cơ quan:</td>
                  <td></td>
                </tr>
                <tr>
                  <td>ĐT nhà riêng:</td>
                  <td></td>
                  <td>ĐT Khác:</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Email cơ quan:</td>
                  <td colSpan={3}>{empty(data.email)}</td>
                </tr>
                <tr>
                  <td>Email cá nhân:</td>
                  <td colSpan={3}></td>
                </tr>
                <tr>
                  <td>Email khác:</td>
                  <td></td>
                  <td>MSN ID:</td>
                  <td></td>
                </tr>
                <tr>
                  <td>SkypeID:</td>
                  <td></td>
                  <td>Facebook ID:</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Hộ khẩu thường trú:</td>
                  <td colSpan={3}>{empty(data.hktt_dia_chi)}</td>
                </tr>
                <tr>
                  <td>Chỗ ở hiện nay:</td>
                  <td colSpan={3}>{empty(data.cohn_dia_chi)}</td>
                </tr>
                <tr>
                  <td colSpan={4}>
                    <h4>Thông tin liên hệ trong trường hợp khẩn cấp</h4>
                  </td>
                </tr>
                <tr>
                  <td>Họ và tên:</td>
                  <td>{empty(data.lhkc_ho_ten)}</td>
                  <td>Quan hệ với nhân viên:</td>
                  <td>{empty(data.lhkc_quan_he)}</td>
                </tr>
                <tr>
                  <td>ĐT di động:</td>
                  <td>{empty(data.lhkc_sdt_di_dong)}</td>
                  <td>ĐT nhà riêng:</td>
                  <td>{empty(data.lhkc_sdt_nha_rieng)}</td>
                </tr>
                <tr>
                  <td>Email:</td>
                  <td colSpan={3}>{empty(data.lhkc_email)}</td>
                </tr>
                <tr>
                  <td>Địa chỉ:</td>
                  <td colSpan={3}>{empty(data.lhkc_dia_chi)}</td>
                </tr>
              </tbody>
            </table>

            {/* 3. THÔNG TIN KHÁC (checkbox & text trống theo mẫu) */}
            <table border={0}>
              <tbody>
                <tr>
                  <td colSpan={5}></td>
                </tr>
                <tr>
                  <td colSpan={5}>
                    <h3>3. THÔNG TIN KHÁC</h3>
                  </td>
                </tr>

                <tr>
                  <td colSpan={5}>
                    <strong>Thông tin chính trị:</strong>
                  </td>
                </tr>
                <tr>
                  <td colSpan={4}>
                    Là Đoàn viên:<span style={{ fontSize: 20 }}>☐</span>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>Ngày vào đoàn:</td>
                  <td></td>
                  <td>Chức vụ:</td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td>Nơi kết nạp:</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={5}>
                    Là Đảng viên:<span style={{ fontSize: 20 }}>☐</span>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>Ngày vào đảng:</td>
                  <td></td>
                  <td>Chức vụ:</td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td>Nơi kết nạp:</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>

                <tr>
                  <td colSpan={5}>
                    <strong>Thông tin chính trị:</strong>
                  </td>
                </tr>
                <tr>
                  <td colSpan={5}>
                    Là quân nhân:<span style={{ fontSize: 20 }}>☐</span>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>Ngày nhập ngũ:</td>
                  <td></td>
                  <td>Chức vụ:</td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td>Cấp bậc:</td>
                  <td></td>
                  <td>Binh chủng:</td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td>Đơn vị:</td>
                  <td></td>
                  <td>Ngày xuất ngũ:</td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td>Lý do:</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={5}></td>
                </tr>
                <tr>
                  <td>Mục tiêu:</td>
                  <td colSpan={4}></td>
                </tr>
                <tr>
                  <td>Sở thích:</td>
                  <td colSpan={4}></td>
                </tr>
                <tr>
                  <td>Điểm mạnh:</td>
                  <td colSpan={4}></td>
                </tr>
                <tr>
                  <td>Điểm yếu:</td>
                  <td colSpan={4}></td>
                </tr>
              </tbody>
            </table>

            {/* 4. BẰNG CẤP */}
            <br />
            <h3>4. BẰNG CẤP</h3>
            <table border={1}>
              <TableHeader
                headers={['Thời gian', 'Nơi đào tạo', 'Chuyên ngành', 'Trình độ', 'Xếp loại']}
                widths={['20%', '30%', '30%', '10%', '10%']}
              />
              <TableRows
                data={bangCap}
                colSpan={5}
                columns={(bc) => [
                  rangeMY(bc.tu_thang, bc.den_thang),
                  empty(bc.noi_dao_tao),
                  empty(bc.chuyen_nganh),
                  <span style={{ textAlign: 'center' }}>{empty(bc.trinh_do_dt)}</span>,
                  <span style={{ textAlign: 'center' }}>{empty(bc.xep_loai_dt)}</span>
                ]}
              />
            </table>

            {/* 5. QUÁ TRÌNH CÔNG TÁC */}
            <br />
            <h3>5. QUÁ TRÌNH CÔNG TÁC</h3>
            <table border={1}>
              <TableHeader
                headers={['Từ ngày', 'Vị trí công việc', 'Đơn vị công tác', 'Quản lý trực tiếp']}
                widths={['20%', '35%', '30%', '15%']}
              />
              <TableRows
                data={qtct}
                colSpan={4}
                columns={(r) => [
                  rangeMY(r.ngay_bat_dau, r.ngay_ket_thuc),
                  empty(r.ten_cong_viec),
                  empty(r.ten_don_vi),
                  empty(r.trinh_do_dt)
                ]}
              />
            </table>

            {/* 6. HỢP ĐỒNG LAO ĐỘNG */}
            <br />
            <h3>6. HỢP ĐỒNG LAO ĐỘNG</h3>
            <table border={1}>
              <TableHeader
                headers={[
                  'Số hợp đồng',
                  'Loại hợp đồng',
                  'Thời hạn',
                  'Ngày hiệu lực',
                  'Ngày hết hạn'
                ]}
                widths={['26%', '24%', '12%', '19%', '19%']}
              />
              <TableRows
                data={hopDong}
                colSpan={5}
                columns={(hd) => [
                  <span style={{ textAlign: 'center' }}>{empty(hd.so_hop_dong)}</span>,
                  <span style={{ textAlign: 'center' }}>{empty(hopDongLabel(hd))}</span>,
                  <span style={{ textAlign: 'center' }}>{empty(hd.thoi_han_hop_dong)}</span>,
                  <span style={{ textAlign: 'center' }}>{toDMY(hd.ngay_bat_dau)}</span>,
                  <span style={{ textAlign: 'center' }}>{toDMY(hd.ngay_ket_thuc)}</span>
                ]}
              />
            </table>

            {/* 7. THÔI VIỆC */}
            <br />
            <h3>7. THÔI VIỆC</h3>
            <table border={1}>
              <TableHeader headers={['Tên thủ tục', 'Nhóm thủ tục', 'Trạng thái']} />
              <TableRows
                data={thoiViec}
                colSpan={3}
                columns={(tv) => [
                  empty(tv.ten_thu_tuc),
                  empty(tv.nhom_thu_tuc),
                  <span style={{ textAlign: 'center' }}>
                    {tv.trang_thai === 'Hoan_thanh'
                      ? 'Hoàn thành'
                      : tv.trang_thai === 'Chua_hoan_thanh'
                        ? 'Chưa hoàn thành'
                        : empty(tv.trang_thai)}
                  </span>
                ]}
              />
            </table>

            <div style={{ textAlign: 'right', marginTop: 12 }}>
              <i>Ngày in: {new Date().toLocaleString('vi-VN')}</i>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default EmployeePrintTSX
