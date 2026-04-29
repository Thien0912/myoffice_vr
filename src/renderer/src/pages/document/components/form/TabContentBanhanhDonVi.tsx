import { Button, Checkbox, Tabs, TextField, InputGroup } from '@heroui-v3/react'
// import { DonviAxios } from '@renderer/api/danhmuc/DonviAxios'
import { X } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { NguoiDung } from '@renderer/shared/CommonInterface'

type SelectedItem = {
  uuid: string
  label: string
  type: 'donvi' | 'nguoinhan'
}

// type SelectedUser = {
//   userId: string
//   name: string
//   email: string
//   parentUuid: string
//   parentType: 'coquan' | 'donvi' | 'nguoinhan'
// }

type DonVi = {
  id_don_vi: string
  ten_don_vi: string
  loai?: string
  nguoi_co_quyen_van_thu?: any[]
}

type CoQuan = {
  id_co_quan: string
  ten_co_quan: string
}

type TabContentBanhanhProps = {
  formData: any
  onUnitChange?: (items: SelectedItem[]) => void
  onUsersChange?: (users: SelectedItem[]) => void
  onAgencyChange?: (agencies: SelectedItem[]) => void
  allUnit?: DonVi[]
  allUsers?: NguoiDung[]
  allAgency?: CoQuan[]
}

