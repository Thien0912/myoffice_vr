import {
  HardDriveDownload,
  Inbox,
  Send,
  Trash2,
  Loader,
  MessageCircleOff,
  MessageCircle,
  TimerOff,
  ClockFading,
  Clock,
  Archive,
  RotateCcw,
  CheckCheck,
  FolderLock,
  Folder,
  Eye,
  EyeOff,
  MessagesSquare,
  Pencil,
  CalendarCheck2,
  Star,
  AlertCircle
} from 'lucide-react'

export const ButtonListBoxVanBanDi = [
  {
    title: 'Tất cả',
    icon: <Inbox className="size-4 shrink-0" />,
    classify: 'all',
    action: () => {
      console.log('Tất cả')
    }
  },
  {
    title: 'Đang lưu trữ',
    icon: <HardDriveDownload className="size-4 shrink-0" />,
    classify: 'luu_tru',
    action: () => {
      console.log('Đang lưu trữ')
    }
  },
  {
    title: 'Đang xử lý',
    icon: <Loader className="size-4 shrink-0" />,
    classify: 'cho_xu_ly',
    action: () => {
      console.log('Đang xử lý')
    }
  },
  {
    title: 'Hoàn thành',
    icon: <CheckCheck className="size-4 shrink-0" />,
    classify: 'hoan_thanh',
    action: () => {
      console.log('Hoàn thành')
    }
  },
  {
    title: 'Văn bản thu hồi',
    icon: <RotateCcw className="size-4 shrink-0" />,
    classify: 'thu_hoi',
    action: () => {
      console.log('Thu hồi văn bản')
    }
  }
]

export const ButtonListBoxVanBanDen = [
  {
    title: 'Tất cả',
    icon: <Inbox className="size-4 shrink-0" />,
    classify: 'all',
    selectedDefault: true,
    action: () => {
      console.log('Tất cả')
    }
  },
  {
    title: 'Lưu trữ',
    icon: <Archive className="size-4 shrink-0" />,
    classify: 'luu_tru',
    action: () => {
      // console.log('Lưu trữ')
    }
  },
  {
    title: 'Tiếp nhận',
    icon: <MessagesSquare className="size-4 shrink-0" />,
    classify: 'tiep_nhan',
    selectedDefault: false,
    action: () => {
      // console.log('Tiếp nhận')
    }
  },
  {
    title: 'Chờ bút phê',
    icon: <Eye className="size-4 shrink-0" />,
    classify: 'cho_but_phe',
    selectedDefault: false,
    action: () => {
      // console.log('Chờ lãnh đạo bút phê')
    }
  },
  {
    title: 'Đã bút phê',
    icon: <Pencil className="size-4 shrink-0" />,
    classify: 'da_but_phe',
    selectedDefault: false,
    action: () => {
      // console.log('Đã bút phê')
    }
  },
  {
    title: 'Đã chuyển xử lý',
    icon: <Send className="size-4 shrink-0" />,
    classify: 'da_chuyen_don_vi_xu_ly',
    selectedDefault: false,
    action: () => {
      // console.log('Đã chuyển đơn vị xử lý')
    }
  },
  {
    title: 'Hoàn thành',
    icon: <CheckCheck className="size-4 shrink-0" />,
    classify: 'hoan_thanh',
    selectedDefault: false,
    action: () => {
      // console.log('Hoàn thành')
    }
  },
  {
    title: 'Văn bản thu hồi',
    icon: <RotateCcw className="size-4 shrink-0" />,
    classify: 'thu_hoi'
  },
  { type: 'separator' },
  {
    title: 'Quá hạn',
    icon: <Clock className="size-4 shrink-0 text-red-500" />,
    classify: 'qua_han',
    alwaysShowBadge: true
  },
  {
    title: 'Hôm nay',
    icon: <Clock className="size-4 shrink-0 text-amber-500" />,
    classify: 'hom_nay',
    alwaysShowBadge: true
  },
  {
    title: 'Sắp tới hạn',
    icon: <Clock className="size-4 shrink-0 text-blue-500" />,
    classify: 'duoi_5_ngay',
    alwaysShowBadge: true
  },
  {
    title: 'Trên 5 ngày',
    icon: <Clock className="size-4 shrink-0 text-green-500" />,
    classify: 'tren_5_ngay',
    alwaysShowBadge: true
  }
]

