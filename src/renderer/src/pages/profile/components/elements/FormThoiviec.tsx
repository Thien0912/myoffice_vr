import { toast } from "@heroui-v3/react"
import { Button } from '@heroui/react'
import { thoiviecAxios } from '@renderer/api/hr/thoiviecAxios'
import { DataGrid, DataGridColumn } from '@renderer/components/DataGrid'
import { HrFormFieldSelect, HrFormFieldDate, HrFormField, HrFormFieldTextarea } from '@renderer/components/hero-custom'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'

type FormThoiviecProps = {
  formData: Record<string, any>
  setFormData: Dispatch<SetStateAction<Record<string, any>>>
  procedureList: any[]
}

export default function FormThoiviec({
  formData,
  setFormData,
  procedureList = []
}: FormThoiviecProps) {
  const [procedureOptions, setProcedureOptions] = useState<{ value: string; label: string }[]>([])
  const [selectedTab, setSelectedTab] = useState<string>('select')
  const [isCreating, setIsCreating] = useState(false)
  const [localProcedureList, setLocalProcedureList] = useState<any[]>([])

  const gridColumns: DataGridColumn[] = useMemo(
    () => [
      { key: 'ten_thu_tuc', header: 'Tên thủ tục', flex: 2 },
      { key: 'nhom_thu_tuc', header: 'Nhóm thủ tục', flex: 1.5 },
      { key: 'mo_ta', header: 'Mô tả', flex: 2 }
    ],
    []
  )

  const renderCell = (row: any, col: DataGridColumn) => {
    switch (col.key) {
      case 'ten_thu_tuc':
        return <span className="text-[13.5px] font-medium text-gray-800">{row.ten_thu_tuc}</span>
      case 'nhom_thu_tuc':
        return <span className="text-[13px] text-gray-600">{row.nhom_thu_tuc}</span>
      case 'mo_ta':
        return <span className="text-[13px] text-gray-600">{row.mo_ta}</span>
      default:
        return null
    }
  }

  const [newProcedure, setNewProcedure] = useState({
    ten_thu_tuc: '',
    nhom_thu_tuc: ''
  })

  useEffect(() => {
    if (procedureList && procedureList.length > 0) {
      const opts = procedureList.map((item) => ({
        value: String(item.id_tttv),
        label: item.ten_thu_tuc
      }))
      setProcedureOptions(opts)
      setLocalProcedureList(procedureList)
    }
  }, [procedureList])

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewProcedureChange = (name: string, value: any) => {
    setNewProcedure((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateProcedure = async () => {
    if (!newProcedure.ten_thu_tuc) {
      toast('Vui lòng nhập tên thủ tục', { variant: 'warning' })
      return
    }

    setIsCreating(true)
    try {
      const res = await thoiviecAxios.createProcedure(newProcedure)
      if (res.success) {
        const newId = res.data?.id || Date.now()
        const newOption = {
          value: String(newId),
          label: newProcedure.ten_thu_tuc
        }
        const newProcedureItem = {
          id_tttv: newId,
          ...newProcedure
        }
        setProcedureOptions((prev) => [...prev, newOption])
        setLocalProcedureList((prev) => [newProcedureItem, ...prev])
        setFormData((prev) => ({ ...prev, id_tttv: String(newId) }))
        setSelectedTab('select')
        toast('Thêm thủ tục thành công', { variant: 'success' })
        setNewProcedure({ ten_thu_tuc: '', nhom_thu_tuc: '' })
      } else {
        toast(res.message || 'Lỗi thêm thủ tục', { variant: 'danger' })
      }
    } catch (error) {
      console.error(error)
      toast('Có lỗi xảy ra', { variant: 'danger' })
    } finally {
      setIsCreating(false)
    }
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
          Chọn thủ tục
        </Button>
        <Button
          size="sm"
          variant={selectedTab === 'create' ? 'solid' : 'light'}
          color={selectedTab === 'create' ? 'primary' : 'default'}
          onPress={() => setSelectedTab('create')}
        >
          Thêm thủ tục mới
        </Button>
      </div>

      {selectedTab === 'select' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <HrFormFieldSelect
              fieldLabel="Chọn thủ tục thôi việc"
              name="id_tttv"
              value={formData.id_tttv || ''}
              options={procedureOptions}
              onChange={(val) => handleChange('id_tttv', val as string)}
            />
          </div>

          <HrFormFieldDate
            fieldLabel="Ngày hoàn thành"
            value={formData.ngay_hoan_thanh}
            onChangeValue={(val) => handleChange('ngay_hoan_thanh', val)}
          />

          <HrFormFieldSelect
            fieldLabel="Trạng thái"
            name="trang_thai"
            value={formData?.trang_thai || ''}
            options={[
              { value: 'Chua_hoan_thanh', label: 'Chưa hoàn thành' },
              { value: 'Hoan_thanh', label: 'Hoàn thành' }
            ]}
            onChange={(val) => handleChange('trang_thai', val as string)}
          />
        </div>
      )}

      {selectedTab === 'create' && (
        <div className="space-y-4">
          <HrFormField
            fieldLabel="Tên thủ tục"
            name="ten_thu_tuc"
            value={newProcedure.ten_thu_tuc}
            onChange={(val) => handleNewProcedureChange('ten_thu_tuc', val)}
          />
          <HrFormFieldTextarea
            fieldLabel="Nhóm thủ tục"
            name="nhom_thu_tuc"
            value={newProcedure.nhom_thu_tuc}
            onChange={(val) => handleNewProcedureChange('nhom_thu_tuc', val)}
          />

          <div className="flex justify-end">
            <Button color="primary" onPress={handleCreateProcedure} isLoading={isCreating}>
              Lưu thủ tục
            </Button>
          </div>

          <div className="mt-8 border-t pt-4 flex-1 h-[400px]">
            <h3 className="text-lg font-semibold mb-4">Danh sách thủ tục hiện có</h3>
            <DataGrid<any>
              columns={gridColumns}
              data={localProcedureList}
              rowKey={(item) => String(item.id_tttv || item.id || '')}
              renderCell={renderCell}
              emptyText="Chưa có thủ tục nào"
            />
          </div>
        </div>
      )}
    </div>
  )
}
