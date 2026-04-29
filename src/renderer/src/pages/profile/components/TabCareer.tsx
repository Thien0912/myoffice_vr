import { date as formatDate } from '@renderer/utils/formatDate'
import { Award, Briefcase, Edit, GraduationCap, Trash } from 'lucide-react'
import React, { Suspense } from 'react'
import { FormCollapse } from './FormCollapse'

// Lazy load CRUD components (mounted hidden for event handling)
const Quatrinhcongtac = React.lazy(() => import('./elements/Quatrinhcongtac'))
const Quatrinhdaotao = React.lazy(() => import('./elements/Quatrinhdaotao'))
const Kinhnghiemlamviec = React.lazy(() => import('./elements/Kinhnghiemlamviec'))

interface TabCareerProps {
  quatrinhcongtacList?: any[]
  quatrinhdaotaoList?: any[]
  kinhNghiemList?: any[]
  user?: {
    id_nhan_vien: string
    id_vi_tri_cong_viec: string
    id_don_vi_cong_tac: string
    ma_nhan_vien: string
  }
  onOpenSecondary?: (sectionId: string) => void
}

/**
 * Career tab component using EmployeeDetailDrawer visual design.
 * - FormCollapse sections (white bg, consistent with form tabs)
 * - Visual timeline/cards with edit/delete buttons
 * - Hidden CRUD components handle side panel + API operations via events
 */
