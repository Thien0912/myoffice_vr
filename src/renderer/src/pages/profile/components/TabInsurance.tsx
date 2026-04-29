import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import type { NhansuFormData } from './AddNhansuButton'
import { HrAutocomplete, HrDateInput, HrInput, HrTextarea } from '@renderer/components/hero-custom'
import { FormCollapse } from './FormCollapse'
import { Shield } from 'lucide-react'

interface TabInsuranceProps {
  tinh: { id: string; name: string }[]
}

const TabInsurance: React.FC<TabInsuranceProps> = ({ tinh }) => {
  const { control } = useFormContext<NhansuFormData>()

  return (
    <FormCollapse title="Thông tin sổ bảo hiểm xã hội" defaultExpanded icon={<Shield size={18} />}>
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
  )
}

export default React.memo(TabInsurance)
