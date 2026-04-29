import { Card, Checkbox, Tooltip, Input } from '@heroui/react'
import { mapQuanhuyenxaAxios } from '@renderer/api/danhmuc/dtqgtg'
import { useContainerWidth } from '@renderer/hooks/useContainerWidth'
import { getAvatarUrl } from '@renderer/utils/urlUtils'
import { ArrowDownUp, Camera, Plus, X } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { toast } from '@heroui/toast'
import type {
  DanToc,
  DonVi,
  NhansuFormData,
  Phuong,
  QuocGia,
  Tinh,
  TonGiao,
  ViTriCongViec
} from './AddNhansuButton'
import DateInputFloating from './DateInputFloating'
import FloatingLabelTextarea from './FloatingLabelTextarea'
import { HrInput } from '@renderer/components/HrInput'
import { SearchableSelect } from './SearchableSelect'

import { FormCollapse } from './FormCollapse'

interface Step1BasicProps {
  donVi: DonVi[]
  danToc: DanToc[]
  quocGia: QuocGia[]
  tinh: Tinh[]
  tonGiao: TonGiao[]
  viTriCongViec: ViTriCongViec[]

  onAvatarOpen: () => void
  onFileSelect: (file: File) => void
  hideTitle?: boolean
}

const Step1Basic: React.FC<Step1BasicProps> = ({
  donVi,
  danToc,
  quocGia,
  tinh,
  tonGiao,
  viTriCongViec,
  onAvatarOpen,
  onFileSelect,
  hideTitle = false
}) => {
  const { control, setValue } = useFormContext<NhansuFormData>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'don_vi_kiem_nhiem'
  })

  // Memoize donVi options to prevent re-creating on every render
  const [phuongOptionsState, setPhuongOptionsState] = useState<Phuong[]>([])
  const prevHkttTinhRef = useRef<string>('')
  const [hkttTinh] = useWatch({ control, name: ['hktt_id_tinh_tp'] }) as [string]
  const [imgError, setImgError] = useState(false)
  const [avatarValue] = useWatch({ control, name: ['avatar'] }) as [string]

  // Container-width responsive layout (works in drawers, not just viewport)
  const [cardRef, isWide] = useContainerWidth(700)

  useEffect(() => {
    setImgError(false)
  }, [avatarValue])

  // Compact: reusable auto-swap for date pairs
  const useAutoSwapDates = (
    issueField: keyof NhansuFormData,
    expiryField: keyof NhansuFormData
  ) => {
    const [issue, expiry] = useWatch({
      control,
      // Casting to any to satisfy tuple typing for dynamic field names
      name: [issueField as any, expiryField as any]
    }) as [string, string]

    useEffect(() => {
      if (!issue || !expiry) return
      const issueDate = new Date(issue)
      const expiryDate = new Date(expiry)
      if (isNaN(issueDate.getTime()) || isNaN(expiryDate.getTime())) return
      if (expiryDate < issueDate) {
        setValue(issueField as any, expiry)
        setValue(expiryField as any, issue)
      }
    }, [issue, expiry, setValue, issueField, expiryField])
  }

  // Apply for CCCD and Passport
  useAutoSwapDates('cccd_ngay_cap', 'cccd_ngay_het_han')
  useAutoSwapDates('ho_chieu_ngay_cap', 'ho_chieu_ngay_het_han')
  const donViOptions = useMemo(
    () => donVi.map((dv) => ({ value: String(dv.id_don_vi), label: dv.ten_don_vi })),
    [donVi]
  )

  const validateAge = (dateStr: string): boolean | string => {
    if (!dateStr) return true // Let required rule handle this
    try {
      const birthDate = new Date(dateStr)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 16 ? true : 'Ph?i t? 16 tu?i tr? lên'
      }
      return age >= 16 ? true : 'Ph?i t? 16 tu?i tr? lên'
    } catch {
      return 'Ngày sinh không h?p l?'
    }
  }

  const validateCCCD = (value: string): boolean | string => {
    if (!value) return true // Let required rule handle this
    return /^\d{12}$/.test(value) ? true : 'CCCD ph?i có dúng 12 ch? s?'
  }

  const danTocOptions = useMemo(
    () => danToc.map((dt) => ({ value: String(dt.id_dan_toc), label: dt.ten })),
    [danToc]
  )

  const quocGiaOptions = useMemo(
    () => quocGia.map((dt) => ({ value: String(dt.id_quoc_gia), label: dt.ten })),
    [quocGia]
  )

  const tonGiaoOptions = useMemo(
    () => tonGiao.map((dt) => ({ value: String(dt.id_ton_giao), label: dt.ten })),
    [tonGiao]
  )

  const viTriOptions = useMemo(
    () =>
      viTriCongViec.map((dt) => ({
        value: String(dt.id_vi_tri_cong_viec),
        label: dt.ten_cong_viec
      })),
    [viTriCongViec]
  )

  const tinhOptions = useMemo(
    () => tinh.map((dt) => ({ value: String(dt.id), label: dt.name })),
    [tinh]
  )
  const phuongOptions = useMemo(
    () => phuongOptionsState.map((dt) => ({ value: String(dt.id), label: dt.name })),
    [phuongOptionsState]
  )

  // Auto compose hktt_dia_chi from labels of province + ward + house number
  const [hkttXaPhuong, hkttSoNha] = useWatch({
    control,
    name: ['hktt_id_xa_phuong', 'hktt_so_nha']
  }) as [string, string]

  // Only recompute full address after user changes province/ward/house number
  const lastAddressPartsRef = useRef({ tinh: hkttTinh, xa: hkttXaPhuong, soNha: hkttSoNha })

  useEffect(() => {
    const changed =
      lastAddressPartsRef.current.tinh !== hkttTinh ||
      lastAddressPartsRef.current.xa !== hkttXaPhuong ||
      lastAddressPartsRef.current.soNha !== hkttSoNha

    if (!changed) return

    const tinhLabel = tinhOptions.find((o) => String(o.value) === String(hkttTinh))?.label || ''
    const phuongLabel =
      phuongOptions.find((o) => String(o.value) === String(hkttXaPhuong))?.label || ''
    const soNha = hkttSoNha || ''
    const composed = [tinhLabel, phuongLabel, soNha].filter(Boolean).join(', ')
    setValue('hktt_dia_chi', composed)
    lastAddressPartsRef.current = { tinh: hkttTinh, xa: hkttXaPhuong, soNha: hkttSoNha }
  }, [hkttTinh, hkttXaPhuong, hkttSoNha, tinhOptions, phuongOptions, setValue])

  const loadPhuong = useCallback(
    async (provinceCode: string, clearSelectionAfterLoad = false) => {
      if (!provinceCode) {
        setPhuongOptionsState([])
        return
      }
      try {
        const wards = await mapQuanhuyenxaAxios(provinceCode)
        const normalized = wards.map((w) => ({ id: w.value, name: w.label })) as Phuong[]
        setPhuongOptionsState(normalized)
        if (clearSelectionAfterLoad) {
          setValue('hktt_id_xa_phuong', '')
        }
      } catch (error) {
        console.error('Error loading wards:', error)
        setPhuongOptionsState([])
        if (clearSelectionAfterLoad) {
          setValue('hktt_id_xa_phuong', '')
        }
      }
    },
    [setValue]
  )

  useEffect(() => {
    const isFirstLoad = prevHkttTinhRef.current === ''
    const provinceChanged = !isFirstLoad && !!hkttTinh && hkttTinh !== prevHkttTinhRef.current
    loadPhuong(hkttTinh, provinceChanged)
    prevHkttTinhRef.current = hkttTinh
  }, [hkttTinh, loadPhuong])

  return (
    <div className="space-y-6 pb-2.5">
      {!hideTitle && (
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Thông tin h? so nhân s?</h3>
          <p className="text-sm text-gray-600">Nh?p d?y d? thông tin cá nhân và h? so</p>
        </div>
      )}

      {/* Thông tin co b?n */}
      <Card shadow="none" className="p-4 mb-3 overflow-visible rounded-none" ref={cardRef}>
        <h4
          className="font-semibold text-gray-800 mb-4 pb-1 text-[17px]"
          style={{ fontFamily: "'Roboto', sans-serif" }}
        >
          Thông tin co b?n
        </h4>
        <div className={`grid gap-4 ${isWide ? 'grid-cols-4' : 'grid-cols-1'}`}>
          {/* Left - 3 columns for info */}
          <div className={`${isWide ? 'col-span-3' : ''} grid md:grid-cols-3 gap-4`}>
            <Controller
              name="ma_nhan_vien"
              rules={{
                required: 'Mã nhân s? là b?t bu?c'
              }}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <HrInput
                    label="Mã nhân s?"
                    value={field.value || ''}
                    onChange={field.onChange}
                    isRequired
                    // disabled
                    readOnly
                  />
                  {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                </div>
              )}
            />

            <Controller
              name="ho_va_ten"
              control={control}
              rules={{
                required: 'H? tên là b?t bu?c'
              }}
              render={({ field }) => (
                <div>
                  <HrInput
                    label="H? và tên"
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    isRequired
                  />
                  {/* {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>} */}
                </div>
              )}
            />

            <Controller
              name="gioi_tinh"
              control={control}
              render={({ field }) => (
                <div className="relative min-h-14 flex items-center px-3.5 border border-[#c4c4c4] rounded bg-white hover:border-blue-400 transition-colors duration-200 font-['Roboto',sans-serif]">
                  <span className="absolute top-0 -translate-y-1/2 left-2.5 bg-white px-1 z-10 text-xs text-[#666] font-medium leading-none pointer-events-none font-['Momo_Trust_Sans',sans-serif]">
                    Gi?i tính
                  </span>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="1"
                        checked={String(field.value) === '1'}
                        onChange={() => field.onChange('1')}
                        className="w-4 h-4 text-blue-600 border-gray-300 accent-blue-600"
                      />
                      <span className="text-base text-gray-900">Nam</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="2"
                        checked={String(field.value) === '2'}
                        onChange={() => field.onChange('2')}
                        className="w-4 h-4 text-blue-600 border-gray-300 accent-blue-600"
                      />
                      <span className="text-base text-gray-900">N?</span>
                    </label>
                  </div>
                </div>
              )}
            />

            <Controller
              name="ngay_sinh"
              control={control}
              rules={{
                required: 'Ngày sinh là b?t bu?c',
                validate: validateAge
              }}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <DateInputFloating
                    label="Nh?p ngày sinh"
                    isRequired
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                  {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                </div>
              )}
            />

            <Controller
              name="mst_ca_nhan"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Mã s? thu? cá nhân"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  endContent={
                    field.value ? (
                      <Tooltip content="Sao chép sang S? CCCD" placement="top">
                        <button
                          type="button"
                          className="p-1 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                          onClick={() => {
                            setValue('cccd_so', field.value || '', {
                              shouldDirty: true,
                              shouldValidate: true,
                              shouldTouch: true
                            })
                            toast({ title: 'Ðã sao chép sang S? CCCD', color: 'success' })
                          }}
                        >
                          <ArrowDownUp size={14} />
                        </button>
                      </Tooltip>
                    ) : undefined
                  }
                />
              )}
            />

            <Controller
              name="id_don_vi"
              control={control}
              rules={{
                required: 'Ðon v? công tác là b?t bu?c'
              }}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <SearchableSelect
                    label="Ðon v? công tác"
                    isRequired
                    options={donViOptions}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                  {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                </div>
              )}
            />

            <Controller
              name="id_vi_tri_cong_viec"
              control={control}
              rules={{
                required: 'Ch?c v? là b?t bu?c'
              }}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <SearchableSelect
                    label="Ch?c v?"
                    options={viTriOptions}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    isRequired
                  />
                  {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                </div>
              )}
            />

            <Controller
              name="id_dan_toc"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="Dân t?c"
                  options={danTocOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="id_ton_giao"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="Tôn giáo"
                  options={tonGiaoOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="id_quoc_tich"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="Qu?c t?ch"
                  options={quocGiaOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Right - 1 column for Avatar */}
          <Controller
            name="avatar"
            control={control}
            render={({ field }) => {
              const fileInputRef = React.useRef<HTMLInputElement>(null)

              const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0]
                if (file) {
                  onFileSelect(file)
                  onAvatarOpen()
                }
                e.target.value = ''
              }

              return (
                <div
                  className={`flex flex-col items-center gap-2 ${isWide ? 'col-span-1' : 'order-first'}`}
                >
                  <label className="text-sm font-medium text-gray-700">?nh d?i di?n</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="relative group w-40 h-40">
                    {field.value && !imgError ? (
                      <img
                        src={getAvatarUrl(field.value)}
                        alt="Avatar preview"
                        className="w-40 h-40 rounded-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-full border bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center p-2">
                        {imgError ? 'Không th? t?i ?nh' : 'Chua có ?nh'}
                      </div>
                    )}
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => field.onChange('')}
                        className="absolute cursor-pointer top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                        title="Xóa ?nh"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-1 right-1 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors cursor-pointer"
                      title="T?i ?nh lên"
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                </div>
              )
            }}
          />
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        {/* Can cu?c công dân */}
        <FormCollapse title="Can cu?c công dân (CCCD)">
          <div className="grid md:grid-cols-2 gap-4">
            <Controller
              name="cccd_so"
              control={control}
              rules={{
                required: 'CCCD là b?t bu?c',
                validate: validateCCCD
              }}
              render={({ field, fieldState: { error } }) => {
                const len = (field.value || '').length
                return (
                  <div>
                    <HrInput
                      label="S? CCCD"
                      isRequired
                      value={field.value || ''}
                      onChange={(val) => {
                        const digits = val.replace(/\D/g, '').slice(0, 12)
                        field.onChange(digits)
                      }}
                      onBlur={field.onBlur}
                      endContent={
                        <div className="flex items-center gap-1">
                          {field.value && (
                            <Tooltip content="Sao chép sang Mã s? thu?" placement="top">
                              <button
                                type="button"
                                className="p-1 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                onClick={() => {
                                  setValue('mst_ca_nhan', field.value || '', {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                    shouldTouch: true
                                  })
                                  toast({
                                    title: 'Ðã sao chép sang Mã s? thu?',
                                    color: 'success'
                                  })
                                }}
                              >
                                <ArrowDownUp size={14} />
                              </button>
                            </Tooltip>
                          )}
                          <span
                            className={`text-xs font-medium whitespace-nowrap ${len === 12 ? 'text-green-500' : 'text-gray-400'}`}
                          >
                            {len}/12
                          </span>
                        </div>
                      }
                    />
                    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                  </div>
                )
              }}
            />
            <Controller
              name="cccd_noi_cap"
              control={control}
              render={({ field }) => (
                <HrInput label="Noi c?p CCCD" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <Controller
              name="cccd_ngay_cap"
              control={control}
              render={({ field }) => (
                <DateInputFloating
                  label="Ngày c?p CCCD"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="cccd_ngay_het_han"
              control={control}
              render={({ field }) => (
                <DateInputFloating
                  label="Ngày h?t h?n CCCD"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </FormCollapse>

        {/* H? chi?u */}
        <FormCollapse title="H? chi?u (Passport)">
          <div className="grid md:grid-cols-2 gap-4">
            <Controller
              name="ho_chieu_so"
              control={control}
              render={({ field }) => (
                <HrInput label="S? Passport" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <Controller
              name="ho_chieu_noi_cap"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Noi c?p Passport"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="ho_chieu_ngay_cap"
              control={control}
              render={({ field }) => (
                <DateInputFloating
                  label="Ngày c?p Passport"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="ho_chieu_ngay_het_han"
              control={control}
              render={({ field }) => (
                <DateInputFloating
                  label="Ngày h?t h?n Passport"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </FormCollapse>

        {/* Ðon v? kiêm nhi?m */}
        <FormCollapse
          title={
            <div className="flex items-center gap-2.5">
              Ðon v? kiêm nhi?m
              {fields.length > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-blue-50 text-blue-600 h-5 flex items-center justify-center min-w-[20px]">
                  {fields.length}
                </span>
              )}
            </div>
          }
          headerRight={
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                append({ id_don_vi_cong_tac: '', id_vi_tri_cong_viec: '', la_lanh_dao: false })
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Thêm m?i
            </button>
          }
        >
          {fields.length > 0 ? (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end p-3 pr-10 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <Controller
                    name={`don_vi_kiem_nhiem.${index}.id_don_vi_cong_tac` as any}
                    control={control}
                    render={({ field: f }) => (
                      <SearchableSelect
                        label="Ðon v? công tác"
                        options={donViOptions}
                        value={f.value as string}
                        onChange={f.onChange}
                      />
                    )}
                  />
                  <Controller
                    name={`don_vi_kiem_nhiem.${index}.id_vi_tri_cong_viec` as any}
                    control={control}
                    render={({ field: f }) => (
                      <SearchableSelect
                        label="V? trí công vi?c"
                        options={viTriOptions}
                        value={f.value as string}
                        onChange={f.onChange}
                      />
                    )}
                  />
                  <Controller
                    name={`don_vi_kiem_nhiem.${index}.la_lanh_dao` as any}
                    control={control}
                    render={({ field: f }) => (
                      <div className="flex items-center h-12">
                        <Checkbox
                          size="sm"
                          isSelected={f.value === true}
                          onChange={(isSelected) => f.onChange(isSelected)}
                        >
                          <span className="text-sm whitespace-nowrap">Lãnh d?o</span>
                        </Checkbox>
                      </div>
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer z-10"
                    title="Xóa"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400 py-2">Chua có don v? kiêm nhi?m</div>
          )}
        </FormCollapse>

        {/* Trình d?/B?ng c?p */}
        <FormCollapse title="Trình d?/B?ng c?p">
          <div className="grid md:grid-cols-2 gap-4">
            <Controller
              name="trinh_do_vh"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Trình d? van hóa"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="hoc_ham"
              control={control}
              render={({ field }) => (
                <HrInput label="H?c hàm" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <Controller
              name="trinh_do_dt"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Trình d?/ H?c v?"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="noi_dt"
              control={control}
              render={({ field }) => (
                <HrInput label="Noi dào t?o" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <Controller
              name="nganh_dt"
              control={control}
              render={({ field }) => (
                <HrInput label="Chuyên ngành" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <Controller
              name="khoa_dt"
              control={control}
              render={({ field }) => (
                <HrInput label="Khóa" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <Controller
              name="nam_tn"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Nam t?t nghi?p"
                  type="number"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="xep_loai_tn"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="X?p lo?i t?t nghi?p"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </FormCollapse>

        {/* H? kh?u thu?ng trú */}
        <FormCollapse title="H? kh?u thu?ng trú">
          <div className="grid md:grid-cols-2 gap-4">
            <Controller
              name="hktt_id_quoc_gia"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="Qu?c gia"
                  options={quocGiaOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="hktt_id_tinh_tp"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="T?nh/Thành ph?"
                  options={tinhOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="hktt_id_xa_phuong"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <SearchableSelect
                    label="Phu?ng/Xã"
                    options={phuongOptions}
                    value={field.value}
                    onChange={field.onChange}
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
                <HrInput
                  label="S? nhà/Tên du?ng"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="hktt_so_ho_khau"
              control={control}
              render={({ field }) => (
                <HrInput label="S? h? kh?u" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <Controller
              name="hktt_ma_so_ho_gd"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Mã s? h? gia dình"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="hktt_dia_chi"
              control={control}
              render={({ field }) => (
                <div className="md:col-span-2">
                  <FloatingLabelTextarea
                    label="Ð?a ch? d?y d?"
                    value={field.value || ''}
                    onChange={field.onChange}
                    minRows={2}
                  />
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
                    Là ch? h?
                  </Checkbox>
                </div>
              )}
            />
          </div>
        </FormCollapse>
      </div>
    </div>
  )
}

export default Step1Basic
