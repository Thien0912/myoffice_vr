import React from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import type { NhansuFormData, DonVi } from './AddNhansuButton'
import { Card, CardBody, Checkbox } from '@heroui/react'
import { HrAutocomplete, HrDateInput, HrInput, HrTextarea } from '@renderer/components/hero-custom'
import { FormCollapse } from './FormCollapse'
import { Briefcase, Clock, ShieldCheck, GraduationCap, UserCheck, BadgeCheck, Check } from 'lucide-react'
import { LOAI_HOP_DONG } from '@renderer/api/danhmuc/hopDong'
import { mapCaLamViecOptions } from '@renderer/api/danhmuc/caLamViecAxios'
import { TRANG_THAI_CONG_VIEC } from '@renderer/api/danhmuc/nhansuAxios'

interface Step3WorkProps {
  donVi: DonVi[]
  tinh: { id: string; name: string }[]
  hideTitle?: boolean
  hideInsurance?: boolean
}

const Step3Work: React.FC<Step3WorkProps> = ({ donVi, tinh, hideTitle = false, hideInsurance = false }) => {
  const { control } = useFormContext<NhansuFormData>()
  const [caLamViecOptions, setCaLamViecOptions] = React.useState<
    { value: string; label: string }[]
  >([])

  // const [nhanSuOptions, setNhanSuOptions] = React.useState<{ value: string; label: string }[]>([])

  React.useEffect(() => {
    const fetchData = async () => {
      // Fetch ca lam viec options
      const options = await mapCaLamViecOptions()
      setCaLamViecOptions(options)
    }

    fetchData()
  }, [])

  const [
    sum_ma_nhan_vien,
    sum_ho_va_ten,
    sum_email,
    sum_sdt,
    sum_id_don_vi,
    sum_chuc_danh,
    sum_trang_thai,
    sum_so_ngay_phep
  ] = useWatch({
    control,
    name: [
      'ma_nhan_vien',
      'ho_va_ten',
      'email',
      'so_dien_thoai',
      'id_don_vi',
      'chuc_danh',
      'trang_thai',
      'so_ngay_phep'
    ]
  }) as [string, string, string, string, string, string, string, string]

  return (
    <div className="space-y-3">
      {!hideTitle && (
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Thông tin công việc & Bảo hiểm</h3>
          <p className="text-sm text-gray-600">Thông tin chi tiết về công việc và bảo hiểm xã hội</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <FormCollapse title="Thông tin công việc" defaultExpanded icon={<Briefcase size={18} />}>

          <div className="grid md:grid-cols-3 gap-4">
            <Controller
              name="ma_cham_cong"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Mã chấm công"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />

            {/* <Controller
              name="chuc_danh"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Chức danh"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            /> */}

            <Controller
              name="trang_thai"
              control={control}
              render={({ field }) => (
                <HrAutocomplete
                  label="Trạng thái"
                  options={Object.values(TRANG_THAI_CONG_VIEC).map((item) => ({
                    value: item.value,
                    label: item.label
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="id_ca_lam_viec"
              control={control}
              rules={{
                required: 'Ca làm việc là bắt buộc'
              }}
              render={({ field, fieldState: { error } }) => (
                <HrAutocomplete
                  label="Ca làm việc"
                  isRequired
                  options={caLamViecOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  isInvalid={!!error}
                  errorMessage={error?.message}
                />
              )}
            />
            {/*
            <Controller
              name="id_nhan_vien_ql_truc_tiep"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Quản lý trực tiếp"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="id_nhan_vien_ql_gian_tiep"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Quản lý gián tiếp"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="so_so_qlld"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Số sổ QLLD"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            */}

            {/*
            <Controller
              name="loai_hop_dong"
              control={control}
              render={({ field }) => (
                <HrAutocomplete
                  label="Loại hợp đồng"
                  options={Object.values(LOAI_HOP_DONG).map((item) => ({
                    value: item.value,
                    label: item.label
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="bac_hop_dong"
              control={control}
              render={({ field }) => (
                <HrInput label="Bậc" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <Controller
              name="so_ngay_phep"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Số ngày phép"
                  type="number"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            */}
            <Controller
              name="tu_dong_tang_phep"
              control={control}
              render={({ field }) => (
                <div className="md:col-span-3">
                  <Checkbox
                    size="sm"
                    id="tu_dong_tang_phep"
                    isSelected={field.value === true || String(field.value) === '1'}
                    onValueChange={(isSelected) => field.onChange(isSelected)}
                  >
                    Tự động tăng phép theo năm (sau mỗi 5 năm làm việc)
                  </Checkbox>
                </div>
              )}
            />
          </div>
        </FormCollapse>

        <FormCollapse title="Thời gian làm việc" defaultExpanded icon={<Clock size={18} />}>

          <div className="grid md:grid-cols-3 gap-4">
            {/* ── Box 1: Thời gian học việc ── */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50">
                <GraduationCap size={16} className="text-blue-500" />
                <span className="text-sm font-semibold text-gray-700">Thời gian học việc</span>
              </div>
              <div className="px-4 py-3 space-y-3">
                <Controller
                  name="ngay_tap_su"
                  control={control}
                  render={({ field }) => (
                    <HrDateInput
                      label="Từ ngày"
                      value={field.value || ''}
                      onChangeValue={field.onChange}
                    />
                  )}
                />
                <Controller
                  name="ngay_tap_su_ket_thuc"
                  control={control}
                  render={({ field }) => (
                    <HrDateInput
                      label="Đến ngày"
                      value={field.value || ''}
                      onChangeValue={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            {/* ── Box 2: Thời gian thử việc ── */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50">
                <UserCheck size={16} className="text-amber-500" />
                <span className="text-sm font-semibold text-gray-700">Thời gian thử việc</span>
              </div>
              <div className="px-4 py-3 space-y-3">
                <Controller
                  name="ngay_thu_viec"
                  control={control}
                  render={({ field }) => (
                    <HrDateInput
                      label="Từ ngày"
                      value={field.value || ''}
                      onChangeValue={field.onChange}
                    />
                  )}
                />
                <Controller
                  name="ngay_thu_viec_ket_thuc"
                  control={control}
                  render={({ field }) => (
                    <HrDateInput
                      label="Đến ngày"
                      value={field.value || ''}
                      onChangeValue={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            {/* ── Box 3: Thời gian chính thức ── */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50">
                <BadgeCheck size={16} className="text-emerald-500" />
                <span className="text-sm font-semibold text-gray-700">Thời gian chính thức</span>
              </div>
              <div className="px-4 py-3 space-y-3">
                <Controller
                  name="ngay_lam_chinh_thuc"
                  control={control}
                  render={({ field }) => (
                    <HrDateInput
                      label="Từ ngày"
                      value={field.value || ''}
                      onChangeValue={field.onChange}
                    />
                  )}
                />
                <Controller
                  name="ngay_lam_chinh_thuc_ket_thuc"
                  control={control}
                  render={({ field }) => (
                    <HrDateInput
                      label="Đến ngày"
                      value={field.value || ''}
                      onChangeValue={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </FormCollapse>

        {!hideInsurance && (
          <FormCollapse title="Thông tin sổ bảo hiểm xã hội" defaultExpanded icon={<ShieldCheck size={18} />}>

            <div className="grid md:grid-cols-2 form-col-4 gap-4">
              <Controller
                name="so_so_bhxh"
                control={control}
                render={({ field }) => (
                  <HrInput
                    label="Số sổ BHXH"
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="ma_bhxh"
                control={control}
                render={({ field }) => (
                  <HrInput
                    label="Mã số BHXH"
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="ti_le_dong"
                control={control}
                render={({ field }) => (
                  <HrInput
                    type="number"
                    label="Tỷ lệ đóng NLD (%)"
                    value={field.value || ''}
                    onChange={field.onChange}
                    endContent={<span className="text-gray-400">%</span>}
                  />
                )}
              />
              <Controller
                name="ti_le_dong_dn"
                control={control}
                render={({ field }) => (
                  <HrInput
                    type="number"
                    label="Tỷ lệ đóng NSDLD (%)"
                    value={field.value || ''}
                    onChange={field.onChange}
                    endContent={<span className="text-gray-400">%</span>}
                  />
                )}
              />
              <Controller
                // name="ten_tinh_bhxh"
                name="ten_tinh_cap"
                control={control}
                render={({ field }) => (
                  <HrAutocomplete
                    label="Tên tỉnh"
                    options={tinh.map((t) => ({ label: t.name, value: t.id }))}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="ngay_tham_gia"
                control={control}
                render={({ field }) => (
                  <HrDateInput
                    label="Ngày tham gia BHXH"
                    value={field.value || ''}
                    onChangeValue={field.onChange}
                  />
                )}
              />
              <Controller
                // name="ngay_het_han"
                name="ngay_het_han"
                control={control}
                render={({ field }) => (
                  <HrDateInput
                    label="Ngày hết hạn BHXH"
                    value={field.value || ''}
                    onChangeValue={field.onChange}
                  />
                )}
              />
              <Controller
                name="noi_dk_kcb"
                control={control}
                render={({ field }) => (
                  <HrTextarea
                    label="Nơi đăng ký khám chữa bệnh"
                    placeholder="Nhập nơi đăng ký KCB ban đầu"
                    value={field.value || ''}
                    onChange={field.onChange}
                    minRows={1}
                  />
                )}
              />
            </div>
          </FormCollapse>
        )}

        {/* Ghi chú & Tóm tắt — commented out, not currently needed
        <FormCollapse title="Ghi chú & Tóm tắt" defaultExpanded>
          <Controller
            name="ghi_chu"
            control={control}
            render={({ field }) => (
              <HrTextarea
                label="Ghi chú"
                placeholder="Nhập ghi chú bổ sung (tùy chọn)"
                value={field.value || ''}
                onChange={field.onChange}
                minRows={3}
                className="mb-4"
              />
            )}
          />
          ...
        </FormCollapse>
        */}
      </div>
    </div>
  )
}

export default React.memo(Step3Work)
