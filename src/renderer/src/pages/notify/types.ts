export interface Notification {
  ql_thong_bao_id: string
  ql_thong_bao_tieu_de: string
  ql_thong_bao_noi_dung: string
  ql_thong_bao_ngay_gui: string
  ql_thong_bao_loai: string
  ql_thong_bao_da_doc: string // '0' for unread, '1' for read
  ql_thong_bao_sao: string // '0' for no star, '1' for starred
  ql_thong_bao_link?: string
}