export const ButtonListBoxVanBanDenDonVi = [
  {
    title: 'Tất cả',
    icon: <Inbox className="size-4 shrink-0" />,
    classify: 'all',
    selectedDefault: true,
    action: () => {
      console.log('Tất cả')
    }
  },
  {
    title: 'Nhận hôm nay',
    icon: <CalendarCheck2 className="size-4 shrink-0" />,
    classify: 'nhan_hom_nay',
    selectedDefault: false,
    action: () => {
      // console.log('Tất cả')
    }
  },
  {
    title: 'Chưa xem',
    icon: <EyeOff className="size-4 shrink-0 text-slate-500" />,
    classify: 'chua_xem',
    selectedDefault: false,
    action: () => {
      // console.log('Chưa xem')
    }
  },
  {
    title: 'Đã xem',
    icon: <Eye className="size-4 shrink-0 text-blue-500" />,
    classify: 'da_xem',
    selectedDefault: false,
    action: () => {
      // console.log('Đã xem')
    }
  },
  {
    title: 'Chưa phản hồi',
    icon: <MessageCircleOff className="size-4 shrink-0" />,
    classify: 'chua_phan_hoi',
    selectedDefault: false,
    action: () => {
      // console.log('Chưa phản hồi')
    }
  },
  {
    title: 'Đã phản hồi',
    icon: <MessageCircle className="size-4 shrink-0" />,
    classify: 'da_phan_hoi',
    selectedDefault: false,
    action: () => {
      // console.log('Đã phản hồi')
    }
  },
  { type: 'separator' },
  {
    title: 'Quá hạn',
    icon: <Clock className="size-4 shrink-0 text-red-500" />,
    classify: 'qua_han',
    alwaysShowBadge: true
  },
  {
    title: 'Hôm nay',
    icon: <Clock className="size-4 shrink-0 text-amber-500" />,
    classify: 'hom_nay',
    alwaysShowBadge: true
  },
  {
    title: 'Sắp tới hạn',
    icon: <Clock className="size-4 shrink-0 text-blue-500" />,
    classify: 'duoi_5_ngay',
    alwaysShowBadge: true
  },
  {
    title: 'Trên 5 ngày',
    icon: <Clock className="size-4 shrink-0 text-green-500" />,
    classify: 'tren_5_ngay',
    alwaysShowBadge: true
  }
]

export const ButtonListBoxVanBanNoiBo = [
  {
    title: 'Tất cả',
    icon: <Inbox className="size-4 shrink-0" />,
    classify: 'all',
    action: () => {
      console.log('Tất cả')
    }
  },
  {
    title: 'Hôm nay',
    icon: <Clock className="size-4 shrink-0 text-amber-500" />,
    classify: 'hom_nay',
    alwaysShowBadge: true
  },
  {
    title: 'Tuần này',
    icon: <Clock className="size-4 shrink-0 text-blue-500" />,
    classify: '7_ngay',
    alwaysShowBadge: true
  },
  {
    title: 'Trong tháng',
    icon: <Clock className="size-4 shrink-0 text-green-500" />,
    classify: 'trong_thang',
    alwaysShowBadge: true
  },
  {
    title: 'Trước đó',
    icon: <Clock className="size-4 shrink-0 text-green-500" />,
    classify: 'truoc_do',
    alwaysShowBadge: true
  }
]

