import { Checkbox } from '@heroui/react'
import { mapQuanhuyenxaAxios } from '@renderer/api/danhmuc/dtqgtg'
import { HrAutocomplete, HrInput, HrTextarea } from '@renderer/components/hero-custom'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import type { NhansuFormData, Phuong, QuocGia, Tinh } from './AddNhansuButton'
import { FormCollapse } from './FormCollapse'
import { Home, MapPin } from 'lucide-react'

interface TabAddressProps {
  quocGia: QuocGia[]
  tinh: Tinh[]
}

const TabAddress: React.FC<TabAddressProps> = ({ quocGia, tinh }) => {
  const { control, setValue, getValues } = useFormContext<NhansuFormData>()

  // ── HKTT state ──
  const [hkttPhuongOptions, setHkttPhuongOptions] = useState<Phuong[]>([])
  const prevHkttTinhRef = useRef<string | undefined>(undefined)
  const [hkttTinh] = useWatch({ control, name: ['hktt_id_tinh_tp'] }) as [string | undefined]

  const quocGiaOptions = useMemo(
    () => quocGia.map((dt) => ({ value: String(dt.id_quoc_gia), label: dt.ten })),
    [quocGia]
  )
  const tinhOptions = useMemo(
    () => tinh.map((dt) => ({ value: String(dt.id), label: dt.name })),
    [tinh]
  )
  const hkttPhuongOpts = useMemo(
    () => hkttPhuongOptions.map((dt) => ({ value: String(dt.id), label: dt.name })),
    [hkttPhuongOptions]
  )

  const loadHkttPhuong = useCallback(
    async (provinceCode: string, clearSelectionAfterLoad = false) => {
      if (!provinceCode) { setHkttPhuongOptions([]); return }
      try {
        const wards = await mapQuanhuyenxaAxios(provinceCode)
        const normalized = wards.map((w) => ({ id: w.value, name: w.label, district_code: w.district_code })) as Phuong[]
        setHkttPhuongOptions(normalized)
        if (clearSelectionAfterLoad) setValue('hktt_id_xa_phuong', '')
      } catch {
        setHkttPhuongOptions([])
        if (clearSelectionAfterLoad) setValue('hktt_id_xa_phuong', '')
      }
    },
    [setValue]
  )

  useEffect(() => {
    const provinceChanged = prevHkttTinhRef.current !== undefined && prevHkttTinhRef.current !== hkttTinh
    loadHkttPhuong(hkttTinh || '', provinceChanged)
    prevHkttTinhRef.current = hkttTinh
  }, [hkttTinh, loadHkttPhuong])

  // Auto compose hktt_dia_chi
  const [hkttXaPhuong, hkttSoNha] = useWatch({
    control,
    name: ['hktt_id_xa_phuong', 'hktt_so_nha']
  }) as [string, string]

  const lastHkttAddressRef = useRef({ tinh: hkttTinh, xa: hkttXaPhuong, soNha: hkttSoNha })

  useEffect(() => {
    const changed =
      lastHkttAddressRef.current.tinh !== hkttTinh ||
      lastHkttAddressRef.current.xa !== hkttXaPhuong ||
      lastHkttAddressRef.current.soNha !== hkttSoNha
    if (!changed) return
    const tinhLabel = tinhOptions.find((o) => String(o.value) === String(hkttTinh))?.label || ''
    const phuongLabel = hkttPhuongOpts.find((o) => String(o.value) === String(hkttXaPhuong))?.label || ''
    const soNha = hkttSoNha || ''
    const composed = [soNha, phuongLabel, tinhLabel].filter(Boolean).join(', ')
    setValue('hktt_dia_chi', composed)
    lastHkttAddressRef.current = { tinh: hkttTinh, xa: hkttXaPhuong, soNha: hkttSoNha }
  }, [hkttTinh, hkttXaPhuong, hkttSoNha, tinhOptions, hkttPhuongOpts, setValue])

  // ── COHN state ──
  const [cohnPhuongOptions, setCohnPhuongOptions] = useState<Phuong[]>([])
  const prevCohnTinhRef = useRef<string | undefined>(undefined)
  const isCopyingFromHkttRef = useRef<boolean>(false)
  const [cohnTinh, cohnXaPhuong, cohnSoNha] = useWatch({
    control,
    name: ['cohn_id_tinh_tp', 'cohn_id_xa_phuong', 'cohn_so_nha']
  }) as [string | undefined, string, string]

  const cohnPhuongOpts = useMemo(
    () => cohnPhuongOptions.map((dt) => ({ value: String(dt.id), label: dt.name })),
    [cohnPhuongOptions]
  )

  const loadCohnPhuong = useCallback(async (provinceCode: string) => {
    if (!provinceCode) { setCohnPhuongOptions([]); return }
    try {
      const wards = await mapQuanhuyenxaAxios(provinceCode)
      const normalized = wards.map((w) => ({ id: w.value, name: w.label, district_code: w.district_code })) as Phuong[]
      setCohnPhuongOptions(normalized)
    } catch {
      setCohnPhuongOptions([])
    }
  }, [])

  useEffect(() => {
    const provinceChanged = prevCohnTinhRef.current !== undefined && prevCohnTinhRef.current !== cohnTinh
    loadCohnPhuong(cohnTinh || '')
    if (provinceChanged && !isCopyingFromHkttRef.current) {
      setValue('cohn_id_xa_phuong', '')
    }
    isCopyingFromHkttRef.current = false
    prevCohnTinhRef.current = cohnTinh
  }, [cohnTinh, loadCohnPhuong, setValue])

  // Auto compose cohn_dia_chi
  const lastCohnAddressRef = useRef({ tinh: cohnTinh, xa: cohnXaPhuong, soNha: cohnSoNha })

  useEffect(() => {
    const changed =
      lastCohnAddressRef.current.tinh !== cohnTinh ||
      lastCohnAddressRef.current.xa !== cohnXaPhuong ||
      lastCohnAddressRef.current.soNha !== cohnSoNha
    if (!changed) return
    const tinhLabel = tinhOptions.find((o) => String(o.value) === String(cohnTinh))?.label || ''
    const phuongLabel = cohnPhuongOpts.find((o) => String(o.value) === String(cohnXaPhuong))?.label || ''
    const soNha = cohnSoNha || ''
    const composed = [soNha, phuongLabel, tinhLabel].filter(Boolean).join(', ')
    setValue('cohn_dia_chi', composed)
    lastCohnAddressRef.current = { tinh: cohnTinh, xa: cohnXaPhuong, soNha: cohnSoNha }
  }, [cohnTinh, cohnXaPhuong, cohnSoNha, tinhOptions, cohnPhuongOpts, setValue])

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        {/* ── Hộ khẩu thường trú ── */}
        <FormCollapse title="Hộ khẩu thường trú" defaultExpanded icon={<Home size={18} />}>
          <div className="grid md:grid-cols-2 form-col-4 gap-4">
            <Controller
              name="hktt_id_quoc_gia"
              control={control}
              render={({ field }) => (
                <HrAutocomplete label="Quốc gia" options={quocGiaOptions} value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              name="hktt_id_tinh_tp"
              control={control}
              render={({ field }) => (
                <HrAutocomplete label="Tỉnh/Thành phố" options={tinhOptions} value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              name="hktt_id_xa_phuong"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <HrAutocomplete
                    label="Phường/Xã"
                    options={hkttPhuongOpts}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val)
                      const selected = hkttPhuongOptions.find((w) => String(w.id) === val)
                      if (selected?.district_code) {
                        setValue('hktt_id_quan_huyen', selected.district_code)
                      } else {
                        setValue('hktt_id_quan_huyen', '')
                      }
                    }}
                    onBlur={field.onBlur}
                  />
                  {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                </div>
              )}
            />
            <Controller
              name="hktt_so_nha"
              control={control}
              render={({ field }) => (
                <HrInput label="Số nhà/Tên đường" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            {/*
            <Controller
              name="hktt_so_ho_khau"
              control={control}
              render={({ field }) => (
                <HrInput label="Số hộ khẩu" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <Controller
              name="hktt_ma_so_ho_gd"
              control={control}
              render={({ field }) => (
                <HrInput label="Mã số hộ gia đình" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            */}
            <Controller
              name="hktt_dia_chi"
              control={control}
              render={({ field }) => (
                <div className="md:col-span-2">
                  <HrTextarea label="Địa chỉ đầy đủ" value={field.value || ''} onChange={field.onChange} minRows={2} />
                </div>
              )}
            />
            <Controller
              name="hktt_la_chu_ho"
              control={control}
              render={({ field }) => (
                <div className="md:col-span-2">
                  <Checkbox
                    size="sm"
                    id="hktt_la_chu_ho"
                    isSelected={field.value === true || String(field.value) === '1'}
                    onChange={(isSelected) => field.onChange(isSelected)}
                  >
                    Là chủ hộ
                  </Checkbox>
                </div>
              )}
            />
          </div>
        </FormCollapse>

        {/* ── Chỗ ở hiện nay ── */}
        <FormCollapse title="Chỗ ở hiện nay" defaultExpanded icon={<MapPin size={18} />}>
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
                      await loadCohnPhuong(v.hktt_id_tinh_tp)
                      setValue('cohn_id_xa_phuong', v.hktt_id_xa_phuong)
                      setValue('cohn_id_quan_huyen', v.hktt_id_quan_huyen)
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
                <HrAutocomplete label="Quốc gia" options={quocGiaOptions} value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              name="cohn_id_tinh_tp"
              control={control}
              render={({ field }) => (
                <HrAutocomplete label="Tỉnh/Thành phố" options={tinhOptions} value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              name="cohn_id_xa_phuong"
              control={control}
              render={({ field }) => (
                <HrAutocomplete
                  label="Phường/Xã"
                  options={cohnPhuongOpts}
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val)
                    const selected = cohnPhuongOptions.find((w) => String(w.id) === val)
                    if (selected?.district_code) {
                      setValue('cohn_id_quan_huyen', selected.district_code)
                    } else {
                      setValue('cohn_id_quan_huyen', '')
                    }
                  }}
                />
              )}
            />
            <Controller
              name="cohn_so_nha"
              control={control}
              render={({ field }) => (
                <HrInput label="Số nhà/Tên đường" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <Controller
              name="cohn_dia_chi"
              control={control}
              render={({ field }) => (
                <HrTextarea label="Địa chỉ đầy đủ" value={field.value || ''} onChange={field.onChange} minRows={2} className="md:col-span-2" />
              )}
            />
          </div>
        </FormCollapse>
      </div>
    </div>
  )
}

export default React.memo(TabAddress)
