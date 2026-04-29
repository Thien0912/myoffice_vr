import { toast } from "@heroui-v3/react"
import { Button, Checkbox } from '@heroui/react'
import { khoaDaoTaoAxios } from '@renderer/api/danhmuc/khoaDaoTaoAxios'
import { DataGrid, DataGridColumn } from '@renderer/components/DataGrid'
import { HrFormFieldSelect, HrFormFieldDate, HrFormField, HrFormFieldTextarea } from '@renderer/components/hero-custom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'

type FormQuatrinhdaotaoProps = {
  formData: Record<string, any>
  setFormData: Dispatch<SetStateAction<Record<string, any>>>
  allUser?: any[]
}

export default function FormQuatrinhdaotao({
  formData,
  setFormData,
  allUser
}: FormQuatrinhdaotaoProps) {
  const [courseOptions, setCourseOptions] = useState<{ value: string; label: string }[]>([])
  const [coursesList, setCoursesList] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState<string>('select')
  const [isCreating, setIsCreating] = useState(false)

  const [newCourse, setNewCourse] = useState({
    ten_khoa_hoc: '',
    noi_dung: '',
    ngay_bat_dau: '',
    ngay_ket_thuc: '',
    trang_thai: 'Dang_dien_ra'
  })

  const gridColumns: DataGridColumn[] = useMemo(
    () => [
      { key: 'ten_khoa_hoc', header: 'Tên khóa học', flex: 2 },
      { key: 'ngay_bat_dau', header: 'Ngày bắt đầu', flex: 1 },
      { key: 'ngay_ket_thuc', header: 'Ngày kết thúc', flex: 1 }
    ],
    []
  )

  const renderCell = (row: any, col: DataGridColumn) => {
    switch (col.key) {
      case 'ten_khoa_hoc': {
        const map: Record<string, string> = {
          Dang_dien_ra: 'Đang diễn ra',
          Hoan_thanh: 'Hoàn thành',
          Chua_dien_ra: 'Chưa diễn ra',
          Huy_bo: 'Hủy bỏ'
        }
        const statusLabel = map[row.trang_thai] || row.trang_thai

        let badgeClass = 'bg-gray-100 text-gray-500'
        if (row.trang_thai === 'Dang_dien_ra') badgeClass = 'bg-blue-100 text-blue-600'
        else if (row.trang_thai === 'Hoan_thanh') badgeClass = 'bg-green-100 text-green-600'
        else if (row.trang_thai === 'Huy_bo') badgeClass = 'bg-red-100 text-red-600'
        else if (row.trang_thai === 'Chua_dien_ra') badgeClass = 'bg-yellow-100 text-yellow-600'

        return (
          <div className="flex flex-col items-start py-1 gap-1 ms-1">
            <span className="font-medium text-[13.5px] text-gray-800 text-wrap">{row.ten_khoa_hoc}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${badgeClass}`}>
              {statusLabel}
            </span>
          </div>
        )
      }
      case 'ngay_bat_dau':
        return <span className="text-[13px] text-gray-600">{row.ngay_bat_dau ? new Date(row.ngay_bat_dau).toLocaleDateString('vi-VN') : ''}</span>
      case 'ngay_ket_thuc':
        return <span className="text-[13px] text-gray-600">{row.ngay_ket_thuc ? new Date(row.ngay_ket_thuc).toLocaleDateString('vi-VN') : ''}</span>
      default:
        return null
    }
  }

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewCourseChange = (name: string, value: any) => {
    setNewCourse((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    const fetchData = async () => {
      const res = await khoaDaoTaoAxios.fetch({ length: 9999 })

      if (res?.success && Array.isArray(res.data)) {
        const options = res.data.map((item: any) => ({
          value: item.id_dao_tao,
          label: item.ten_khoa_hoc
        }))
        setCourseOptions(options)
        setCoursesList(res.data)
      } else if (res?.data && Array.isArray(res.data.data)) {
        const options = res.data.data.map((item: any) => ({
          value: item.id_dao_tao,
          label: item.ten_khoa_hoc
        }))
        setCourseOptions(options)
        setCoursesList(res.data.data)
      }
    }
    fetchData()
  }, [])

  const handleCreateCourse = async () => {
    if (!newCourse.ten_khoa_hoc) {
      toast('Vui lòng nhập tên khóa học', { variant: 'warning' })
      return
    }

    setIsCreating(true)
    try {
      const res = await khoaDaoTaoAxios.create(newCourse)
      if (res.status === 201 && res.success) {
        const createdCourse = res.data
        const newOption = {
          value: String(createdCourse.id_dao_tao),
          label: createdCourse.ten_khoa_hoc
        }
        setCourseOptions((prev) => [...prev, newOption])
        setCoursesList((prev) => [createdCourse, ...prev])

        setFormData((prev) => ({ ...prev, id_dao_tao: String(createdCourse.id_dao_tao) }))

        setSelectedTab('select')

        toast('Thêm khóa đào tạo thành công', { variant: 'success' })

        setNewCourse({
          ten_khoa_hoc: '',
          noi_dung: '',
          ngay_bat_dau: '',
          ngay_ket_thuc: '',
          trang_thai: 'Dang_dien_ra'
        })
      } else {
        toast(res.message || 'Lỗi thêm khóa đào tạo', { variant: 'danger' })
      }
    } catch (error) {
      console.error(error)
      toast('Có lỗi xảy ra', { variant: 'danger' })
    } finally {
      setIsCreating(false)
    }
  }

  const [isCollapseOpen, setIsCollapseOpen] = useState(false)
  const [userSearch, setUserSearch] = useState('')

  const displayedUsers = useMemo(() => {
    let list = allUser || []

    if (userSearch) {
      const lower = userSearch.toLowerCase()
      list = list.filter((u) => (u.ho_ten || u.ho_va_ten || '').toLowerCase().includes(lower))
    }
    return list.slice(0, 100)
  }, [allUser, userSearch])

  const handleUserSelection = (isSelected: boolean, userId: string) => {
    const currentStr = (formData.ids_nhan_vien as string) || ''
    let currentIds = currentStr ? currentStr.split(',') : []
    currentIds = Array.from(new Set(currentIds)).filter((id) => id)

    if (isSelected) {
      if (!currentIds.includes(userId)) currentIds.push(userId)
    } else if (formData.id_nhan_vien_hien_tai != userId) {
      currentIds = currentIds.filter((id) => id !== userId)
    }

    const newStr = currentIds.join(',')
    setFormData((prev) => ({ ...prev, ids_nhan_vien: newStr }))
  }

  const toggleSelectAll = () => {
    const currentStr = (formData.ids_nhan_vien as string) || ''
    let currentIds = currentStr ? currentStr.split(',') : []
    currentIds = currentIds.filter((id) => id)

    const visibleIds = displayedUsers.map((u) => String(u.id_nhan_vien))
    const allVisibleSelected = visibleIds.every((id) => currentIds.includes(id))

    if (allVisibleSelected) {
      currentIds = currentIds.filter((id) => !visibleIds.includes(id))
    } else {
      const uniqueSet = new Set([...currentIds, ...visibleIds])
      currentIds = Array.from(uniqueSet)
    }

    const newStr = currentIds.join(',')
    setFormData((prev) => ({ ...prev, ids_nhan_vien: newStr }))
  }

  return (
    <div className="py-2">
      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={selectedTab === 'select' ? 'solid' : 'light'}
          color={selectedTab === 'select' ? 'primary' : 'default'}
          onPress={() => setSelectedTab('select')}
        >
          Chọn khóa đào tạo
        </Button>
        <Button
          size="sm"
          variant={selectedTab === 'create' ? 'solid' : 'light'}
          color={selectedTab === 'create' ? 'primary' : 'default'}
          onPress={() => setSelectedTab('create')}
        >
          Thêm khóa đào tạo mới
        </Button>
      </div>

      {selectedTab === 'select' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <HrFormFieldSelect
                fieldLabel="Chọn khóa đào tạo"
                name="id_dao_tao"
                value={formData.id_dao_tao || ''}
                options={courseOptions}
                onChange={(val) => handleChange('id_dao_tao', val as string)}
              />
            </div>

            <div className="md:col-span-2">
              <HrFormFieldSelect
                fieldLabel="Kết quả"
                name="ket_qua"
                value={formData.ket_qua || ''}
                options={[
                  { value: 'Chua_hoan_thanh', label: 'Chưa hoàn thành' },
                  { value: 'Hoan_thanh', label: 'Hoàn thành' }
                ]}
                onChange={(val) => handleChange('ket_qua', val as string)}
              />
            </div>
          </div>

          {selectedTab === 'select' && !formData.is_edit && (
            <div className="mt-4 border-t pt-2">
              <Button
                variant="light"
                color="primary"
                onPress={() => setIsCollapseOpen(!isCollapseOpen)}
                startContent={isCollapseOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                className="w-full justify-between"
              >
                Thêm cho các cá nhân khác
              </Button>

              {isCollapseOpen && (
                <div className="mt-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <HrFormField
                    placeholder="Tìm kiếm nhân viên theo tên..."
                    value={userSearch}
                    onChange={(val) => setUserSearch(val)}
                    className="mb-3"
                    isClearable
                    onClear={() => setUserSearch('')}
                  />
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-xs text-gray-500">
                      Hiển thị {displayedUsers.length} kết quả
                    </span>
                    {displayedUsers.length > 0 && (
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={toggleSelectAll}
                        className="h-6 text-xs"
                      >
                        Chọn/Bỏ chọn tất cả
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                    {displayedUsers.map((u) => {
                      const uID = String(u.id_nhan_vien)
                      const currentStr = (formData.ids_nhan_vien as string) || ''
                      const currentIds = currentStr ? currentStr.split(',') : []
                      const isSelected = currentIds.includes(uID)
                      return (
                        <div
                          key={uID}
                          className="flex items-center space-x-2 bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600"
                        >
                          <Checkbox
                            isSelected={isSelected}
                            onValueChange={(val) => handleUserSelection(val, uID)}
                            classNames={{
                              label: 'w-full'
                            }}
                          >
                            <div className="flex flex-col w-full">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                  {u.ma_nhan_vien}
                                </span>
                                <span className="text-xs text-gray-400">|</span>
                                <span className="text-sm font-medium">{u.ho_ten || u.ho_va_ten}</span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {u.ten_don_vi}
                              </span>
                            </div>
                          </Checkbox>
                        </div>
                      )
                    })}
                    {displayedUsers.length === 0 && (
                      <div className="text-center text-gray-500 py-4">Không tìm thấy nhân viên nào</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {selectedTab === 'create' && (
        <div className="space-y-4">
          <HrFormField
            fieldLabel="Tên khóa học"
            name="ten_khoa_hoc"
            value={newCourse.ten_khoa_hoc}
            onChange={(val) => handleNewCourseChange('ten_khoa_hoc', val)}
          />
          <HrFormFieldTextarea
            fieldLabel="Nội dung"
            name="noi_dung"
            value={newCourse.noi_dung}
            onChange={(val) => handleNewCourseChange('noi_dung', val)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HrFormFieldDate
              fieldLabel="Ngày bắt đầu"
              value={newCourse.ngay_bat_dau}
              onChangeValue={(val) => handleNewCourseChange('ngay_bat_dau', val)}
            />

            <HrFormFieldDate
              fieldLabel="Ngày kết thúc"
              value={newCourse.ngay_ket_thuc}
              onChangeValue={(val) => handleNewCourseChange('ngay_ket_thuc', val)}
            />
          </div>
          <div className="md:col-span-2">
            <HrFormFieldSelect
              fieldLabel="Trạng thái"
              name="trang_thai"
              value={newCourse.trang_thai}
              options={[
                { value: 'Dang_dien_ra', label: 'Đang diễn ra' },
                { value: 'Hoan_thanh', label: 'Hoàn thành' }
              ]}
              onChange={(val) => handleNewCourseChange('trang_thai', val)}
            />
          </div>
          <div className="flex justify-end">
            <Button color="primary" onPress={handleCreateCourse} isLoading={isCreating}>
              Lưu khóa đào tạo
            </Button>
          </div>

          <div className="mt-8 border-t pt-4 flex-1 h-[400px]">
            <h3 className="text-lg font-semibold mb-4">Danh sách khóa đào tạo hiện có</h3>
            <DataGrid<any>
              columns={gridColumns}
              data={coursesList}
              rowKey={(item) => String(item.id_dao_tao || item.id || '')}
              renderCell={renderCell}
              emptyText="Chưa có khóa đào tạo nào"
            />
          </div>
        </div>
      )}
    </div>
  )
}
