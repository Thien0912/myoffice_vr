import { Checkbox } from '@heroui/react'
import { mapQuanhuyenxaAxios } from '@renderer/api/danhmuc/dtqgtg'
import { HrAutocomplete, HrInput, HrTextarea } from '@renderer/components/hero-custom'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import type { NhansuFormData, Phuong, QuocGia, Tinh } from './AddNhansuButton'
import { FormCollapse } from './FormCollapse'
import { Contact, MapPin, Siren } from 'lucide-react'

interface Step2ContactProps {
  quocGia: QuocGia[]
  tinh: Tinh[]
  hideTitle?: boolean
}
const Step2Contact: React.FC<Step2ContactProps> = ({ quocGia, tinh, hideTitle = false }) => {
  const { control, setValue, getValues } = useFormContext<NhansuFormData>()
  const [phuongOptionsState, setPhuongOptionsState] = useState<Phuong[]>([])
  const prevCohnTinhRef = useRef<string>('')
  const isCopyingFromHkttRef = useRef<boolean>(false)
  const [cohnTinh, cohnXaPhuong, cohnSoNha] = useWatch({
    control,
    name: ['cohn_id_tinh_tp', 'cohn_id_xa_phuong', 'cohn_so_nha']
  }) as [string, string, string]

  const quocGiaOptions = useMemo(
    () => quocGia.map((dt) => ({ value: String(dt.id_quoc_gia), label: dt.ten })),
    [quocGia]
  )

  const tinhOptions = useMemo(
    () => tinh.map((dt) => ({ value: String(dt.id), label: dt.name })),
    [tinh]
  )
  const phuongOptions = useMemo(
    () => phuongOptionsState.map((dt) => ({ value: String(dt.id), label: dt.name })),
    [phuongOptionsState]
  )

  const loadPhuong = useCallback(async (provinceCode: string) => {
    if (!provinceCode) {
      setPhuongOptionsState([])
      return
    }
    try {
      const wards = await mapQuanhuyenxaAxios(provinceCode)
      const normalized = wards.map((w) => ({ id: w.value, name: w.label })) as Phuong[]
      setPhuongOptionsState(normalized)
    } catch (error) {
      console.error('Error loading wards:', error)
      setPhuongOptionsState([])
    }
  }, [])

  useEffect(() => {
    loadPhuong(cohnTinh)
    if (cohnTinh && cohnTinh !== prevCohnTinhRef.current && !isCopyingFromHkttRef.current) {
      setValue('cohn_id_xa_phuong', '')
    }
    isCopyingFromHkttRef.current = false
    prevCohnTinhRef.current = cohnTinh
  }, [cohnTinh, loadPhuong, setValue])

  // Auto compose cohn_dia_chi from province + ward + house number
  const lastCohnAddressRef = useRef({ tinh: cohnTinh, xa: cohnXaPhuong, soNha: cohnSoNha })

  useEffect(() => {
    const changed =
      lastCohnAddressRef.current.tinh !== cohnTinh ||
      lastCohnAddressRef.current.xa !== cohnXaPhuong ||
      lastCohnAddressRef.current.soNha !== cohnSoNha

    if (!changed) return

    const tinhLabel = tinhOptions.find((o) => String(o.value) === String(cohnTinh))?.label || ''
    const phuongLabel =
      phuongOptions.find((o) => String(o.value) === String(cohnXaPhuong))?.label || ''
    const soNha = cohnSoNha || ''
    const composed = [soNha, phuongLabel, tinhLabel].filter(Boolean).join(', ')
    setValue('cohn_dia_chi', composed)
    lastCohnAddressRef.current = { tinh: cohnTinh, xa: cohnXaPhuong, soNha: cohnSoNha }
  }, [cohnTinh, cohnXaPhuong, cohnSoNha, tinhOptions, phuongOptions, setValue])

  return (
    <div className="space-y-2">
      {!hideTitle && (
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Thông tin liên hệ</h3>
          <p className="text-sm text-gray-600">Thông tin liên hệ cá nhân và khẩn cấp</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <FormCollapse title="Thông tin liên hệ cá nhân" icon={<Contact size={18} />} defaultExpanded>

          <div className="grid md:grid-cols-2 form-col-4 gap-4">
            <Controller
              name="so_dien_thoai"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Số điện thoại"
                  type="tel"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="email_ca_nhan"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Email cá nhân"
                  type="email"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="que_quan"
              control={control}
              render={({ field }) => (
                <HrTextarea
                  label="Quê quán"
                  value={field.value || ''}
                  onChange={field.onChange}
                  minRows={2}
                  className="md:col-span-2"
                />
              )}
            />
          </div>
        </FormCollapse>

        <FormCollapse title="Thông tin liên hệ khẩn cấp" icon={<Siren size={18} />} defaultExpanded>

          <div className="grid md:grid-cols-2 form-col-4 gap-4">
            <Controller
              name="lhkc_ho_ten"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Họ và tên"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="lhkc_quan_he"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Mối quan hệ"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="lhkc_sdt_di_dong"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Số điện thoại"
                  type="tel"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="lhkc_sdt_nha_rieng"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="SĐT nhà riêng"
                  type="tel"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="lhkc_email"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Email"
                  type="email"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="lhkc_dia_chi"
              control={control}
              render={({ field }) => (
                <HrTextarea
                  label="Địa chỉ"
                  value={field.value || ''}
                  onChange={field.onChange}
                  minRows={1}
                />
              )}
            />
          </div>
        </FormCollapse>

        <FormCollapse title="Chỗ ở hiện nay" icon={<MapPin size={18} />} defaultExpanded>

          <Controller
            name="cohn_giong_hktt"
            control={control}
            render={({ field }) => (
              <div className="mb-4">
                <Checkbox
                  size="sm"
                  id="cohn_giong_hktt"
                  isSelected={field.value === true || String(field.value) === '1'}
                  onChange={async (isSelected) => {
                    field.onChange(isSelected)
                    if (isSelected) {
                      isCopyingFromHkttRef.current = true
                      const v = getValues()
                      setValue('cohn_id_quoc_gia', v.hktt_id_quoc_gia)
                      setValue('cohn_so_nha', v.hktt_so_nha)
                      setValue('cohn_id_tinh_tp', v.hktt_id_tinh_tp)
                      // Wait for wards to load before setting ward value
                      await loadPhuong(v.hktt_id_tinh_tp)
                      setValue('cohn_id_xa_phuong', v.hktt_id_xa_phuong)
                      setValue('cohn_dia_chi', v.hktt_dia_chi)
                    }
                  }}
                >
                  Giống với hộ khẩu thường trú
                </Checkbox>
              </div>
            )}
          />

          <div className="grid md:grid-cols-2 form-col-4 gap-4">
            <Controller
              name="cohn_id_quoc_gia"
              control={control}
              render={({ field }) => (
                <HrAutocomplete
                  label="Quốc gia"
                  options={quocGiaOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="cohn_id_tinh_tp"
              control={control}
              render={({ field }) => (
                <HrAutocomplete
                  label="Tỉnh/Thành phố"
                  options={tinhOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="cohn_id_xa_phuong"
              control={control}
              render={({ field }) => (
                <HrAutocomplete
                  label="Phường/Xã"
                  options={phuongOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="cohn_so_nha"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Số nhà/Tên đường"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="cohn_dia_chi"
              control={control}
              render={({ field }) => (
                <HrTextarea
                  label="Địa chỉ đầy đủ"
                  value={field.value || ''}
                  onChange={field.onChange}
                  minRows={2}
                  className="md:col-span-2"
                />
              )}
            />
          </div>
        </FormCollapse>
      </div>
    </div>
  )
}

export default React.memo(Step2Contact)
