import { date as formatDate } from '@renderer/utils/formatDate'
import { NghiPhep } from '../types'

interface LeaveDetailContentProps {
  data: NghiPhep
}

export const LeaveDetailContent = ({ data }: LeaveDetailContentProps) => {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-2 bg-gray-50/80 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Chi tiết ngày nghỉ</span>
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white uppercase text-[10px] tracking-wider">
                  <th className="px-4 py-2.5 font-bold border-r border-white/20 text-center">Ngày nghỉ</th>
                  <th className="px-4 py-2.5 font-bold border-r border-white/20 text-center">Số ngày</th>
                  <th className="px-4 py-2.5 font-bold text-center">Buổi nghỉ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.chi_tiet_ngay_nghi?.map((ngay: any, idx: number) => (
                  <tr key={idx} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-2 font-medium text-gray-700 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700 text-center">
                      {formatDate('d/m/Y', ngay.ngay_nghi)}
                    </td>
                    <td className="px-4 py-2 font-bold text-blue-600 dark:text-blue-400 border-r border-gray-100 dark:border-gray-700 text-center">
                      {ngay.buoi_nghi === 'Ca_ngay' ? '1' : '0.5'}
                    </td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400 text-center">
                      {ngay.buoi_nghi === 'Ca_ngay'
                        ? 'Cả ngày'
                        : ngay.buoi_nghi === 'Sang'
                          ? 'Sáng'
                          : 'Chiều'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 p-3 bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-blue-400">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold tracking-tight">
            Lý do nghỉ
          </span>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug whitespace-pre-wrap">
            {data.ly_do_nghi || 'Không có lý do cụ thể'}
          </p>
        </div>
      </div>
    </section>
  )
}
