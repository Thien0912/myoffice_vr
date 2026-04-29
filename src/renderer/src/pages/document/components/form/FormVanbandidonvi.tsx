import { Tabs } from '@heroui-v3/react'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import DateInputFloatingLabel from '@renderer/components/DateInputFloatingLabel'
import InputFloatingEndLabel from '@renderer/components/InputFloatingEndLabel'
import { SelectDropdown, SelectGroup, SelectOption } from '@renderer/components/SelectDropdown'

import { TextareaFloatingLabel } from '@renderer/components/TextareaFloatingLabel'
import { TextWrap } from 'lucide-react'
import FileUploadBox from './FileUploadBox'
import TabContentBanhanhDonVi from './TabContentBanhanhDonVi'
import RecipientInput from '@renderer/components/RecipientInput'
import { useEffect, useRef, useState } from 'react'
import { callApi } from '@renderer/api/callApi'
import { LoaiVanBan, BaoMat, TinhChat, NguoiDung, HinhThuc } from '@renderer/shared/CommonInterface'
import { useVanbandiStore } from '@renderer/store/useVanbanStore'
import { ExistingFile } from '@renderer/shared/CommonInterface'
import { vanbandidonviAxios } from '@renderer/api/documents/vanbandidonviAxios'

type FormVanbandiProps = {
  formData: Record<string, any>
  setFormData: (data: Record<string, any>) => void
  onFilesChange?: (name: string, files: File[]) => void
  existingFiles?: ExistingFile[]
  existingFilesInternal?: ExistingFile[]
  fileGroups?: Record<string, File[]>
}

type CoQuan = {
  id_co_quan: string
  ten_co_quan: string
}

