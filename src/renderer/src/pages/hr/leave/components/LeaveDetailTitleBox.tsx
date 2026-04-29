import logoDnc from '@renderer/assets/images/logo/logodnc.png'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { NghiPhep } from '../types'

interface LeaveDetailTitleBoxProps {
    data: NghiPhep
}

export const LeaveDetailTitleBox = ({ data }: LeaveDetailTitleBoxProps) => {
    const { user } = useAuthStore()

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative group">
            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-1 mb-3">
                    <div className="shrink-0 flex items-center justify-center order-1 sm:order-2 mb-2 sm:mb-0">
                        <img src={logoDnc} alt="DNC Logo" className="h-10 sm:h-12 w-auto object-contain" />
                    </div>
                    <div className="flex flex-col items-center sm:items-start order-2 sm:order-1">
                        <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white uppercase leading-tight">
                            Chi tiết đơn nghỉ phép
                        </h1>
                    </div>
                </div>

                <div className="h-0.5 bg-blue-500 w-full mb-4"></div>

                <div className="text-gray-500 font-normal">
                    <p className="text-[11px]">- Xem thông tin chi tiết và tiến trình xử lý đơn nghỉ phép.</p>
                    <p className="text-[11px]">- Mã đơn: <span className="font-bold text-blue-600 tracking-wider">{data.uuid_nghi_phep}</span></p>
                </div>

                <div className="mt-4 space-y-2">
                    {user && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span>
                                Đang xem với tư cách:{' '}
                                <b className="text-gray-700 dark:text-gray-200">{user.ql_nguoi_dung_ho_ten}</b>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
