import { toast } from "@heroui-v3/react"
import { Button, Checkbox } from '@heroui/react'
import { thuongAxios } from '@renderer/api/hr/khenthuongAxios'
import { DataGrid, DataGridColumn } from '@renderer/components/DataGrid'
import { HrFormFieldSelect, HrFormField, HrFormFieldTextarea } from '@renderer/components/hero-custom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'

type FormKhenthuongProps = {
  formData: Record<string, any>
  setFormData: Dispatch<SetStateAction<Record<string, any>>>
  allUser?: any[]
}

export default function FormKhenthuong({ formData, setFormData, allUser }: FormKhenthuongProps) {
  const [rewardOptions, setRewardOptions] = useState<{ value: string; label: string }[]>([])
  const [rewardsList, setRewardsList] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState<string>('select')
  const [isCreating, setIsCreating] = useState(false)

  const [newReward, setNewReward] = useState({
    ten_thuong: '',
    loai_thuong: '',
    so_tien: '',
    noi_dung: '',
    ngay_quyet_dinh: ''
  })

  const gridColumns: DataGridColumn[] = useMemo(
    () => [
      { key: 'ten_thuong', header: 'Tên thưởng', flex: 2 },
      { key: 'so_tien', header: 'Số tiền', width: 120 },
      { key: 'loai_thuong', header: 'Loại thưởng', flex: 1.5 }
    ],
    []
  )

  const renderCell = (row: any, col: DataGridColumn) => {
    switch (col.key) {
      case 'ten_thuong': {
        const map: Record<string, string> = {
          chua_duyet: 'Chưa duyệt',
          da_duyet: 'Đã duyệt',
          Dang_dien_ra: 'Đang diễn ra',
          Hoan_thanh: 'Hoàn thành',
          Chua_dien_ra: 'Chưa diễn ra',
          Huy_bo: 'Hủy bỏ'
        }
        const statusLabel = map[row.trang_thai] || row.trang_thai

        let badgeClass = 'bg-gray-100 text-gray-500'
        if (['chua_duyet', 'Dang_dien_ra', 'Cho_duyet'].includes(row.trang_thai))
          badgeClass = 'bg-blue-100 text-blue-600'
        else if (['da_duyet', 'Hoan_thanh'].includes(row.trang_thai))
          badgeClass = 'bg-green-100 text-green-600'
        else if (row.trang_thai === 'Huy_bo') badgeClass = 'bg-red-100 text-red-600'
        else if (row.trang_thai === 'Chua_dien_ra') badgeClass = 'bg-yellow-100 text-yellow-600'

        return (
          <div className="flex flex-col items-start py-1 gap-1 ms-1">
            <span className="font-medium text-xs text-wrap">{row.ten_thuong}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${badgeClass}`}>
              {statusLabel}
            </span>
          </div>
        )
      }
      case 'so_tien':
        return (
          <span className="text-xs font-medium">
            {row.so_tien
              ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.so_tien)
              : ''}
          </span>
        )
      case 'loai_thuong':
        return <span className="text-xs truncate block">{row.loai_thuong}</span>
      default:
        return null
    }
  }

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewRewardChange = (name: string, value: any) => {
    setNewReward((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    const fetchData = async () => {
      const res = await thuongAxios.fetch({ length: 9999 })

      if (res?.success && Array.isArray(res.data)) {
        const options = res.data.map((item: any) => ({
          value: String(item.id),
          label: item.ten_thuong
        }))
        setRewardOptions(options)
        setRewardsList(res.data)
      } else if (res?.data && Array.isArray(res.data.data)) {
        const options = res.data.data.map((item: any) => ({
          value: String(item.id),
          label: item.ten_thuong
        }))
        setRewardOptions(options)
        setRewardsList(res.data.data)
      }
    }
    fetchData()
  }, [])

  const handleCreateReward = async () => {
    if (!newReward.ten_thuong) {
      toast('Vui lòng nhập tên thưởng', { variant: 'warning' })
      return
    }

    setIsCreating(true)
    try {
      const res = await thuongAxios.create(newReward)
      if ((res.status === 200 || res.status === 201) && res.success) {
        const createdReward = res.data
        const newOption = {
          value: String(createdReward.id),
          label: createdReward.ten_thuong
        }
        setRewardOptions((prev) => [...prev, newOption])
        setRewardsList((prev) => [createdReward, ...prev])

        setFormData((prev) => ({ ...prev, id_khen_thuong: String(createdReward.id) }))

        setSelectedTab('select')

        toast('Thêm khen thưởng thành công', { variant: 'success' })

        setNewReward({
          ten_thuong: '',
          loai_thuong: '',
          so_tien: '',
          noi_dung: '',
          ngay_quyet_dinh: ''
        })
      } else {
        toast(res.message || 'Lỗi thêm khen thưởng', { variant: 'danger' })
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
    const currentStr = (formData.ids_nhan_vien as string) || (formData.id_nhan_vien as string) || ''
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
    const currentStr = (formData.ids_nhan_vien as string) || (formData.id_nhan_vien as string) || ''
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
          Chọn khen thưởng
        </Button>
        <Button
          size="sm"
          variant={selectedTab === 'create' ? 'solid' : 'light'}
          color={selectedTab === 'create' ? 'primary' : 'default'}
          onPress={() => setSelectedTab('create')}
        >
          Thêm khen thưởng mới
        </Button>
      </div>

      {selectedTab === 'select' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <HrFormFieldSelect
              fieldLabel="Chọn khen thưởng"
              name="id_khen_thuong"
              value={formData.id_khen_thuong || ''}
              options={rewardOptions}
              onChange={(val) => handleChange('id_khen_thuong', val as string)}
            />
          </div>
        </div>
      )}

      {selectedTab === 'create' && (
        <div className="space-y-4">
          <HrFormField
            fieldLabel="Tên thưởng"
            name="ten_thuong"
            value={newReward.ten_thuong}
            onChange={(val) => handleNewRewardChange('ten_thuong', val)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HrFormField
              fieldLabel="Loại thưởng"
              name="loai_thuong"
              value={newReward.loai_thuong}
              onChange={(val) => handleNewRewardChange('loai_thuong', val)}
            />
            <HrFormField
              fieldLabel="Số tiền"
              name="so_tien"
              type="number"
              value={newReward.so_tien}
              onChange={(val) => handleNewRewardChange('so_tien', val)}
            />
          </div>

          <HrFormFieldTextarea
            fieldLabel="Nội dung/Mô tả"
            name="noi_dung"
            value={newReward.noi_dung}
            onChange={(val) => handleNewRewardChange('noi_dung', val)}
          />

          <div className="flex justify-end">
            <Button color="primary" onPress={handleCreateReward} isLoading={isCreating}>
              Lưu khen thưởng
            </Button>
          </div>

          <div className="mt-8 border-t pt-4 flex-1 h-[400px]">
            <h3 className="text-lg font-semibold mb-4">Danh sách khen thưởng hiện có</h3>
            <DataGrid<any>
              columns={gridColumns}
              data={rewardsList}
              rowKey={(item) => String(item.id_khen_thuong || item.id || '')}
              renderCell={renderCell}
              emptyText="Chưa có khen thưởng hiện có"
            />
          </div>
        </div>
      )}

      {selectedTab === 'select' && (
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
                  const currentStr =
                    (formData.ids_nhan_vien as string) || (formData.id_nhan_vien as string) || ''
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
    </div>
  )
}
