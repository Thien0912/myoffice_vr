import { Checkbox } from '@heroui-v3/react'
import { NguoiDung } from '@renderer/shared/CommonInterface'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useEffect, useState } from 'react'

type SelectedItem = {
    uuid: string
    label: string
    type: 'nguoinhan' | 'nguoidongsohuu'
}

type TabContentGioiHanDocProps = {
    onUsersChange?: (users: SelectedItem[]) => void
    onCoOwnerChange?: (users: SelectedItem[]) => void
    allUsers?: NguoiDung[]
    formData?: any
}

export default function TabContentGioiHanDoc({
    onUsersChange,
    onCoOwnerChange,
    allUsers,
    formData
}: TabContentGioiHanDocProps) {
    // const [valueSearchTab, setValueSearchTab] = useState('')
    const [selectedUsers, setSelectedUsers] = useState<SelectedItem[]>([])
    const [selectedCoOwner, setSelectedCoOwner] = useState<SelectedItem[]>([])

    const toggleSelectItem = (uuid: string, label: string, type: 'nguoinhan' | 'nguoidongsohuu') => {
        console.log('toggleSelectItem')

        switch (type) {
            case 'nguoinhan': {
                setSelectedUsers((prev) => {
                    const exists = prev.find((i) => i.uuid === uuid && i.type === type)
                    const newItems = exists
                        ? prev.filter((i) => !(i.uuid === uuid && i.type === type))
                        : [...prev, { uuid, label, type }]

                    if (exists) {
                        setSelectedCoOwner((prev) => prev.filter((i) => !(i.uuid === uuid)))
                    }

                    return newItems
                })
                break
            }

            case 'nguoidongsohuu': {
                setSelectedCoOwner((prev) => {
                    const exists = prev.find((i) => i.uuid === uuid && i.type === type)
                    const newItems = exists
                        ? prev.filter((i) => !(i.uuid === uuid && i.type === type))
                        : [...prev, { uuid, label, type }]

                    if (!exists) {
                        setSelectedUsers((prev) => [...prev, { uuid, label, type: 'nguoinhan' }])
                    }

                    return newItems
                })
                break
            }

            default:
                break
        }
    }

    useEffect(() => {
        // console.log('selectedUsers', selectedUsers)
        // console.log('selectedCoOwner', selectedCoOwner)

        onUsersChange?.(selectedUsers)
        onCoOwnerChange?.(selectedCoOwner)
    }, [selectedUsers, selectedCoOwner])

    useEffect(() => {
        const ids_nguoi_xem = formData.nguoi_don_vi ? formData.nguoi_don_vi.split(',') : []
        const ids_nguoi_dong_so_huu = formData.nguoi_dong_so_huu
            ? formData.nguoi_dong_so_huu.split(',')
            : []

        const formDataSelectedUsers: SelectedItem[] = []
        if (ids_nguoi_xem.length > 0) {
            ids_nguoi_xem.forEach((id) => {
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
                setSelectedUsers(formDataSelectedUsers)
            }
        }

        const formDataSelectedCoOwner: SelectedItem[] = []
        if (ids_nguoi_dong_so_huu.length > 0) {
            ids_nguoi_dong_so_huu.forEach((id) => {
                const existUser = allUsers?.find((u) => String(u.ql_nguoi_dung_id) == id)
                if (existUser) {
                    formDataSelectedCoOwner.push({
                        uuid: String(existUser.ql_nguoi_dung_id),
                        label: String(existUser.ql_nguoi_dung_ho_ten),
                        type: 'nguoidongsohuu'
                    })
                }
            })

            if (formDataSelectedCoOwner.length > 0) {
                setSelectedCoOwner(formDataSelectedCoOwner)
            }
        }
    }, [])

    return (
        <div className="grid grid-cols-12 gap-4 h-[500px]">
            {/* LEFT SIDE */}
            <div
                className={`col-span-12 md:col-span-12'} flex flex-col border border-gray-100 h-[500px]`}
            >
                <div className="flex flex-col gap-3 h-[450px] p-3">
                    {/* <TabSearchContent value={valueSearchTab} onUnitChange={setValueSearchTab} /> */}
                    <ListContainer
                        data={
                            allUsers?.map((u) => ({
                                uuid: String(u?.ql_nguoi_dung_id),
                                label: String(u?.ql_nguoi_dung_ho_ten)
                            })) || []
                        }
                        selectedUsers={selectedUsers}
                        selectedOwners={selectedCoOwner}
                        toggleSelect={toggleSelectItem}
                    // type="nguoinhan"
                    />
                </div>
            </div>
        </div>
    )
}

/* ---------- Sub components ---------- */
// function TabSearchContent({
//   value,
//   onUnitChange
// }: {
//   value: string
//   onUnitChange: (value: string) => void
// }) {
//   return (
//     <Input
//       type="search"
//       placeholder="Tìm kiếm..."
//       value={value}
//       onChange={(e) => onUnitChange(e.target.value)}
//       className="w-full"
//     />
//   )
// }

function ListContainer({
    data,
    selectedUsers,
    selectedOwners,
    toggleSelect,
    type
}: {
    data: { uuid: string; label: string }[]
    selectedUsers: { uuid: string; type: string }[] // dùng chung cho cả đơn vị và người nhận và cơ quan
    selectedOwners: { uuid: string; type: string }[] // dùng chung cho cả đơn vị và người nhận và cơ quan
    toggleSelect: (uuid: string, label: string, type: 'nguoinhan' | 'nguoidongsohuu') => void
    type?: 'nguoinhan' | 'nguoidongsohuu'
}) {
    const { user } = useAuthStore()

    return (
        <ul className="flex-1 overflow-y-auto border border-gray-100 rounded-md divide-y divide-gray-100 bg-white">
            {data.map((item, idx) => {
                const isChecked = selectedUsers.find((i) => i.uuid == item.uuid) ? true : false
                const isCheckedCoOwner = selectedOwners.find((i) => i.uuid == item.uuid) ? true : false
                const isCreator = item.uuid == user?.ql_nguoi_dung_id
                // console.log(`uuid: ${item.uuid}, ql_nguoi_dung_id: ${user?.ql_nguoi_dung_id}, isCreator: ${isCreator}`)
                return (
                    <li
                        key={`${type}-${item.uuid}-${idx}`}
                        className={`flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors hover:bg-gray-50 cursor-pointer ${isChecked ? 'bg-gray-50' : ''
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Checkbox
                                isSelected={isChecked}
                                isDisabled={isCreator}
                                onChange={() => {
                                    if (isCreator) return
                                    toggleSelect(item.uuid, item.label, 'nguoinhan')
                                }}
                            >
                                <Checkbox.Control>
                                    <Checkbox.Indicator />
                                </Checkbox.Control>
                            </Checkbox>
                            <span className="truncate">{item.label}</span>
                        </div>

                        <span className="flex items-center gap-2">
                            {isCreator ? (
                                <span>Người tạo</span>
                            ) : (
                                <>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">Đồng sở hữu</span>
                                    <Checkbox
                                        isSelected={isCheckedCoOwner}
                                        onChange={() => toggleSelect(item.uuid, item.label, 'nguoidongsohuu')}
                                    >
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                    </Checkbox>
                                </>
                            )}
                        </span>
                    </li>
                )
            })}
        </ul>
    )
}