export default function TabContentBanhanhDonVi({
  formData,
  onUnitChange,
  onUsersChange,
  onAgencyChange,
  allUnit,
  allUsers,
  allAgency
}: TabContentBanhanhProps) {
  const [searchValues, setSearchValues] = useState<{
    donvi: string
    nguoinhan: string
  }>({
    donvi: '',
    nguoinhan: ''
  })
  const [selectedUnits, setSelectedUnits] = useState<SelectedItem[]>([])
  const [selectedUsers, setSelectedUsers] = useState<SelectedItem[]>([])

  const toggleSelectItem = (uuid: string, label: string, type: 'donvi' | 'nguoinhan') => {
    switch (type) {
      case 'donvi': {
        const prev = selectedUnits
        const exists = prev.find((i) => i.uuid === uuid && i.type === type)
        let newItems: SelectedItem[] = []

        if (exists) {
          newItems = prev.filter((i) => !(i.uuid === uuid && i.type === type))

          // Xóa người nhận
          const unitSelected = allUnit?.find((u) => u.id_don_vi === uuid)

          if (unitSelected && Array.isArray(unitSelected.nguoi_co_quyen_van_thu)) {
            const removeIds = unitSelected.nguoi_co_quyen_van_thu.map(
              (user: any) => user.ql_nguoi_dung_id
            )

            const newUsers = selectedUsers.filter((user) => !removeIds.includes(user.uuid))
            setSelectedUsers(newUsers)
            onUsersChange?.(newUsers)
          }
        } else {
          newItems = [...prev, { uuid, label, type }]

          // Thêm người nhận
          const unitSelected = allUnit?.find((u) => u.id_don_vi === uuid)

          if (unitSelected && Array.isArray(unitSelected.nguoi_co_quyen_van_thu)) {
            const addUsers: SelectedItem[] = []

            unitSelected.nguoi_co_quyen_van_thu.forEach((user: any) => {
              addUsers.push({
                uuid: user.ql_nguoi_dung_id,
                label: user.ql_nguoi_dung_ho_ten,
                type: 'nguoinhan'
              })
            })

            const newUsers = [...selectedUsers, ...addUsers]
            setSelectedUsers(newUsers)
            onUsersChange?.(newUsers)
          }
        }

        setSelectedUnits(newItems)
        onUnitChange?.(newItems)
        break
      }

      case 'nguoinhan': {
        const prev = selectedUsers
        const exists = prev.find((i) => i.uuid === uuid && i.type === type)
        const newItems = exists
          ? prev.filter((i) => !(i.uuid === uuid && i.type === type))
          : [...prev, { uuid, label, type }]

        setSelectedUsers(newItems)
        onUsersChange?.(newItems)

        // Xử lý xóa đơn vị đã chọn nếu không còn người nhận thuộc đơn vị đó
        if (exists && allUnit) {
          const parentUnits = allUnit.filter((unit) =>
            unit.nguoi_co_quyen_van_thu?.some((u: any) => String(u.ql_nguoi_dung_id) === uuid)
          )

          const unitsToRemove: string[] = []

          parentUnits.forEach((unit) => {
            // Kiểm tra xem trong danh sách user mới (newItems) còn ai thuộc đơn vị này không
            const hasRemainingUsers = unit.nguoi_co_quyen_van_thu?.some((u: any) =>
              newItems.some((item) => item.uuid === String(u.ql_nguoi_dung_id))
            )

            if (!hasRemainingUsers) {
              unitsToRemove.push(unit.id_don_vi)
            }
          })

          if (unitsToRemove.length > 0) {
            const nextUnits = selectedUnits.filter((u) => !unitsToRemove.includes(u.uuid))
            setSelectedUnits(nextUnits)
            onUnitChange?.(nextUnits)
          }
        } else if (!exists && allUnit) {
          const parentUnit = allUnit.find((unit) =>
            unit.nguoi_co_quyen_van_thu?.some((u: any) => String(u.ql_nguoi_dung_id) === uuid)
          )

          if (parentUnit) {
            const isUnitSelected = selectedUnits.find(
              (u) => u.uuid === parentUnit.id_don_vi && u.type === 'donvi'
            )
            if (!isUnitSelected) {
              const nextUnits: SelectedItem[] = [
                ...selectedUnits,
                {
                  uuid: parentUnit.id_don_vi,
                  label: parentUnit.ten_don_vi,
                  type: 'donvi'
                }
              ]
              setSelectedUnits(nextUnits)
              onUnitChange?.(nextUnits)
            }
          }
        }
        break
      }

      default:
        break
    }
  }

  // Load từ store lúc đầu hoặc chuyển tab (Thông tin chính || ban hành)
  useEffect(() => {
    const ids_don_vi_xu_ly_fd = formData.ids_don_vi_xu_ly
      ? formData.ids_don_vi_xu_ly.split(',')
      : []
    const ids_ql_nguoi_dung_fd = formData.ids_ql_nguoi_dung
      ? formData.ids_ql_nguoi_dung.split(',')
      : []

    const formDataSelectedUnits: SelectedItem[] = []
    const formDataSelectedUsers: SelectedItem[] = []

    if (ids_don_vi_xu_ly_fd.length > 0) {
      ids_don_vi_xu_ly_fd.forEach((id) => {
        const existUnit = allUnit?.find((u) => u.id_don_vi === id)
        if (existUnit) {
          formDataSelectedUnits.push({
            uuid: existUnit.id_don_vi || '',
            label: existUnit.ten_don_vi || '',
            type: 'donvi'
          })
        }
      })

      // 6️⃣ Cập nhật state
      if (formDataSelectedUnits.length > 0) {
        setSelectedUnits(formDataSelectedUnits)
      }
    }

    if (ids_ql_nguoi_dung_fd.length > 0) {
      ids_ql_nguoi_dung_fd.forEach((id) => {
        const existUser = allUsers?.find((u) => String(u.ql_nguoi_dung_id) == id)
        if (existUser) {
          formDataSelectedUsers.push({
            uuid: String(existUser.ql_nguoi_dung_id),
            label: String(existUser.ql_nguoi_dung_ho_ten),
            type: 'nguoinhan'
          })
        }
      })

      if (formDataSelectedUsers.length > 0) {
        console.log('formDataSelectedUsers', formDataSelectedUsers)

        setSelectedUsers(formDataSelectedUsers)
      }
    }
  }, [])

  return (
    <div className="grid grid-cols-12 gap-4 h-[440px]">
      {/* LEFT SIDE */}
      <div
        className={`col-span-12 md:col-span-${selectedUnits.length > 0 ? '6' : '12'} flex flex-col border border-gray-100`}
      >
        <div className="p-0 flex flex-col">
          <Tabs aria-label="Options">
            <Tabs.ListContainer>
              <Tabs.List className="px-3 pt-2 justify-start">
                <Tabs.Tab id="donvi">Đơn vị</Tabs.Tab>
                <Tabs.Tab id="nguoinhan">Người nhận</Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>

            <Tabs.Panel id="donvi">
              <div className="flex flex-col gap-3 h-full p-3">
                <TabSearchContent
                  value={searchValues.donvi}
                  onUnitChange={(val) => setSearchValues((prev) => ({ ...prev, donvi: val }))}
                  hasSelection={selectedUnits.length > 0}
                  onDeselectAll={() => {
                    setSelectedUnits([])
                    onUnitChange?.([])

                    if (allUnit) {
                      const usersInUnits = new Set<string>()
                      allUnit.forEach((u) => {
                        if (Array.isArray(u.nguoi_co_quyen_van_thu)) {
                          u.nguoi_co_quyen_van_thu.forEach((usr: any) =>
                            usersInUnits.add(usr.ql_nguoi_dung_id)
                          )
                        }
                      })
                      const newUsers = selectedUsers.filter((u) => !usersInUnits.has(u.uuid))
                      setSelectedUsers(newUsers)
                      onUsersChange?.(newUsers)
                    }
                  }}
                  onSelectAll={() => {
                    if (!allUnit) return
                    const newSelectedUnits: SelectedItem[] = allUnit.map((u) => ({
                      uuid: u.id_don_vi,
                      label: u.ten_don_vi,
                      type: 'donvi'
                    }))

                    // Collect users from all units
                    const additionalUsers: SelectedItem[] = []
                    allUnit.forEach((u) => {
                      if (Array.isArray(u.nguoi_co_quyen_van_thu)) {
                        u.nguoi_co_quyen_van_thu.forEach((user: any) => {
                          additionalUsers.push({
                            uuid: user.ql_nguoi_dung_id,
                            label: user.ql_nguoi_dung_ho_ten,
                            type: 'nguoinhan'
                          })
                        })
                      }
                    })

                    // Merge users
                    const userMap = new Map()
                    selectedUsers.forEach((u) => userMap.set(u.uuid, u))
                    additionalUsers.forEach((u) => userMap.set(u.uuid, u))
                    const finalSelectedUsers = Array.from(userMap.values())

                    setSelectedUnits(newSelectedUnits)
                    onUnitChange?.(newSelectedUnits)
                    setSelectedUsers(finalSelectedUsers)
                    onUsersChange?.(finalSelectedUsers)
                  }}
                />
                <ListContainer
                  filterText={searchValues.donvi}
                  data={
                    allUnit?.map((u) => ({
                      uuid: u?.id_don_vi || '',
                      label: u?.ten_don_vi || '',
                      group: u?.loai
                    })) || []
                  }
                  selectedItem={selectedUnits}
                  toggleSelect={toggleSelectItem}
                  type="donvi"
                />
              </div>
            </Tabs.Panel>

            <Tabs.Panel id="nguoinhan">
              <div className="flex flex-col gap-3 h-full p-3">
                <TabSearchContent
                  value={searchValues.nguoinhan}
                  onUnitChange={(val) => setSearchValues((prev) => ({ ...prev, nguoinhan: val }))}
                  hasSelection={selectedUsers.length > 0}
                  onDeselectAll={() => {
                    setSelectedUsers([])
                    onUsersChange?.([])

                    if (allUnit) {
                      const unitsWithUsers = allUnit.filter(
                        (u) =>
                          u.nguoi_co_quyen_van_thu &&
                          Array.isArray(u.nguoi_co_quyen_van_thu) &&
                          u.nguoi_co_quyen_van_thu.length > 0
                      )
                      const unitIdsToRemove = unitsWithUsers.map((u) => u.id_don_vi)
                      const newUnits = selectedUnits.filter(
                        (u) => !unitIdsToRemove.includes(u.uuid)
                      )
                      setSelectedUnits(newUnits)
                      onUnitChange?.(newUnits)
                    }
                  }}
                  onSelectAll={() => {
                    if (!allUsers) return
                    const newUsers: SelectedItem[] = allUsers.map((u) => ({
                      uuid: String(u.ql_nguoi_dung_id),
                      label: String(u.ql_nguoi_dung_ho_ten),
                      type: 'nguoinhan'
                    }))

                    const userMap = new Map()
                    selectedUsers.forEach((u) => userMap.set(u.uuid, u))
                    newUsers.forEach((u) => userMap.set(u.uuid, u))
                    const final = Array.from(userMap.values())

                    setSelectedUsers(final)
                    onUsersChange?.(final)
                  }}
                />
                <ListContainer
                  filterText={searchValues.nguoinhan}
                  data={
                    allUsers?.map((u) => ({
                      uuid: String(u?.ql_nguoi_dung_id),
                      label: String(u?.ql_nguoi_dung_ho_ten)
                    })) || []
                  }
                  selectedItem={selectedUsers}
                  toggleSelect={toggleSelectItem}
                  type="nguoinhan"
                />
              </div>
            </Tabs.Panel>
          </Tabs>
        </div>
      </div>

      {/* RIGHT SIDE */}
      {selectedUnits.length > 0 && (
        <div className="col-span-12 md:col-span-6 border border-gray-100">
          <div className="p-3 flex flex-col gap-3 h-full">
            {/* <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-medium text-gray-700">
                Đã chọn <span className="text-primary">[{selectedUnits.length}]</span>
              </h3>
            </div> */}

            <div className="flex-1 overflow-y-auto">
              <div className="flex-1 border border-gray-200 rounded-md p-3 mt-4">
                <h6 className="font-medium text-gray-700">
                  Danh sách đơn vị ({selectedUnits.length})
                </h6>
                {selectedUnits.map((item) => {
                  const data =
                    item.type === 'donvi'
                      ? allUnit?.find((u) => u.id_don_vi === item.uuid) || {}
                      : { nguoi_co_quyen_van_thu: [] }

                  return (
                    <div
                      key={`${item.type}-${item.uuid}`}
                      className="border-b border-gray-50 py-2 last:border-none ms-3"
                    >
                      <div className="font-medium text-sm text-gray-800 mb-1 flex items-center justify-between">
                        <div>
                          {/* {item.label} */}
                          <span className="text-[12px]">{item.label}</span>
                        </div>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          onPress={() => toggleSelectItem(item.uuid, item.label, item.type)}
                        >
                          <X className="text-gray-500" size={18} />
                        </Button>
                      </div>

                      {/* Danh sách người */}
                      {Array.isArray(data?.nguoi_co_quyen_van_thu) &&
                        data.nguoi_co_quyen_van_thu.length > 0 && (
                          <ul className="divide-y divide-gray-50 border border-gray-100 rounded-md bg-gray-50/30">
                            {data.nguoi_co_quyen_van_thu.map((u: any, idx) => {
                              const isChecked = !!selectedUsers.find(
                                (usr) => usr.uuid === u.ql_nguoi_dung_id
                              )
                              return (
                                <li
                                  key={`${item.uuid}-user-${u.ql_nguoi_dung_id}-${idx}`}
                                  className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                                  onClick={() =>
                                    toggleSelectItem(
                                      String(u.ql_nguoi_dung_id),
                                      u.ql_nguoi_dung_ho_ten,
                                      'nguoinhan'
                                    )
                                  }
                                >
                                  <Checkbox
                                    isSelected={isChecked}
                                    className="shrink-0 pointer-events-none"
                                  />
                                  <span>
                                    {String(u.ql_nguoi_dung_id) + '/ ' + u.ql_nguoi_dung_ho_ten}{' '}
                                    <span className="text-gray-400">({u.ql_nguoi_dung_email})</span>
                                  </span>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Sub components ---------- */
function TabSearchContent({
  value,
  onUnitChange,
  onSelectAll,
  onDeselectAll,
  hasSelection = false
}: {
  value: string
  onUnitChange: (value: string) => void
  onSelectAll?: () => void
  onDeselectAll?: () => void
  hasSelection?: boolean
}) {
  return (
    <div className="flex gap-2">
      {hasSelection && onDeselectAll ? (
        <Button onPress={onDeselectAll} variant="danger-soft">
          Bỏ chọn
        </Button>
      ) : (
        onSelectAll && (
          <Button onPress={onSelectAll} variant="primary">
            Chọn tất cả
          </Button>
        )
      )}
      <TextField value={value} onChange={(val) => onUnitChange(val)} className="w-full">
        <InputGroup>
          <InputGroup.Input type="search" placeholder="Tìm kiếm..." />
        </InputGroup>
      </TextField>
    </div>
  )
}

const UNIT_TYPE_LABELS: Record<string, string> = {
  LANH_DAO: 'Lãnh đạo',
  PHONG: 'Phòng',
  KHOA_BOMON: 'Khoa / Bộ môn',
  BAN: 'Ban',
  VIEN: 'Viện',
  TRUNG_TAM: 'Trung tâm',
  DON_VI_KHAC: 'Đơn vị khác'
}

const GROUP_PRIORITY = [
  'LANH_DAO',
  'PHONG',
  'KHOA_BOMON',
  'BAN',
  'TRUNG_TAM',
  'VIEN',
  'DON_VI_KHAC'
]

function ListContainer({
  data,
  selectedItem,
  toggleSelect,
  type,
  filterText
}: {
  data: { uuid: string; label: string; group?: string }[]
  selectedItem: { uuid: string; type: string }[]
  toggleSelect: (uuid: string, label: string, type: 'donvi' | 'nguoinhan') => void
  type: 'donvi' | 'nguoinhan'
  filterText?: string
}) {
  const filteredData = useMemo(() => {
    let result = data
    if (filterText) {
      const lower = filterText.toLowerCase()
      result = result.filter((item) => item.label.toLowerCase().includes(lower))
    }
    return result
  }, [data, filterText])

  // Check if data has groupings or if it's explicitly the 'donvi' type which we want to group
  const isGrouped = useMemo(() => {
    return type === 'donvi' // Always try to group for 'donvi' type
  }, [type])

  // Optimization: Create a Set of selected IDs for O(1) lookup
  const selectedIds = useMemo(() => {
    return new Set(selectedItem.filter((i) => i.type === type).map((i) => i.uuid))
  }, [selectedItem, type])

  const renderedContent = useMemo(() => {
    if (!isGrouped) {
      // Optimization: render only first 100 items to avoid lagging with 6000+ items
      // If user searches, they will likely find what they need in the first 100 matches
      const displayData = filteredData.slice(0, 100)

      return (
        <div className="divide-y divide-gray-100">
          {displayData.map((item, idx) => {
            const isChecked = selectedIds.has(item.uuid)
            return (
              <div
                key={`${type}-${item.uuid}-${idx}`}
                className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-gray-50 cursor-pointer ${
                  isChecked ? 'bg-gray-50' : ''
                }`}
                onClick={() => toggleSelect(item.uuid, item.label, type)}
              >
                <Checkbox isSelected={isChecked} className="pointer-events-none" />
                <span className="truncate">{item.label}</span>
              </div>
            )
          })}
          {filteredData.length > 100 && (
            <div className="p-2 text-center text-xs text-gray-400 italic">
              Hiển thị 100 / {filteredData.length} kết quả. Vui lòng tìm kiếm để thấy thêm.
            </div>
          )}
        </div>
      )
    }

    // Grouping Logic
    const groups: Record<string, typeof filteredData> = {}
    filteredData.forEach((item) => {
      // If item has no group but we are in grouped mode, put it in DEFAULT
      const g = item.group || 'DEFAULT'
      if (!groups[g]) groups[g] = []
      groups[g].push(item)
    })

    // Sort groups based on priority
    const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
      const indexA = GROUP_PRIORITY.indexOf(a)
      const indexB = GROUP_PRIORITY.indexOf(b)

      // If both are in priority list, compare indices
      if (indexA !== -1 && indexB !== -1) return indexA - indexB
      // If a is in list but b is not, a comes first
      if (indexA !== -1) return -1
      // If b is in list but a is not, b comes first
      if (indexB !== -1) return 1
      // If neither is in list, sort alphabetically (optional) or keep original
      return a.localeCompare(b)
    })

    return (
      <div className="flex flex-col">
        {sortedGroupKeys.map((groupKey) => {
          const items = groups[groupKey]
          const groupLabel = UNIT_TYPE_LABELS[groupKey] || groupKey

          if (items.length === 0) return null

          return (
            <div key={groupKey} className="mb-2">
              <div className="bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10 border-y border-gray-100">
                {groupLabel}
              </div>
              <div className="divide-y divide-gray-100 border-b border-gray-50">
                {items.map((item) => {
                  const isChecked = selectedIds.has(item.uuid)
                  return (
                    <div
                      key={`${type}-${item.uuid}`}
                      className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-gray-50 cursor-pointer ${
                        isChecked ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => toggleSelect(item.uuid, item.label, type)}
                    >
                      <Checkbox isSelected={isChecked} className="pointer-events-none" />
                      <span className="truncate">{item.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }, [filteredData, isGrouped, selectedIds, toggleSelect, type])

  return (
    <div className="flex-1 overflow-y-auto border border-gray-100 rounded-md bg-white max-h-75">
      {renderedContent}
    </div>
  )
}
