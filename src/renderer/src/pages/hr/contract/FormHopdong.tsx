import { useEffect, Dispatch, SetStateAction, useState } from 'react'
import { Input, Textarea, Checkbox } from '@heroui/react'
import { SelectFloatingLabel } from '@renderer/components/SelectFloatingLabel'
import FileUploadBox from './FileUploadBox'
import { ExistingFile } from '@renderer/shared/CommonInterface'
import { useQuery } from '@tanstack/react-query'
import { hopdongAxios } from '@renderer/api/hr/hopdongAxios'
import { useHopdongStore } from '@renderer/store/useProfileStore'
import {
  LOAI_HOP_DONG,
  HINH_THUC_LAM_VIEC,
  formatNumber,
  unformatNumber
} from '@renderer/api/danhmuc/hopDong'
import { callApi } from '@renderer/api/callApi'

type FormHopDongProps = {
  formData: Record<string, any>
  setFormData: Dispatch<SetStateAction<Record<string, any>>>
  onFilesChange?: (name: string, files: File[]) => void
  existingFiles?: ExistingFile[]
  isEditting?: boolean
}

export default function FormHopDong({
  formData,
  setFormData,
  onFilesChange,
  existingFiles = [],
  isEditting = false
}: FormHopDongProps) {
  const { filters } = useHopdongStore()
  const [localData, setLocalData] = useState(formData)

  const handleChange = async (name: string, value: any) => {
    setLocalData((prev) => ({ ...prev, [name]: value }))
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name == 'id_nhan_vien') {
      const employeeSelected = EmployeeList.nhan_vien.find((item) => item.id_nhan_vien == value)
      if (employeeSelected) {
        handleChange('ma_nhan_vien', employeeSelected.ma_nhan_vien)
        handleChange('id_don_vi_cong_tac', employeeSelected.id_don_vi_cong_tac)
        handleChange('id_vi_tri_cong_viec', employeeSelected.id_vi_tri_cong_viec)

        const hopDongCuoi = await hopdongAxios.hopdongcuoi(value)
        if (hopDongCuoi?.status == 200 && hopDongCuoi?.data?.length > 0) {
          // console.log('hopDongCuoi: ', hopDongCuoi)
          const { so_hop_dong, files_hop_dong, ...rest } = hopDongCuoi.data[0]

          setLocalData((prev) => ({ ...prev, ...rest }))
          setFormData((prev) => ({ ...prev, ...rest }))
        }
      }
    }

    if (name == 'loai_hop_dong') {
      const contractTypeSelected = loaiHopdongOptions.find((item) => item.value == value)
      contractTypeSelected ? handleChange('thoi_han_hop_dong', contractTypeSelected.time) : ''
    }

    if (name == 'ngay_bat_dau') {
      console.log('ngay_bat_dau: ', value)

      if (localData.loai_hop_dong) {
        const contractTypeSelected = loaiHopdongOptions.find(
          (item) => item.value == localData.loai_hop_dong
        )
        console.log('contractTypeSelected: ', contractTypeSelected)

        if (contractTypeSelected?.time && value) {
          const months = parseInt(contractTypeSelected.time)
          const [year, month, day] = value.split('-').map(Number)
          const result = new Date(year, month - 1 + months, day)
          result.setDate(result.getDate() - 1)
          const ngayKetThuc = result.toLocaleDateString('en-CA')
          handleChange('ngay_ket_thuc', ngayKetThuc)
        }
      }
    }
  }

  const {
    data: EmployeeList = [],
    isLoading: isLoadingEmployeeList,
    isFetching: isFetchingEmployeeList,
    refetch: hopdongRefetch
  } = useQuery({
    queryKey: ['hopdong', filters, length],
    queryFn: () => {
      const customDataApi = {
        getDSNhanVien: true,
        dataFilter: false
      }

      return hopdongAxios.fetch(customDataApi).then((response) => {
        return response.data || {}
      })
    }
  })

  // Loại hợp đồng
  const { data: loaiHopdongOptions = [], isLoading: isLoadingLoai } = useQuery({
    queryKey: ['loai-hopdong'],
    queryFn: () => Object.values(LOAI_HOP_DONG),
    staleTime: 5 * 60 * 1000 // cache 5 phút
  })

  // Loại hợp đồng
  const { data: hinhThucLamViecOptions = [], isLoading: isLoadingHinhThucLamViec } = useQuery({
    queryKey: ['hinh-thuc-lam_viec'],
    queryFn: () => Object.values(HINH_THUC_LAM_VIEC),
    staleTime: 5 * 60 * 1000 // cache 5 phút
  })

  useEffect(() => {
    // console.log('formData: ', formData)
    // const setHopDongCuoi = async (value) => {
    //   const hopDongCuoi = await hopdongAxios.hopdongcuoi(value)
    //   if (hopDongCuoi?.status == 200 && hopDongCuoi?.data?.length > 0) {
    //     const { so_hop_dong, files_hop_dong, ...rest } = hopDongCuoi.data[0]

    //     setFormData((prev) => ({ ...prev, ...rest }))
    //   }
    // }

    const setSoHopDongCuoi = async () => {
      const soHopDong = await callApi('admin/hrm/hopdong/sohopdong', {
        method: 'GET'
      })
      handleChange('so_hop_dong', soHopDong?.data || '')
    }

    // Lấy hợp đồng cuối khi thêm mới ở trang chi tiết hồ sơ
    // if (formData.id_nhan_vien && !isEditting) {
    //   setHopDongCuoi(formData.id_nhan_vien)
    // }

    setTimeout(() => {
      formData.so_hop_dong ? handleChange('so_hop_dong', formData.so_hop_dong) : setSoHopDongCuoi()

      formData.ten_hop_dong
        ? handleChange('ten_hop_dong', formData.ten_hop_dong)
        : handleChange('ten_hop_dong', 'Hợp đồng lao động')

      formData.ti_le_huong_luong
        ? handleChange('ti_le_huong_luong', formData.ti_le_huong_luong)
        : handleChange('ti_le_huong_luong', '100')

      formData.chuc_danh
        ? handleChange('chuc_danh', formData.chuc_danh)
        : handleChange('chuc_danh', 'Phó hiệu trưởng')

      formData.ngay_ky
        ? handleChange('ngay_ky', formData.ngay_ky)
        : handleChange('ngay_ky', new Date().toLocaleDateString('en-CA'))

      formData.nguoi_dai_dien_ky
        ? handleChange('nguoi_dai_dien_ky', formData.nguoi_dai_dien_ky)
        : handleChange('nguoi_dai_dien_ky', 'TS. Trần Hữu Xinh')
    }, 1000)
  }, [])

  return (
    <div className="ps-3 pe-0 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectFloatingLabel
          label="Họ và tên NLĐ"
          labelPlacement="outside"
          placeholder="Chọn họ và tên NLĐ"
          options={(EmployeeList.nhan_vien || []).map((item: any) => ({
            value: String(item.id_nhan_vien),
            label: item.ho_va_ten
          }))}
          value={localData.id_nhan_vien ? String(localData.id_nhan_vien) : ''}
          onChange={(val) => handleChange('id_nhan_vien', val)}
        />

        <Input
          label="Mã nhân viên"
          labelPlacement="outside"
          placeholder="Nhập mã nhân viên"
          value={localData.ma_nhan_vien || ''}
          onChange={(e) => handleChange('ma_nhan_vien', e.target.value)}
        />

        <SelectFloatingLabel
          label="Vị trí công việc"
          labelPlacement="outside"
          placeholder="Chọn vị trí công việc"
          options={(EmployeeList.cong_viec || []).map((item: any) => ({
            value: String(item.id_vi_tri_cong_viec),
            label: item.ten_cong_viec
          }))}
          value={localData.id_vi_tri_cong_viec ? String(localData.id_vi_tri_cong_viec) : ''}
          onChange={(val) => handleChange('id_vi_tri_cong_viec', val)}
        />

        <Input
          label="Số hợp đồng"
          labelPlacement="outside"
          placeholder="Nhập số hợp đồng"
          value={localData.so_hop_dong || ''}
          onChange={(e) => handleChange('so_hop_dong', e.target.value)}
        />

        <SelectFloatingLabel
          label="Đơn vị công tác"
          labelPlacement="outside"
          placeholder="Chọn đơn vị công tác"
          options={(EmployeeList.don_vi || []).map((item: any) => ({
            value: String(item.id_don_vi),
            label: item.ten_don_vi
          }))}
          value={localData.id_don_vi_cong_tac ? String(localData.id_don_vi_cong_tac) : ''}
          onChange={(val) => handleChange('id_don_vi_cong_tac', val)}
        />

        <Input
          type="date"
          label="Ngày ký"
          labelPlacement="outside"
          value={localData.ngay_ky || new Date().toLocaleDateString('en-CA')}
          onChange={(e) => handleChange('ngay_ky', e.target.value)}
        />

        <div className="md:col-span-2">
          <Input
            label="Tên hợp đồng"
            labelPlacement="outside"
            placeholder="Nhập tên hợp đồng"
            value={localData.ten_hop_dong || 'Hợp Đồng Lao Động'}
            onChange={(e) => handleChange('ten_hop_dong', e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Checkbox
            isSelected={!!localData.id_ty_le_bao_hiem}
            onValueChange={async (isSelected) => {
              if (isSelected) {
                handleChange('id_ty_le_bao_hiem', true)
                const res = await hopdongAxios.tylebaohiem()
                if (res?.data?.id_ty_le_bao_hiem) {
                  handleChange('id_ty_le_bao_hiem', res.data.id_ty_le_bao_hiem)
                }
              } else {
                handleChange('id_ty_le_bao_hiem', null)
              }
            }}
          >
            Đóng bảo hiểm
          </Checkbox>
        </div>

        <Input
          label="Mức lương"
          labelPlacement="outside"
          placeholder="0"
          value={formatNumber(localData.muc_luong?.toString() || '')}
          onChange={(e) => {
            const cleaned = unformatNumber(e.target.value)
            handleChange('muc_luong', cleaned)
          }}
        />

        <SelectFloatingLabel
          label="Loại hợp đồng"
          labelPlacement="outside"
          placeholder="Chọn loại hợp đồng"
          options={loaiHopdongOptions || []}
          value={localData.loai_hop_dong ? String(localData.loai_hop_dong) : ''}
          onChange={(val) => handleChange('loai_hop_dong', val)}
        />

        <Input
          label="Lương cơ bản"
          labelPlacement="outside"
          placeholder="0"
          value={formatNumber(localData.luong_co_ban?.toString() || '')}
          onChange={(e) => {
            const cleaned = unformatNumber(e.target.value)
            handleChange('luong_co_ban', cleaned)
          }}
        />

        <Input
          label="Thời hạn hợp đồng"
          labelPlacement="outside"
          placeholder="Nhập thời hạn (tháng)"
          value={localData.thoi_han_hop_dong || ''}
          onChange={(e) => handleChange('thoi_han_hop_dong', e.target.value)}
        />

        <Input
          label="Lương đóng BH"
          labelPlacement="outside"
          placeholder="0"
          value={formatNumber(localData.muc_luong_bao_hiem?.toString() || '')}
          onChange={(e) => {
            const cleaned = unformatNumber(e.target.value)
            handleChange('muc_luong_bao_hiem', cleaned)
          }}
        />

        <SelectFloatingLabel
          label="Hình thức làm việc"
          labelPlacement="outside"
          placeholder="Chọn hình thức làm việc"
          options={hinhThucLamViecOptions || []}
          value={localData.hinh_thuc_lam_viec ? String(localData.hinh_thuc_lam_viec) : ''}
          onChange={(val) => handleChange('hinh_thuc_lam_viec', val)}
        />

        <Input
          label="Tỉ lệ hưởng lương"
          labelPlacement="outside"
          placeholder="100%"
          value={localData.ti_le_huong_luong || '100'}
          onChange={(e) => handleChange('ti_le_huong_luong', e.target.value)}
        />

        <Input
          type="date"
          label="Ngày có hiệu lực"
          labelPlacement="outside"
          value={localData.ngay_bat_dau || ''}
          onChange={(e) => handleChange('ngay_bat_dau', e.target.value)}
        />

        <SelectFloatingLabel
          label="Người đại diện ký"
          labelPlacement="outside"
          placeholder="Chọn người đại diện ký"
          options={[
            { value: 'TS. Trần Hữu Xinh', label: 'TS. Trần Hữu Xinh' },
            ...(localData.nguoi_dai_dien_ky && localData.nguoi_dai_dien_ky !== 'TS. Trần Hữu Xinh' 
              ? [{ value: localData.nguoi_dai_dien_ky, label: localData.nguoi_dai_dien_ky }]
              : [])
          ]}
          value={localData.nguoi_dai_dien_ky || 'TS. Trần Hữu Xinh'}
          onChange={(val) => handleChange('nguoi_dai_dien_ky', val)}
        />

        <Input
          type="date"
          label="Ngày hết hạn"
          labelPlacement="outside"
          value={localData.ngay_ket_thuc || ''}
          onChange={(e) => handleChange('ngay_ket_thuc', e.target.value)}
        />

        <Input
          label="Chức danh"
          labelPlacement="outside"
          placeholder="Ví dụ: Phó hiệu trưởng"
          value={localData.chuc_danh || 'Phó hiệu trưởng'}
          onChange={(e) => handleChange('chuc_danh', e.target.value)}
        />

        <div className="md:col-span-2 mt-2">
          <Textarea
            label="Trích yếu"
            labelPlacement="outside"
            placeholder="Nhập trích yếu hợp đồng"
            minRows={3}
            value={localData.trich_yeu || ''}
            onChange={(e) => handleChange('trich_yeu', e.target.value)}
          />
        </div>

        <div className="md:col-span-2 mt-2">
          <Textarea
            label="Ghi chú"
            labelPlacement="outside"
            placeholder="Nhập ghi chú"
            minRows={2}
            value={localData.ghi_chu || ''}
            onChange={(e) => handleChange('ghi_chu', e.target.value)}
          />
        </div>

        <div className="md:col-span-2 mt-2">
          <FileUploadBox
            name="files_hop_dong[]"
            label="File hợp đồng"
            onFilesChange={onFilesChange}
            existingFiles={existingFiles}
          />
        </div>
      </div>
    </div>
  )
}