export default function FormVanbandidonvi({
  formData,
  setFormData,
  onFilesChange,
  existingFiles = [],
  existingFilesInternal = [],
  fileGroups
}: FormVanbandiProps) {
  const [allUnit, setAllUnit] = useState<any[]>([])
  const [donviOptions, setDonviOptions] = useState<(SelectOption | SelectGroup)[]>([])
  const [coQuan, setCoQuan] = useState<CoQuan[]>([])
  const [loaiVanBan, setLoaiVanBan] = useState<LoaiVanBan[]>([])
  const { filters } = useVanbandiStore()
  const [baoMat, setBaoMat] = useState<BaoMat[]>([])
  const [tinhChat, setTinhChat] = useState<TinhChat[]>([])
  const [hinhThuc, setHinhThuc] = useState<HinhThuc[]>([])
  const [nguoiDung, setNguoiDung] = useState<NguoiDung[]>([])
  const [, setLanhDao] = useState<NguoiDung[]>([])
  const idDonViNguoiDung = JSON.parse(String(localStorage.getItem('auth'))).state.user.id_don_vi

  const [localFormData, setLocalFormData] = useState(formData || {})
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const [selectedTab, setSelectedTab] = useState<string | number>('thongtin')

  // Sync prop -> local state
  useEffect(() => {
    setLocalFormData(formData || {})
  }, [formData])

  const LOAI_LABEL_MAP = {
    LANH_DAO: 'Lãnh đạo',
    PHONG: 'Phòng',
    KHOA_BOMON: 'Khoa/Bộ môn',
    BAN: 'Ban',
    VIEN: 'Viện',
    TRUNG_TAM: 'Trung tâm',
    DON_VI_KHAC: 'Đơn vị khác'
  }

  const mapDonViGroupedOptions = (data: any[] = []) => {
    const grouped: Record<string, { label: string; options: { value: string; label: string }[] }> =
      {}

    data.forEach((item) => {
      const loai = item.loai as keyof typeof LOAI_LABEL_MAP
      const groupLabel = LOAI_LABEL_MAP[loai] || loai

      if (!grouped[loai]) {
        grouped[loai] = {
          label: groupLabel,
          options: []
        }
      }

      grouped[loai].options.push({
        value: item.id_don_vi,
        label: item.ten_don_vi
      })
    })

    // sort tên đơn vị cho đẹp
    Object.values(grouped).forEach((group) => {
      group.options.sort((a, b) => a.label.localeCompare(b.label, 'vi'))
    })

    return Object.values(grouped)
  }

  const getDonVi = async () => {
    vanbandidonviAxios
      .fetch({
        action: 'get_category_data',
        table: 'e_don_vi',
        // fieldName: '',
        // fieldValue: '',
        length: 9999
        // orderBy: ''
      })
      .then((response) => {
        // console.log("response DV: ", response)
        const data = response?.data?.data || response?.data || []
        setAllUnit(data)

        // data đã custom để dùng cho Select
        const groupedOptions = mapDonViGroupedOptions(data)
        setDonviOptions(groupedOptions)
      })
  }

  const getCoQuan = async () => {
    vanbandidonviAxios
      .fetch({
        action: 'get_category_data',
        table: 'e_co_quan',
        // fieldName: '',
        // fieldValue: '',
        length: 9999
        // orderBy: ''
      })
      .then((response) => {
        setCoQuan(response?.data || [])
      })
  }

  const getLoaiVanBan = async () => {
    vanbandidonviAxios
      .fetch({
        action: 'get_category_data',
        table: 'e_loai',
        theo_phong_ban: true,
        id_don_vi_nguoi_dung: idDonViNguoiDung
      })
      .then((response) => {
        setLoaiVanBan(response?.data || [])
      })
  }

  const getBaoMat = async () => {
    vanbandidonviAxios
      .fetch({
        action: 'get_category_data',
        table: 'e_bao_mat',
        // fieldName: '',
        // fieldValue: '',
        length: 9999
        // orderBy: ''
      })
      .then((response) => {
        setBaoMat(response?.data || [])
      })
  }

  const getTinhChat = async () => {
    vanbandidonviAxios
      .fetch({
        action: 'get_category_data',
        table: 'e_tinh_chat',
        // fieldName: '',
        // fieldValue: '',
        length: 9999
        // orderBy: ''
      })
      .then((response) => {
        setTinhChat(response?.data || [])
      })
  }

  const getHinhThuc = async () => {
    vanbandidonviAxios
      .fetch({
        action: 'get_category_data',
        table: 'e_hinh_thuc',
        // fieldName: '',
        // fieldValue: '',
        length: 9999
        // orderBy: ''
      })
      .then((response) => {
        setHinhThuc(response?.data || [])
      })
  }

  const getNguoiDung = async () => {
    vanbandidonviAxios
      .fetch({
        action: 'get_category_data',
        table: 'ql_nguoi_dung',
        // fieldName: '',
        // fieldValue: '',
        length: 9999
        // orderBy: ''
      })
      .then((res) => {
        const data = res?.data || []
        setNguoiDung(data)

        const canbo = data
        const lanhdao = canbo.filter(
          (value) => value.ql_nguoi_dung_la_lanh_dao == 1 && value.do_uu_tien_lanh_dao
        )

        lanhdao.forEach((ld) => {
          res.hoc_ham_hoc_vi.some((hhhv) => {
            if (
              (ld.trinh_do_dt || '').trim().toLowerCase() ==
              (hhhv.ten_day_du || '').trim().toLowerCase()
            ) {
              ld.hoc_ham_vi = hhhv.ten_viet_tat
              return true // Add return value
            } else {
              ld.hoc_ham_vi = ''
            }
            return false
          })
        })

        lanhdao.sort((a, b) => (a.do_uu_tien_lanh_dao ?? 0) - (b.do_uu_tien_lanh_dao ?? 0))

        setLanhDao(lanhdao)
      })
  }

  useEffect(() => {
    getDonVi()
    getLoaiVanBan()
    getBaoMat()
    getTinhChat()
    getNguoiDung()
    getHinhThuc()
    getCoQuan()

    setFormData({
      ...formData,
      ngay_ky: formData.ngay_ky || new Date().toLocaleDateString('en-CA'),
      noi_luu_tru: formData.noi_luu_tru || 'Phòng Tổ chức - Hành chính'
    })
  }, [])

  useEffect(() => {
    if (allUnit.length > 0) {
      handleChange('id_don_vi', formData.id_don_vi || String(idDonViNguoiDung))
      handleChange('id_don_vi_soan', formData.id_don_vi_soan || String(idDonViNguoiDung))
    }
  }, [allUnit])

  useEffect(() => {
    if (baoMat.length > 0) {
      handleChange('id_bao_mat', formData.id_bao_mat || String(baoMat[0].id_bao_mat))
    }

    if (tinhChat.length > 0) {
      handleChange('id_tinh_chat', formData.id_tinh_chat || String(tinhChat[0].id_tinh_chat))
    }
  }, [baoMat, tinhChat])

  const tabContentBanhanhArr = ['ids_don_vi_xu_ly', 'ids_ql_nguoi_dung', 'ids_co_quan']

  const pendingUpdates = useRef<Record<string, any>>({})

  const handleChange = (name: string, value: any, immediate = false) => {
    if (tabContentBanhanhArr.includes(name) && Array.isArray(value)) {
      value = value
        .map((item: any) => item?.uuid)
        .filter(Boolean)
        .join(',')
    }

    setLocalFormData((prev) => ({ ...prev, [name]: value }))
    pendingUpdates.current[name] = value

    if (immediate) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      const updates = { ...pendingUpdates.current }
      pendingUpdates.current = {}
      setFormData((prevParent) => ({ ...prevParent, ...updates }))
    } else {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        const updates = { ...pendingUpdates.current }
        pendingUpdates.current = {}
        setFormData((prevParent) => ({ ...prevParent, ...updates }))
      }, 300)
    }

    // Nếu là id_loai thì lấy số hiệu văn bản
    if (name === 'id_loai') {
      const getSoHieuVanBan = async () => {
        const res = await callApi('admin/vanban/vanbandidonvi', {
          method: 'GET',
          data: {
            id_loai_selected: value,
            current_year_vbdi: String(filters.dateRange?.fromDate).split('-')[0] || '',
            dataFilter: false
          },
          headers: {},
          timeout: 30000,
          throwException: false,
          debug: false
        })
        setFormData((prev) => ({
          ...prev,
          id_loai: value,
          so_hieu_van_ban: res.data || '',
          nguoi_ky: res.nguoi_ky ? res.nguoi_ky : ''
        }))
      }
      getSoHieuVanBan()
    }
  }

  return (
    <div>
      <Tabs selectedKey={selectedTab} onSelectionChange={setSelectedTab} className="w-full">
        <Tabs.ListContainer className="w-fit">
          <Tabs.List aria-label="Form tabs" className="whitespace-nowrap">
            <Tabs.Tab id="thongtin">
              <Tabs.Separator />
              <Tabs.Indicator />
              Thông tin chính
            </Tabs.Tab>
            <Tabs.Tab id="banhanh" className="whitespace-nowrap">
              <Tabs.Separator />
              <Tabs.Indicator />
              Ban hành <span className="text-red-500 ml-1">*</span>
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="thongtin">
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-x-4 gap-y-5 text-sm mt-2">
            {/* <div className="col-span-12"><h4 className="mb-1 font-bold">1. Thông tin chung</h4></div> */}
            <div className="md:col-span-6 lg:col-span-12">
              <RecipientInput
                label="Đến"
                formData={localFormData}
                allUsers={nguoiDung}
                value={String(localFormData.ids_ql_nguoi_dung ?? '')}
                onChange={(field, val) => {
                  handleChange(field, val, true)
                }}
              />
            </div>

            <div className="md:col-span-6 lg:col-span-6">
              <SelectDropdown
                label="Loại văn bản"
                name="id_loai"
                isRequired
                // defaultValue={String(loaiVanBan[0]?.id_loai || '')}
                value={String(localFormData.id_loai || '')}
                onChange={(val) => handleChange('id_loai', val, true)}
                options={(loaiVanBan || []).map((m) => ({
                  value: String(m.id_loai),
                  label: m.ten_loai
                }))}
              />
            </div>
            <div className="md:col-span-6 lg:col-span-6">
              <InputFloatingEndLabel
                label="Số hiệu văn bản"
                name="so_hieu_van_ban"
                isRequired
                value={String(localFormData.so_hieu_van_ban || '')}
                onChange={(val) => handleChange('so_hieu_van_ban', val)}
                endIcon={<TextWrap size={16} />}
                endAriaLabel="Sao chép xuống trích yếu"
                endTooltip="Sao chép số hiệu xuống trích yếu"
                onEndIconClick={() => {
                  const current = localFormData.trich_yeu || ''
                  const soHieu = localFormData.so_hieu_van_ban || ''
                  if (soHieu && !String(current).includes(soHieu)) {
                    handleChange('trich_yeu', `${soHieu} | ${current}`)
                  }
                }}
              />
            </div>
            {/* Row 2 */}
            <div className="md:col-span-6 lg:col-span-12">
              <TextareaFloatingLabel
                label="Trích yếu"
                name="trich_yeu"
                rows={3}
                isRequired
                value={String(localFormData.trich_yeu || '')}
                onChange={(val) => handleChange('trich_yeu', val)}
              />
            </div>
            {/* Row 3 */}
            <div className="md:col-span-6 lg:col-span-4">
              <InputFloatingEndLabel
                label="Người ký"
                name="nguoi_ky"
                isRequired
                value={String(localFormData.nguoi_ky || '')}
                onChange={(val) => handleChange('nguoi_ky', val)}
                // endIcon={<ChevronDown size={16} />}
                // endAriaLabel="Chọn lãnh đạo ký"
                // endTooltip="Chọn lãnh đạo ký"
                // dropdownItems={lanhDao.map((ld) => ({
                //   key: String(
                //     (ld as any).user_id ??
                //       (ld as any).id ??
                //       (ld as any).uuid ??
                //       'nguoi_' + Math.random()
                //   ),
                //   label:
                //     `${(ld as any).hoc_ham_vi || ''} ${(ld as any).ql_nguoi_dung_ho_ten || (ld as any).name || ''}`.trim(),
                //   value:
                //     `${(ld as any).hoc_ham_vi || ''} ${(ld as any).ql_nguoi_dung_ho_ten || (ld as any).name || ''}`.trim()
                // }))}
                // onDropdownSelect={(item) => handleChange('nguoi_ky', item.value || item.label)}
              />
            </div>
            <div className="md:col-span-6 lg:col-span-4">
              <DateInputFloatingLabel
                label="Ngày ký"
                name="ngay_ky"
                isRequired
                value={String(localFormData.ngay_ky || '')}
                onChange={(val) => handleChange('ngay_ky', val)}
              />
            </div>
            <div className="md:col-span-6 lg:col-span-4">
              <InputFloatingLabel
                label="Trả lời CV số"
                name="tra_loi_cv_den"
                value={String(localFormData.tra_loi_cv_den || '')}
                onChange={(val) => handleChange('tra_loi_cv_den', val)}
              />
            </div>
            <div className="md:col-span-6 lg:col-span-4">
              <SelectDropdown
                label="Đơn vị soạn"
                name="id_don_vi_soan"
                isRequired
                value={String(localFormData.id_don_vi_soan || '')}
                onChange={(val) => handleChange('id_don_vi_soan', val, true)}
                options={donviOptions}
              />
            </div>
            <div className="md:col-span-6 lg:col-span-4">
              <DateInputFloatingLabel
                label="Ngày trả lời"
                name="ngay_tra_loi_cv_den"
                value={String(localFormData.ngay_tra_loi_cv_den || '')}
                onChange={(val) => handleChange('ngay_tra_loi_cv_den', val)}
              />
            </div>
            <div className="md:col-span-6 lg:col-span-4">
              <InputFloatingLabel
                label="Cán bộ soạn"
                name="nguoi_soan_vb_di"
                value={String(localFormData.nguoi_soan_vb_di || '')}
                onChange={(val) => handleChange('nguoi_soan_vb_di', val)}
              />
            </div>
            {/* <div className="md:col-span-6 lg:col-span-4"></div> */}
            <div className="md:col-span-6 lg:col-span-4">
              <SelectDropdown
                label="Hồ sơ đơn vị"
                name="id_don_vi"
                isRequired
                value={String(localFormData.id_don_vi || '')}
                onChange={(val) => handleChange('id_don_vi', val, true)}
                options={donviOptions}
              />
            </div>
            <div className="md:col-span-6 lg:col-span-4">
              <InputFloatingLabel
                label="Nơi lưu trữ"
                name="noi_luu_tru"
                value={String(localFormData.noi_luu_tru || '')}
                onChange={(val) => handleChange('noi_luu_tru', val)}
              />
            </div>
            <div className="md:col-span-3 lg:col-span-4">
              <InputFloatingLabel
                label="Lĩnh vực"
                name="linh_vuc"
                value={String(localFormData.linh_vuc || '')}
                onChange={(val) => handleChange('linh_vuc', val)}
              />
            </div>
            {/* <div className="md:col-span-6 lg:col-span-4"></div> */}
            <div className="md:col-span-4">
              <SelectDropdown
                label="Mức độ tính chất"
                name="id_tinh_chat"
                isRequired
                value={String(localFormData.id_tinh_chat || '')}
                onChange={(val) => handleChange('id_tinh_chat', val, true)}
                options={(tinhChat || []).map((item) => ({
                  value: String(item.id_tinh_chat),
                  label: item.ten_tinh_chat
                }))}
              />
            </div>
            <div className="md:col-span-4">
              <SelectDropdown
                label="Mức độ bảo mật"
                name="id_bao_mat"
                isRequired
                value={String(localFormData.id_bao_mat || '')}
                onChange={(val) => handleChange('id_bao_mat', val, true)}
                options={(baoMat || []).map((item) => ({
                  value: String(item.id_bao_mat),
                  label: item.ten_bao_mat
                }))}
              />
            </div>
            <div className="md:col-span-6 lg:col-span-4">
              <SelectDropdown
                label="Hình thức gửi"
                name="ids_hinh_thuc"
                isRequired
                multiple={true}
                value={
                  localFormData.ids_hinh_thuc ? String(localFormData.ids_hinh_thuc).split(',') : []
                }
                onChange={(vals: any) => {
                  console.log('➡️ Giá trị trả về từ SelectDropdown:', vals)
                  const valuesArray =
                    vals instanceof Set
                      ? Array.from(vals)
                      : Array.isArray(vals)
                        ? vals
                        : typeof vals === 'string'
                          ? [vals]
                          : []

                  handleChange('ids_hinh_thuc', valuesArray.join(','), true)
                }}
                options={(hinhThuc || []).map((item) => ({
                  value: String(item.id_hinh_thuc),
                  label: item.ten_hinh_thuc
                }))}
              />
            </div>
            <div className="md:col-span-6 lg:col-span-6">
              <FileUploadBox
                name="file_ban_hanh[]"
                label="File ban hành"
                onFilesChange={onFilesChange}
                existingFiles={existingFiles}
                currentFiles={fileGroups ? fileGroups['file_ban_hanh[]'] : undefined}
              />
            </div>
            <div className="md:col-span-6 lg:col-span-6">
              <FileUploadBox
                name="file_noi_bo[]"
                label="File nội bộ"
                onFilesChange={onFilesChange}
                existingFiles={existingFilesInternal}
                currentFiles={fileGroups ? fileGroups['file_noi_bo[]'] : undefined}
              />
            </div>
          </div>
        </Tabs.Panel>

        <Tabs.Panel id="banhanh">
          <TabContentBanhanhDonVi
            formData={localFormData}
            onUnitChange={(units) => handleChange('ids_don_vi_xu_ly', units)}
            onUsersChange={(users) => handleChange('ids_ql_nguoi_dung', users)}
            onAgencyChange={(agencies) => handleChange('ids_co_quan', agencies)}
            allUnit={allUnit}
            allUsers={nguoiDung}
            allAgency={coQuan}
          />
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