const TabCareer: React.FC<TabCareerProps> = ({
  quatrinhcongtacList,
  quatrinhdaotaoList,
  kinhNghiemList,
  user,
  onOpenSecondary
}) => {
  const sortedCongtac = React.useMemo(() => {
    if (!quatrinhcongtacList?.length) return []
    return [...quatrinhcongtacList].sort((a, b) => {
      const dateA = a.ngay_bat_dau ? new Date(a.ngay_bat_dau).getTime() : 0
      const dateB = b.ngay_bat_dau ? new Date(b.ngay_bat_dau).getTime() : 0
      return dateB - dateA
    })
  }, [quatrinhcongtacList])

  const handleTriggerAdd = (sectionId: string) => {
    if (onOpenSecondary) {
      onOpenSecondary(sectionId)
    } else {
      window.dispatchEvent(new CustomEvent(`trigger-add-${sectionId}`))
    }
  }

  const handleTriggerEdit = (sectionId: string, row: any) => {
    window.dispatchEvent(new CustomEvent(`trigger-edit-${sectionId}`, { detail: row }))
  }

  const handleTriggerDelete = (sectionId: string, id: string | number) => {
    window.dispatchEvent(new CustomEvent(`trigger-delete-${sectionId}`, { detail: id }))
  }

  const congtacCount = quatrinhcongtacList?.length || 0
  const daotaoCount = quatrinhdaotaoList?.length || 0
  const kinhNghiemCount = kinhNghiemList?.length || 0

  return (
    <div className="flex flex-col gap-2">
      {/* ═══ Section 1: Quá trình công tác ═══ */}
      <FormCollapse
        title="Quá trình công tác"
        icon={<Briefcase size={18} />}
        iconBg="bg-blue-50"
        iconColor="text-blue-500"
        count={congtacCount}
        defaultExpanded={congtacCount > 0}
        onAdd={() => handleTriggerAdd('section-6')}
      >
        {sortedCongtac.length > 0 ? (
          <div className="relative flex flex-col pt-2">
            {sortedCongtac.map((item: any, index: number) => (
              <div
                key={item.id_qua_trinh_cong_tac || index}
                className="relative flex gap-4 group"
              >
                {/* Track Line */}
                {index !== sortedCongtac.length - 1 && (
                  <div className="absolute left-[11px] top-[22px] bottom-[-2px] w-[2px] bg-gray-200 z-0" />
                )}

                {/* Node */}
                <div className="relative z-10 w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 mt-[-2px]">
                  {index === 0 ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 flex items-center justify-center bg-white">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    </div>
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-blue-400 bg-white" />
                  )}
                </div>

                {/* Content */}
                <div className="relative flex-1 min-w-0 pb-6 group-hover:bg-gray-50/50 rounded-lg -ml-2 pl-2 pr-2 transition-colors">
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-[15px] font-semibold text-gray-900 leading-snug">
                      {item.ten_cong_viec || '---'}
                    </h4>

                    <div className="text-[14px] font-medium text-gray-700 mt-0.5">
                      {item.ten_don_vi || '---'}
                    </div>

                    <div className="text-[13px] text-gray-500 mt-0.5">
                      {item.ngay_bat_dau ? formatDate('d/m/Y', item.ngay_bat_dau) : '???'}
                      {' – '}
                      {item.ngay_ket_thuc ? formatDate('d/m/Y', item.ngay_ket_thuc) : 'Nay'}
                    </div>

                    {item.ghi_chu && (
                      <p className="text-[13.5px] text-gray-600 leading-relaxed mt-2 whitespace-pre-wrap">
                        {item.ghi_chu}
                      </p>
                    )}
                  </div>

                  {/* Edit/Delete buttons */}
                  <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-lg px-1 shadow-sm border border-gray-100">

                    <button
                      type="button"
                      onClick={() => handleTriggerEdit('section-6', item)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                    >
                      <Edit size={14} />
                    </button>

                    <div className="w-px h-3 bg-gray-200" />

                    <button
                      type="button"
                      onClick={() => handleTriggerDelete('section-6', item.id_qua_trinh_cong_tac)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash size={14} />
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic text-center py-4">
            Chưa có dữ liệu quá trình công tác.
          </p>
        )}
      </FormCollapse>

      {/* ═══ Section 2: Kinh nghiệm làm việc ═══ */}
      <FormCollapse
        title="Kinh nghiệm làm việc"
        icon={<Award size={18} />}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
        count={kinhNghiemCount}
        defaultExpanded={kinhNghiemCount > 0}
        onAdd={() => handleTriggerAdd('section-8')}
      >
        {kinhNghiemList && kinhNghiemList.length > 0 ? (
          <div className="relative flex flex-col pt-2">
            {kinhNghiemList.map((item: any, index: number) => (
              <div
                key={item.id_kinh_nghiem || index}
                className="relative flex gap-4 group"
              >
                {/* Track Line */}
                {index !== kinhNghiemList.length - 1 && (
                  <div className="absolute left-[11px] top-[22px] bottom-[-2px] w-[2px] bg-gray-200 z-0" />
                )}

                {/* Node */}
                <div className="relative z-10 w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 mt-[-2px]">
                  {index === 0 ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 flex items-center justify-center bg-white">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    </div>
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-amber-400 bg-white" />
                  )}
                </div>

                {/* Content */}
                <div className="relative flex-1 min-w-0 pb-6 group-hover:bg-gray-50/50 rounded-lg -ml-2 pl-2 pr-2 transition-colors">
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-[15px] font-semibold text-gray-900 leading-snug">
                      {item.chuc_danh || '---'}
                    </h4>

                    <div className="text-[14px] font-medium text-gray-700 mt-0.5">
                      {item.ten_cong_ty || '---'}
                    </div>

                    <div className="text-[13px] text-gray-500 mt-0.5">
                      {item.ngay_bat_dau ? formatDate('d/m/Y', item.ngay_bat_dau) : '???'}
                      {' – '}
                      {item.ngay_ket_thuc ? formatDate('d/m/Y', item.ngay_ket_thuc) : 'Hiện tại'}
                    </div>

                    {item.mo_ta && (
                      <p className="text-[14px] text-gray-600 leading-relaxed mt-1.5 whitespace-pre-wrap">
                        {item.mo_ta}
                      </p>
                    )}
                  </div>

                  {/* Edit/Delete buttons */}
                  <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-lg px-1 shadow-sm border border-gray-100">

                    <button
                      type="button"
                      onClick={() => handleTriggerEdit('section-8', item)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-amber-500 transition-colors cursor-pointer"
                    >
                      <Edit size={14} />
                    </button>

                    <div className="w-px h-3 bg-gray-200" />

                    <button
                      type="button"
                      onClick={() => handleTriggerDelete('section-8', item.id_kinh_nghiem)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash size={14} />
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic text-center py-4">
            Chưa có dữ liệu kinh nghiệm làm việc.
          </p>
        )}
      </FormCollapse>

      {/* ═══ Section 3: Quá trình đào tạo ═══ */}
      <FormCollapse
        title="Quá trình đào tạo"
        icon={<GraduationCap size={18} />}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-500"
        count={daotaoCount}
        defaultExpanded={daotaoCount > 0}
        onAdd={() => handleTriggerAdd('section-11')}
      >
        {quatrinhdaotaoList && quatrinhdaotaoList.length > 0 ? (
          <div className="relative flex flex-col pt-2">
            {quatrinhdaotaoList.map((item: any, index: number) => (
              <div
                key={item.id_nhan_vien_dao_tao || index}
                className="relative flex gap-4 group"
              >
                {/* Track Line */}
                {index !== quatrinhdaotaoList.length - 1 && (
                  <div className="absolute left-[11px] top-[22px] bottom-[-2px] w-[2px] bg-gray-200 z-0" />
                )}

                {/* Node */}
                <div className="relative z-10 w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 mt-[-2px]">
                  {index === 0 ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-white">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    </div>
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-emerald-400 bg-white" />
                  )}
                </div>

                {/* Content */}
                <div className="relative flex-1 min-w-0 pb-6 group-hover:bg-gray-50/50 rounded-lg -ml-2 pl-2 pr-2 transition-colors">
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-[15px] font-semibold text-gray-900 leading-snug">
                      {item.ten_khoa_hoc || '---'}
                    </h4>

                    <div className="text-[13px] text-gray-500 mt-0.5">
                      {item.ngay_bat_dau ? formatDate('d/m/Y', item.ngay_bat_dau) : '???'}
                      {' – '}
                      {item.ngay_ket_thuc ? formatDate('d/m/Y', item.ngay_ket_thuc) : '???'}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pr-16">
                      <DetailItem label="Nội dung" value={item.noi_dung || '---'} />
                      <DetailItem
                        label="Trạng thái"
                        value={
                          item.trang_thai === 'Hoan_thanh'
                            ? 'Hoàn thành'
                            : item.trang_thai === 'Dang_dien_ra'
                              ? 'Đang diễn ra'
                              : item.trang_thai === 'Chua_dien_ra'
                                ? 'Chưa diễn ra'
                                : item.trang_thai || '---'
                        }
                      />
                      <DetailItem
                        label="Kết quả"
                        value={
                          item.ket_qua === 'Hoan_thanh'
                            ? 'Hoàn thành'
                            : item.ket_qua === 'Dat'
                              ? 'Đạt'
                              : item.ket_qua === 'Khong_dat'
                                ? 'Không đạt'
                                : item.ket_qua || '---'
                        }
                      />
                    </div>
                  </div>

                  {/* Edit/Delete buttons */}
                  <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-lg px-1 shadow-sm border border-gray-100">

                    <button
                      type="button"
                      onClick={() => handleTriggerEdit('section-11', item)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-emerald-500 transition-colors cursor-pointer"
                    >
                      <Edit size={14} />
                    </button>

                    <div className="w-px h-3 bg-gray-200" />

                    <button
                      type="button"
                      onClick={() => handleTriggerDelete('section-11', item.id_nhan_vien_dao_tao)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash size={14} />
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic text-center py-4">
            Chưa có dữ liệu quá trình đào tạo.
          </p>
        )}
      </FormCollapse>

      {/* Hidden CRUD components — handle side panel, API calls, confirm modals */}
      <div className="hidden" aria-hidden="true">
        <Suspense fallback={null}>
          <Quatrinhcongtac quatrinhcongtacList={quatrinhcongtacList} user={user} />
          <Quatrinhdaotao quatrinhdaotaoList={quatrinhdaotaoList} user={user} />
          <Kinhnghiemlamviec kinhnghiemList={kinhNghiemList} user={user} />
        </Suspense>
      </div>
    </div>
  )
}

/** Reusable label/value pair — same pattern as EmployeeDetailDrawer */
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <p className="text-[12px] text-gray-400">{label}</p>
      <p className="text-[13px] font-semibold text-gray-700 break-words">{value}</p>
    </div>
  )
}

export default React.memo(TabCareer)