export const ButtonListBoxVanBanDiDonVi = [
  {
    title: 'Tất cả',
    icon: <Inbox className="size-4 shrink-0" />,
    classify: 'all',
    action: () => {
      console.log('Tất cả')
    }
  },
  {
    title: 'Lưu trữ',
    icon: <HardDriveDownload className="size-4 shrink-0" />,
    classify: 'luu_tru',
    action: () => {
      console.log('Lưu trữ')
    }
  },
  {
    title: 'Chờ xử lý',
    icon: <Loader className="size-4 shrink-0" />,
    classify: 'cho_xu_ly',
    action: () => {
      console.log('Chờ xử lý')
    }
  },
  {
    title: 'Hoàn thành',
    icon: <CheckCheck className="size-4 shrink-0" />,
    classify: 'hoan_thanh',
    action: () => {
      console.log('Hoàn thành')
    }
  }
]

export const ButtonListBoxHopDong = [
  {
    title: 'Tất cả',
    icon: <Inbox className="size-4 shrink-0" />,
    classify: 'all',
    action: () => {
      console.log('Tất cả')
    }
  },
  {
    title: 'Đang hiệu lực',
    icon: <ClockFading className="size-4 shrink-0" />,
    classify: 'dang_hieu_luc',
    action: () => {
      console.log('Lưu trữ')
    }
  },
  {
    title: 'Hết hiệu lực',
    icon: <TimerOff className="size-4 shrink-0" />,
    classify: 'het_hieu_luc',
    action: () => {
      console.log('Chờ xử lý')
    }
  },
  {
    title: 'Đã xóa',
    icon: <Trash2 className="size-4 shrink-0" />,
    classify: 'da_xoa',
    action: () => {
      console.log('Đã xóa')
    }
  }
]

export const ButtonListBoxTrashVanBan = [
  {
    title: 'Tất cả',
    icon: <Inbox className="size-4 shrink-0" />,
    classify: 'all',
    selectedDefault: true
  },
  {
    title: 'Văn bản đến',
    icon: <Folder className="size-4 shrink-0" />,
    classify: 'van_ban_den'
  },
  {
    title: 'Văn bản đi',
    icon: <Folder className="size-4 shrink-0" />,
    classify: 'van_ban_di'
  },
  {
    title: 'Văn bản nội bộ',
    icon: <FolderLock className="size-4 shrink-0" />,
    classify: 'van_ban_noi_bo'
  },
  { type: 'separator' },
  {
    title: 'Hôm nay',
    icon: <Clock className="size-4 shrink-0 text-amber-500" />,
    classify: 'hom_nay'
  },
  {
    title: '7 ngày qua',
    icon: <Clock className="size-4 shrink-0 text-blue-500" />,
    classify: '7_ngay_qua'
  },
  {
    title: 'Trước đó',
    icon: <Clock className="size-4 shrink-0 text-gray-500" />,
    classify: 'truoc_do'
  }
]

export const ButtonListBoxPropose = [
  {
    title: 'Đã nhận',
    icon: <Inbox className="size-4 shrink-0" />,
    classify: 'all',
    selectedDefault: true
  },
  {
    title: 'Đã gửi',
    icon: <Send className="size-4 shrink-0" />,
    classify: 'da_gui'
  },
  {
    title: 'Gắn sao',
    icon: <Star className="size-4 shrink-0" />,
    classify: 'starred'
  },
  {
    title: 'Quan trọng',
    icon: <AlertCircle className="size-4 shrink-0" />,
    classify: 'important'
  },
  {
    title: 'Thư nháp',
    icon: <MessagesSquare className="size-4 shrink-0" />,
    classify: 'nhap'
  },
  {
    title: 'Thư rác',
    icon: <Pencil className="size-4 shrink-0" />,
    classify: 'spam'
  },
  {
    title: 'Thùng rác',
    icon: <Trash2 className="size-4 shrink-0" />,
    classify: 'trash'
  }
]
