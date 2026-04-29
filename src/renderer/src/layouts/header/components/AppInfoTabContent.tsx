import logo from '@renderer/assets/images/logo/logo.png'
import { Phone, MessageCircle } from 'lucide-react'

export default function AppInfoTabContent() {
  const appInfo = {
    name: 'MyOffice',
    version: '2.0',
    build: '2025.12',
    description: `MyOffice là giải pháp quản lý và luân chuyển văn bản điện tử tập trung, được thiết kế chuyên biệt cho Trường Đại học Nam Cần Thơ (DNC University). 
    Hệ thống số hóa toàn diện quy trình từ tiếp nhận, lưu trữ đến phân phối văn bản hành chính cho các đơn vị chức năng, đảm bảo xử lý công việc chính xác và kịp thời. 
    Tích hợp quản lý nhân sự cơ bản, hướng tới xây dựng môi trường làm việc số hiện đại và chuyên nghiệp.`,
    developer: 'Trung Tâm Phát Triển và Ứng Dụng Phần Mềm DNC',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center text-center space-y-3">
        <div className="p-2 bg-white dark:bg-gray-800 shrink-0 ring-gray-100 dark:ring-gray-700">
          <img src={logo} alt="MyOffice Logo" className="w-16 h-16 object-contain" />
        </div>
        <div>
          <h2 className="text-xl font-normal text-gray-900 dark:text-white">{appInfo.name}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
            Phiên bản {appInfo.version} (Build {appInfo.build})
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Giới thiệu
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
            {appInfo.description}
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700/50 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
              Nhà phát triển
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {appInfo.developer}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
              Liên hệ
            </span> 
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} strokeWidth={1.5} /> <span>02923.851.136</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MessageCircle size={14} strokeWidth={1.5} /> <span>0342.912.168 (Zalo)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} {appInfo.name}.
        </p>
      </div>
    </div>
  )
}
