import {
    AlignStartVertical,
    Bell,
    CalendarRange,
    Clock,
    Cog,
    FileSignature,
    FileText,
    LayoutDashboard,
    UserSquare2,
    UserSearch
} from 'lucide-react'
import { lazy, useEffect } from 'react'

import VerifyOtpPage from '@renderer/pages/auth/VerifyOtpPage'

const HrmAuthWrapper = lazy(() => import('@renderer/components/HrmAuthWrapper'))

export const ROUTES = [
    {
        path: '/',
        Component: lazy(() => import('@renderer/layouts/MainLayout')),
        children: [
            {
                index: true,
                title: 'Trang chủ',
                abbre: 'Trang chủ',
                module: 'dashboard',
                description: 'Tổng quan văn bản và hoạt động hệ thống',
                path: '',
                permission: false,
                icon: LayoutDashboard,
                Component: lazy(() => import('@renderer/pages/dashboard/DashboardPage'))
            },
            {
                title: 'Thông báo',
                hideTitle: true,
                abbre: 'Thông báo',
                module: 'thong-bao',
                description: 'Thông báo và nhắc nhở công việc',
                path: 'thong-bao',
                permission: false,
                icon: Bell,
                Component: lazy(() => import('@renderer/pages/notify/ThongBaoPage'))
            },
            // {
            //   title: 'Cập nhật thông tin',
            //   abbre: 'Cập nhật',
            //   module: 'yeu-cau-cap-nhat',
            //   description: 'Gửi yêu cầu cập nhật thông tin cá nhân lên hệ thống',
            //   path: 'yeu-cau-cap-nhat',
            //   hide: true,
            //   permission: ['yeucaucapnhat'],
            //   icon: <Cog size={24}  />,
            //   Component: lazy(() => import('@renderer/pages/profile/UpdateProfilePage'))
            // },
            {
                title: 'Công văn',
                abbre: 'Công văn',
                module: 'vanban',
                description: 'Quản lý các loại văn bản trong hệ thống',
                path: undefined,
                icon: FileText,
                Component: null,
                permission: ['vanbanden', 'vanbandi', 'vanbannoibo', 'vanbandidonvi', 'vanbandendonvi'],
                children: [
                    {
                        title: 'Công văn đến',
                        description: 'Tiếp nhận và quản lý văn bản đến từ các cơ quan bên ngoài',
                        path: 'vanbanden',
                        hide: false,
                        permission: ['vanbanden'],
                        Component: lazy(() => import('@renderer/pages/document/VanbandenPage')),
                        children: []
                    },
                    {
                        title: 'Công văn đi',
                        description: 'Soạn thảo văn bản và ban hành văn bản đến các đơn vị trong trường',
                        path: 'vanbandi',
                        hide: false,
                        permission: ['vanbandi'],
                        Component: lazy(() => import('@renderer/pages/document/VanbandiPage')),
                        children: []
                    },
                    {
                        title: 'Công văn đi đơn vị',
                        description: 'Soạn thảo văn bản gửi đi giữa các đơn vị trong trường',
                        path: 'vanbandidonvi',
                        hide: false,
                        permission: ['vanbandidonvi'],
                        Component: lazy(() =>
                            Promise.resolve({
                                default: () => {
                                    useEffect(() => {
                                        window.location.href = '/v2/de-xuat'
                                    }, [])
                                    return null
                                }
                            })
                        ),
                        children: []
                    },
                    {
                        title: 'Công văn đến đơn vị',
                        description:
                            'Tiếp nhận văn bản từ Phòng Tổ chức - Hành chính và các đơn vị khác trong trường',
                        path: 'vanbandendonvi',
                        hide: false,
                        permission: ['vanbandendonvi'],
                        Component: lazy(() => import('@renderer/pages/document/VanbandendonviPage')),
                        children: [
                            {
                                path: ':id_van_ban',
                                Component: lazy(() => import('@renderer/pages/document/VanbandendonviPage'))
                            }
                        ]
                    },
                    {
                        title: 'Công văn nội bộ',
                        description: 'Quản lý các văn bản lưu nội bộ của từng phòng/ban',
                        path: 'vanbannoibo',
                        hide: false,
                        permission: ['vanbannoibo'],
                        Component: lazy(() => import('@renderer/pages/document/VanbannoiboPage')),
                        children: []
                    },
                    {
                        title: 'Thùng rác',
                        description: 'Thùng rác lưu trữ tạm thời các văn bản đã xóa',
                        path: 'vanbandaxoa',
                        hide: false,
                        permission: ['vanbandaxoa'],
                        Component: lazy(() => import('@renderer/pages/document/Vanbandaxoa')),
                        children: []
                    }
                ]
            },
            {
                title: 'Đề xuất',
                abbre: 'Đề xuất',
                module: 'de-xuat',
                description: 'Nộp nội dung đề xuất, đề nghị đến cấp trên',
                path: 'de-xuat',
                icon: FileSignature,
                permission: false,
                Component: lazy(() => import('@renderer/pages/propose/ProposePage')),
                children: []
            },
            // {
            //     title: 'Tuyển dụng',
            //     abbre: 'Tuyển dụng',
            //     module: 'de-xuat',
            //     description: 'Danh sách ứng viên tuyển dụng',
            //     path: 'tuyen-dung',
            //     icon: UserSearch,
            //     hide: false,
            //     hideTitle: true,
            //     permission: false,
            //     Component: lazy(() => import('@renderer/pages/propose/RecruitmentPage')),
            //     children: []
            // },
            {
                title: 'Hồ sơ',
                abbre: 'Hồ sơ',
                module: 'hrm',
                description: 'Quản lý hồ sơ nhân sự và các chế độ chính sách',
                path: undefined,
                icon: UserSquare2,
                permission: ['nhanvien', 'thoiviec', 'hopdong', 'inthe', 'nhanvientucapnhat'],
                Component: HrmAuthWrapper,
                children: [
                    {
                        title: 'Hồ sơ nhân sự',
                        description: 'Quản lý thông tin chi tiết cán bộ, giảng viên và nhân viên',
                        path: 'hrm/nhan-vien',
                        hide: false,
                        permission: ['nhanvien'],
                        Component: lazy(() => import('@renderer/pages/profile/HosonhansuPage')),
                        children: []
                    },
                    {
                        title: 'Chỉnh sửa nhân sự',
                        description: 'Điều chỉnh thông tin chi tiết của nhân viên',
                        path: 'hrm/nhan-vien/edit/:id',
                        hide: true,
                        Component: lazy(() => import('@renderer/pages/profile/EditNhansuPage')),
                        children: []
                    },
                    {
                        title: 'Thêm nhân sự',
                        description: 'Thêm mới nhân sự vào hệ thống',
                        path: 'hrm/nhan-vien/add',
                        hide: true,
                        permission: ['nhanvien'],
                        Component: lazy(() => import('@renderer/pages/profile/AddNhansuPage')),
                        children: []
                    },
                    {
                        title: 'Hợp đồng nhân sự',
                        description: 'Theo dõi tình trạng hợp đồng lao động và phụ lục hợp đồng',
                        path: 'hrm/hop-dong',
                        hide: true,
                        permission: ['hopdong'],
                        Component: lazy(() => import('@renderer/pages/hr/contract/HopdongPage')),
                        children: [
                            {
                                path: ':id_hop_dong',
                                Component: lazy(() => import('@renderer/pages/hr/contract/HopdongPage'))
                            }
                        ]
                    },
                    {
                        title: 'Yêu cầu cập nhật',
                        description: 'Quản lý yêu cầu cập nhật thông tin của nhân viên',
                        path: 'hrm/nhan-vien-tu-cap-nhat',
                        hide: false,
                        permission: ['nhanvientucapnhat'],
                        Component: lazy(
                            () => import('@renderer/pages/hr/nhanvientucapnhat/NhanVienTuCapNhatPage')
                        ),
                        children: []
                    },
                    {
                        title: 'Thôi việc',
                        description: 'Quản lý hồ sơ nhân viên đã nghỉ việc',
                        path: 'hrm/thoi-viec',
                        hide: false,
                        permission: ['thoiviec'],
                        Component: lazy(() => import('@renderer/pages/hr/thoiviec/ThoiviecPage')),
                        children: []
                    },
                    {
                        title: 'In thẻ nhân viên',
                        description: 'Hỗ trợ in ấn thẻ nhân viên',
                        path: 'hrm/in-the',
                        hide: false,
                        permission: ['inthe'],
                        Component: lazy(() => import('@renderer/pages/hr/inthe/InthePage')),
                        children: []
                    }
                ]
            },
            {
                title: 'Chấm công',
                abbre: 'Chấm công',
                module: 'chamcong',
                description: 'Quản lý ngày công và dữ liệu máy chấm công,',
                path: 'hrm/cham-cong',
                hide: false,
                permission: false,
                icon: Clock,
                // Component: lazy(() => Promise.resolve({ default: () => <div>Chấm công</div> })),
                Component: lazy(() =>
                    Promise.resolve({
                        default: () => {
                            useEffect(() => {
                                window.location.href = '/hrm/cham-cong'
                            }, [])
                            return null
                        }
                    })
                ),
                children: []
            },
            {
                title: 'Nghỉ phép',
                abbre: 'Nghỉ phép',
                module: 'nghiphep',
                description: 'Quản lý ngày nghỉ phép',
                path: 'hrm/nghi-phep',
                permission: false,
                icon: CalendarRange,
                Component: lazy(() => import('@renderer/pages/hr/leave/NghiPhepPage'))
                // children: [
                //   {
                //     title: 'Danh sách',
                //     description: 'Quản lý ngày nghỉ phép của cán bộ công nhân viên.',
                //     path: 'hrm/nghi-phep',
                //     hide: false,
                //     permission: false,
                //     Component: lazy(() => import('@renderer/pages/hr/leave/NghiPhepPage')),
                //     children: []
                //   },
                //   {
                //     title: 'Đăng ký',
                //     description: 'Khung đăng ký nghỉ phép',
                //     path: 'hrm/nghi-phep/dang-ky',
                //     hide: true,
                //     permission: false,
                //     Component: lazy(() => import('@renderer/pages/hr/leave/DangKyNghiPhepPage')),
                //     layout: 'fullscreen',
                //     children: []
                //   }
                // ]
            },
            {
                title: 'Ngoài giờ',
                abbre: 'Ngoài giờ',
                module: 'ngoaigio',
                description: 'Quản lý làm việc ngoài giờ',
                path: undefined,
                permission: false,
                icon: Clock,
                children: [
                    {
                        title: 'Đăng ký ngoài giờ',
                        description: 'Đăng ký và quản lý làm việc ngoài giờ',
                        path: 'hrm/ngoai-gio',
                        hideTitle: true,
                        permission: false,
                        Component: lazy(() => import('@renderer/pages/hr/overtime/NgoaiGioPage')),
                        children: []
                    },
                    {
                        title: 'Đăng ký tuần ngoài giờ',
                        description: 'Quản lý bảng chấm công ngoài giờ theo tuần',
                        path: 'hrm/dang-ky-tuan-ngoai-gio',
                        permission: ['bangchamcong'],
                        Component: lazy(() => import('@renderer/pages/hr/overtime/DangKyTuanNgoaiGioPage')),
                        children: []
                    },
                    {
                        title: 'Bảng chấm công',
                        description: 'Bảng chấm công tháng của cán bộ nhân viên',
                        path: 'hrm/bang-cham-cong',
                        permission: false,
                        Component: lazy(() => import('@renderer/pages/hr/overtime/BangChamCongPage')),
                        children: []
                    }
                ]
            },
            {
                title: 'Danh mục',
                abbre: 'Danh mục',
                module: 'danhmuc',
                description: 'Quản lý các mục đơn vị',
                path: undefined,
                icon: AlignStartVertical,
                Component: null,
                permission: undefined,
                children: [
                    {
                        title: 'Đơn vị',
                        description: 'Quản lý các danh mục đơn vị',
                        path: 'hrm/danh-muc',
                        hide: false,
                        permission: ['danhmuc', 'donvi', 'loaivanban', 'chucvu'],
                        Component: lazy(() => import('@renderer/pages/category/DanhmucPage')),
                        children: []
                    },
                    {
                        title: 'Hệ thống',
                        description: 'Quản lý các danh mục hệ thống',
                        path: 'hrm/danh-muc-he-thong',
                        hide: false,
                        permission: ['danhmuc', 'loaivanban', 'hinhthuc', 'tinhchat', 'baomat', 'coquan', 'chucvu', 'calamviec', 'daotao'],
                        Component: lazy(() => import('@renderer/pages/category/DanhMucHeThong')),
                        children: []
                    },
                    // {
                    //     title: 'Đơn vị',
                    //     description: 'Bản sao quản lý danh mục đơn vị (dữ liệu ảo)',
                    //     path: 'hrm/danh-muc-clone',
                    //     hide: false,
                    //     permission: ['danhmuc', 'donvi', 'loaivanban', 'chucvu'],
                    //     Component: lazy(() => import('@renderer/pages/category_clone/DanhmucPage')),
                    //     children: []
                    // },
                    // {
                    //     title: 'Hệ thống',
                    //     description: 'Bản sao quản lý danh mục hệ thống (dữ liệu ảo)',
                    //     path: 'hrm/danh-muc-he-thong-clone',
                    //     hide: false,
                    //     permission: ['danhmuc', 'loaivanban', 'hinhthuc', 'tinhchat', 'baomat', 'coquan', 'chucvu', 'calamviec', 'daotao'],
                    //     Component: lazy(() => import('@renderer/pages/category_clone/DanhMucHeThong')),
                    //     children: []
                    // },
                    {
                        title: 'Lịch nghỉ phép',
                        description: 'Cấu hình lịch nghỉ lễ cho hệ thống.',
                        path: 'danh-muc/lich-nghi-phep',
                        hide: false,
                        permission: false,
                        Component: lazy(() => import('@renderer/pages/category/LichNghiPhepPage')),
                        children: []
                    },
                    // {
                    //     title: 'Lịch nghỉ phép (Clone)',
                    //     description: 'Bản sao cấu hình lịch nghỉ lễ (dữ liệu ảo)',
                    //     path: 'danh-muc/lich-nghi-phep-clone',
                    //     hide: true,
                    //     permission: false,
                    //     Component: lazy(() => import('@renderer/pages/category_clone/LichNghiPhepPage')),
                    //     children: []
                    // }
                ]
            },
            {
                title: 'Hệ thống',
                abbre: 'Hệ thống',
                module: 'he-thong',
                description: 'Cấu hình các tham số vận hành toàn hệ thống',
                path: undefined,
                hide: false,
                icon: Cog,
                permission: false,
                children: [
                    {
                        title: 'Quản lý người dùng',
                        path: 'he-thong/nguoi-dung',
                        description: 'Quản lý người dùng và phân quyền truy cập hệ thống',
                        hide: true,
                        permission: false,
                        Component: lazy(() => import('@renderer/pages/system/users/UserPage'))
                    },
                    // {
                    //     title: 'Quản lý vai trò',
                    //     description: 'Quản lý vai trò hệ thống và phân quyền theo vai trò',
                    //     path: 'he-thong/vai-tro',
                    //     hide: true,
                    //     permission: false,
                    //     Component: lazy(() => import('@renderer/pages/system/roles/RolePage')),
                    //     children: []
                    // },
                    {
                        title: 'Quản lý vai trò',
                        description: 'Bản sao quản lý vai trò hệ thống',
                        path: 'he-thong/vai-tro-clone',
                        hide: false,
                        permission: false,
                        Component: lazy(() => import('@renderer/pages/system/roles/RolePage')),
                        children: []
                    },
                    {
                        title: 'Báo cáo đăng nhập',
                        description: 'Thống kê lượt truy cập và hoạt động người dùng hệ thống',
                        path: 'he-thong/bao-cao-dang-nhap',
                        hide: true,
                        permission: false,
                        Component: lazy(() => import('@renderer/pages/system/LoginAnalyticsPage')),
                        children: []
                    },
                    {
                        title: 'Nhật ký hệ thống',
                        description: 'Theo dõi toàn bộ các thao tác, thay đổi dữ liệu trong hệ thống',

                        path: 'he-thong/nhat-ky',
                        hide: true,
                        permission: false,
                        Component: lazy(() => import('@renderer/pages/system/logs/SystemLogPage')),
                        children: []
                    }
                ]
            },
            {
                path: 'verify-otp',
                hide: true,
                permission: false,
                Component: VerifyOtpPage
            },

        ]
    },
    {
        path: '*',
        Component: lazy(() => import('@renderer/pages/error/NotFoundPage')),
        children: []
    },
    {
        path: '/login',
        Component: lazy(() => import('@renderer/pages/auth/LoginPage')),
        children: []
    },
    {
        /* Callback loginGoogle */
        path: '/auth/google/callback',
        Component: lazy(() => import('@renderer/pages/auth/LoginGoogleCallback'))
    },
    {
        /* Callback loginGoogle */
        path: '/sso/callback',
        Component: lazy(() => import('@renderer/api/auth/SSOCallback'))
    },
    {
        /* Callback loginZalo */
        path: '/zalo/callback',
        Component: lazy(() => import('@renderer/pages/auth/LoginZaloCallback'))
    },
    {
        title: 'Xem trước',
        path: '/preview/:encodedUrl',
        Component: lazy(() => import('@renderer/components/Preview'))
    },
    {
        title: 'Đăng ký',
        path: '/hrm/nghi-phep/dang-ky',
        Component: lazy(() => import('@renderer/pages/hr/leave/DangKyNghiPhepPage'))
    },
    {
        title: 'Duyệt đăng ký',
        path: '/hrm/nghi-phep/duyet/:id',
        Component: lazy(() => import('@renderer/pages/hr/leave/DuyetNghiPhepPage'))
    },
    {
        title: 'Xác thực đăng ký',
        path: '/authentication/activate_pin_code/:id',
        Component: lazy(() => import('@renderer/pages/hr/propose/PinCodeApproval'))
    }
]
