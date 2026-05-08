import { Dispatch, SetStateAction, useState, useEffect } from 'react'
import { SelectFloatingLabel } from '@renderer/components/SelectFloatingLabel'
import { Tabs, Tab, Checkbox, Input } from '@heroui/react'
import InputFloatingEndLabel from '@renderer/components/InputFloatingEndLabel'
import { LOAI_DON_VI } from '@renderer/api/danhmuc/DonviAxios'
import { Trash2 } from 'lucide-react'

type FormDonviProps = {
  formData: Record<string, any>
  setFormData: Dispatch<SetStateAction<Record<string, any>>>
  isEdit?: boolean
  loaiDonVi?: string
}

export default function FormDonvi({ formData, setFormData, isEdit, loaiDonVi }: FormDonviProps) {
  const [selectedTab, setSelectedTab] = useState<string>('select')

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLeaderChange = (user: any, isSelected: boolean) => {
    setFormData((prev) => {
      const currentLeaders = prev.lanh_dao_don_vi || []
      let newLeaders

      if (isSelected) {
        // Check if already in list to avoid duplicates (though UI prevents checking twice, logic safety is good)
        if (!currentLeaders.some((l: any) => l.ql_nguoi_dung_id === user.ql_nguoi_dung_id)) {
          // We need to shape the leader object.
          // Based on sample: leaders have { ql_nguoi_dung_id, ql_nguoi_dung_ho_ten, ql_nguoi_dung_email }
          // The 'user' object from nhan_su has these fields and more (role info).
          // We can just copy the relevant fields or the whole object.
          // The user sample shows 'lanh_dao_don_vi' items having fewer fields than 'nhan_su' items (no role info in leaders list example, but maybe it's fine).
          const newLeader = {
            ql_nguoi_dung_id: user.ql_nguoi_dung_id,
            ql_nguoi_dung_ho_ten: user.ql_nguoi_dung_ho_ten,
            ql_nguoi_dung_email: user.ql_nguoi_dung_email,
            // Preserve other fields if needed, or just spread user
            ...user
          }
          newLeaders = [...currentLeaders, newLeader]
        } else {
          newLeaders = currentLeaders
        }
      } else {
        newLeaders = currentLeaders.filter((l: any) => l.ql_nguoi_dung_id !== user.ql_nguoi_dung_id)
      }

      return { ...prev, lanh_dao_don_vi: newLeaders }
    })
  }

  const nhanSuList = formData.nhan_su || []
  const lanhDaoList = formData.lanh_dao_don_vi || []

  return (
    <div className="ps-3 pe-0 py-2">
      <Tabs
        aria-label="Options"
        selectedKey={selectedTab}
        onSelectionChange={(k) => setSelectedTab(k as string)}
        className="w-full"
      >
        <Tab key="select" title="Thông tin chính">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="md:col-span-2">
              <InputFloatingEndLabel
                label="Tên đơn vị"
                name="ten_don_vi"
                isRequired
                value={String(formData.ten_don_vi ?? '')}
                onChange={(val) => handleChange('ten_don_vi', val)}
              />
            </div>

            <div className="md:col-span-2">
              <InputFloatingEndLabel
                label="Tên viết tắt"
                name="ten_viet_tat"
                value={String(formData.ten_viet_tat ?? '')}
                onChange={(val) => handleChange('ten_viet_tat', val)}
              />
            </div>

            <div className="md:col-span-1">
              <InputFloatingEndLabel
                label="Mã đơn vị"
                name="ma_don_vi"
                value={String(formData.ma_don_vi ?? '')}
                onChange={(val) => handleChange('ma_don_vi', val)}
              />
            </div>

            <div className="md:col-span-1">
              {loaiDonVi ? (
                // Khi ở danh mục con, hiển thị loại đã chọn (readonly)
                <InputFloatingEndLabel
                  label="Loại"
                  name="loai_display"
                  value={loaiDonVi === 'PHONG_BAN' ? 'Phòng ban' :
                         loaiDonVi === 'TRUNG_TAM' ? 'Trung tâm' :
                         loaiDonVi === 'TRUONG' ? 'Trường' :
                         loaiDonVi === 'KHOA' ? 'Khoa' :
                         LOAI_DON_VI[loaiDonVi as keyof typeof LOAI_DON_VI]?.label || loaiDonVi}
                  isReadOnly
                />
              ) : (
                // Khi ở danh mục tổng, cho phép chọn loại
                <SelectFloatingLabel
                  label="Loại"
                  name="loai"
                  value={formData.loai}
                  isRequired
                  options={Object.values(LOAI_DON_VI).map((item) => ({
                    value: item.value,
                    label: item.label
                  }))}
                  onChange={(val) => handleChange('loai', val)}
                />
              )}
            </div>

            <div className="md:col-span-2">
              <InputFloatingEndLabel
                label="Email"
                name="email"
                value={String(formData.email ?? '')}
                onChange={(val) => handleChange('email', val)}
              />
            </div>
          </div>
        </Tab>
        <Tab key="leaders" title="Lãnh đạo/ Quản lý">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 h-[500px]">
            {/* Left Column: Staff List */}
            <div className="flex flex-col border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
              <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900">
                <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">
                  Danh sách nhân sự ({nhanSuList.length})
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {nhanSuList.map((user: any) => {
                  const isLeader = lanhDaoList.some(
                    (l: any) => l.ql_nguoi_dung_id === user.ql_nguoi_dung_id
                  )
                  return (
                    <div
                      key={user.ql_nguoi_dung_id}
                      className={`flex items-start gap-3 p-2 rounded-md transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isLeader ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                    >
                      <Checkbox
                        isSelected={isLeader}
                        onValueChange={(isSelected) => handleLeaderChange(user, isSelected)}
                        radius="sm"
                        size="sm"
                        classNames={{
                          base: 'mt-1'
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          {user.ql_nguoi_dung_ho_ten}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {user.ql_nguoi_dung_email}
                        </span>
                        {/* {user.ql_vai_tro_ten && (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                            {user.ql_vai_tro_ten}
                          </span>
                        )} */}
                      </div>
                    </div>
                  )
                })}
                {nhanSuList.length === 0 && (
                  <div className="text-center py-4 text-gray-400 text-sm">Chưa có nhân sự</div>
                )}
              </div>
            </div>

            {/* Right Column: Leaders List */}
            <div className="flex flex-col border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
              <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900">
                <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">
                  Danh sách lãnh đạo ({lanhDaoList.length})
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {lanhDaoList.map((leader: any) => (
                  <div
                    key={leader.ql_nguoi_dung_id}
                    className="flex flex-col p-2 rounded-md bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700"
                  >
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {leader.ql_nguoi_dung_ho_ten}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {leader.ql_nguoi_dung_email}
                    </span>
                  </div>
                ))}
                {lanhDaoList.length === 0 && (
                  <div className="text-center py-4 text-gray-400 text-sm">Chưa có lãnh đạo</div>
                )}
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  )
}
