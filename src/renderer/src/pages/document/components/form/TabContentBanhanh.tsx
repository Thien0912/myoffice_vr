import { Button, Checkbox, InputGroup, Tabs, TextField } from '@heroui-v3/react'
import { vanbandiAxios } from '@renderer/api/documents/vanbandiAxios'
import { NguoiDung } from '@renderer/shared/CommonInterface'
import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type SelectedItem = {
    uuid: string
    label: string
    type: 'coquan' | 'donvi' | 'nguoinhan'
}

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

const UNIT_TYPE_LABELS: Record<string, string> = {
    LANH_DAO: 'Lãnh đạo',
    PHONG: 'Phòng',
    KHOA_BOMON: 'Khoa / Bộ môn',
    BAN: 'Ban',
    VIEN: 'Viện',
    TRUNG_TAM: 'Trung tâm',
    DON_VI_KHAC: 'Đơn vị khác'
}

type TabContentBanhanhProps = {
    formData: Record<string, any>
    onUnitChange?: (items: SelectedItem[]) => void
    onUsersChange?: (users: SelectedItem[]) => void
    onAgencyChange?: (agencies: SelectedItem[]) => void
    allUnit?: DonVi[]
    allUsers?: NguoiDung[]
    allAgency?: CoQuan[]
    isLoading?: boolean
}

export default function TabContentBanhanh({
    formData,
    onUnitChange,
    onUsersChange,
    onAgencyChange,
    allUnit,
    allUsers,
    allAgency,
    isLoading
}: TabContentBanhanhProps) {
    // Lưu trữ danh sách người của đơn vị đã fetch (Lazy load)
    const [localUnitUsersMap, setLocalUnitUsersMap] = useState<Record<string, NguoiDung[]>>({})
    const [fetchingUnitIds, setFetchingUnitIds] = useState<Set<string>>(new Set())

    const fetchUnitMembers = async (unitId: string) => {
        if (localUnitUsersMap[unitId] || fetchingUnitIds.has(unitId)) return null

        if (allUsers && allUsers.length > 0) {
            const users = allUsers.filter(u => String(u.id_don_vi) === unitId)
            setLocalUnitUsersMap(prev => ({ ...prev, [unitId]: users }))
            return users
        }

        setFetchingUnitIds(prev => new Set(prev).add(unitId))
        try {
            const res = await vanbandiAxios.fetch({
                action: 'get_category_data',
                table: 'ql_nguoi_dung',
                fieldName: 'id_don_vi',
                fieldValue: unitId,
                length: 9999
            })

            const users = res.data || []
            setLocalUnitUsersMap(prev => ({
                ...prev,
                [unitId]: users
            }))
            return users
        } catch (err) {
            console.error(`Failed to fetch users for unit ${unitId}:`, err)
            return []
        } finally {
            setFetchingUnitIds(prev => {
                const next = new Set(prev)
                next.delete(unitId)
                return next
            })
        }
    }

    const [searchValues, setSearchValues] = useState<{
        donvi: string
        nguoinhan: string
        coquan: string
    }>({
        donvi: '',
        nguoinhan: '',
        coquan: ''
    })
    const [selectedUnits, setSelectedUnits] = useState<SelectedItem[]>([])
    const [selectedUsers, setSelectedUsers] = useState<SelectedItem[]>([])
    const [selectedAgencies, setSelectedAgencies] = useState<SelectedItem[]>([])
    const [currentTab, setCurrentTab] = useState<'donvi' | 'nguoinhan' | 'coquan'>('donvi')

    useEffect(() => {
        const ids_don_vi = formData.ids_don_vi_xu_ly?.split(',') || []
        const ids_nguoi = formData.ids_ql_nguoi_dung?.split(',') || []
        const ids_coquan = formData.ids_co_quan?.split(',') || []

        if (allUnit) {
            const items: SelectedItem[] = allUnit
                .filter((u) => ids_don_vi.includes(String(u.id_don_vi)))
                .map((u) => ({
                    uuid: String(u.id_don_vi),
                    label: String(u.ten_don_vi),
                    type: 'donvi'
                }))
            setSelectedUnits(items)

            // Đối với các đơn vị đã chọn từ trước, ta cũng cần fetch members của họ để hiển thị ở list bên phải
            items.forEach(item => {
                fetchUnitMembers(item.uuid)
            })
        }

        if (allUsers) {
            const items: SelectedItem[] = allUsers
                .filter((u) => ids_nguoi.includes(String(u.ql_nguoi_dung_id)))
                .map((u) => ({
                    uuid: String(u.ql_nguoi_dung_id),
                    label: String(u.ql_nguoi_dung_ho_ten),
                    type: 'nguoinhan'
                }))
            setSelectedUsers(items)
        }

        if (allAgency) {
            const items: SelectedItem[] = allAgency
                .filter((item) => ids_coquan.includes(String(item.id_co_quan)))
                .map((item) => ({
                    uuid: String(item.id_co_quan),
                    label: String(item.ten_co_quan),
                    type: 'coquan'
                }))
            setSelectedAgencies(items)
        }
    }, [])

    const toggleSelectItem = async (
        uuid: string,
        label: string,
        type: 'coquan' | 'donvi' | 'nguoinhan'
    ) => {
        switch (type) {
            case 'donvi': {
                const exists = selectedUnits.find((i) => i.uuid === uuid && i.type === type)
                let newItems: SelectedItem[] = []

                if (exists) {
                    newItems = selectedUnits.filter((i) => !(i.uuid === uuid && i.type === type))
                    // Xóa người nhận thuộc đơn vị này
                    const members = localUnitUsersMap[uuid] || []
                    const removeIds = members.map(u => String(u.ql_nguoi_dung_id))
                    const newUsers = selectedUsers.filter((user) => !removeIds.includes(user.uuid))
                    setSelectedUsers(newUsers)
                    onUsersChange?.(newUsers)
                } else {
                    newItems = [...selectedUnits, { uuid, label, type }]

                    let members = localUnitUsersMap[uuid]
                    if (!members) {
                        members = await fetchUnitMembers(uuid) || []
                    }

                    const addUsers: SelectedItem[] = members.map(u => ({
                        uuid: String(u.ql_nguoi_dung_id),
                        label: String(u.ql_nguoi_dung_ho_ten),
                        type: 'nguoinhan'
                    }))

                    const newUsers = [...selectedUsers, ...addUsers]
                    setSelectedUsers(newUsers)
                    onUsersChange?.(newUsers)
                }

                setSelectedUnits(newItems)
                onUnitChange?.(newItems)
                break
            }

            case 'nguoinhan': {
                const exists = selectedUsers.find((i) => i.uuid === uuid && i.type === type)
                const newItems = exists
                    ? selectedUsers.filter((i) => !(i.uuid === uuid && i.type === type))
                    : [...selectedUsers, { uuid, label, type }]

                setSelectedUsers(newItems)
                onUsersChange?.(newItems)
                break
            }

            case 'coquan': {
                const exists = selectedAgencies.find((i) => i.uuid === uuid && i.type === type)
                const newItems = exists
                    ? selectedAgencies.filter((i) => !(i.uuid === uuid && i.type === type))
                    : [...selectedAgencies, { uuid, label, type }]

                setSelectedAgencies(newItems)
                onAgencyChange?.(newItems)
                break
            }
        }
    }

    const selectedUserIdsSet = useMemo(() => new Set(selectedUsers.map(u => u.uuid)), [selectedUsers])

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4 min-h-[500px]">
                <div className="w-[600px] flex flex-col gap-4">
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center border border-gray-100 rounded-md h-[400px] bg-white">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <span className="mt-2 text-sm text-gray-400">Đang tải danh sách...</span>
                        </div>
                    ) : (
                        <Tabs
                            selectedKey={currentTab}
                            onSelectionChange={(key) => setCurrentTab(key as any)}
                            className="w-full"
                        >
                            <Tabs.ListContainer className="w-fit">
                                <Tabs.List aria-label="Ban hanh options" className="justify-start">
                                    <Tabs.Tab id="donvi" className="whitespace-nowrap"> <Tabs.Indicator /> Đơn vị</Tabs.Tab>
                                    <Tabs.Tab id="nguoinhan" className="whitespace-nowrap"><Tabs.Indicator />   Người nhận</Tabs.Tab>
                                        <Tabs.Tab id="coquan" className="whitespace-nowrap"><Tabs.Indicator />Cơ quan</Tabs.Tab>
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
                                        }}
                                        onSelectAll={async () => {
                                            if (!allUnit) return
                                            const newItems: SelectedItem[] = allUnit.map((u) => ({
                                                uuid: String(u.id_don_vi),
                                                label: String(u.ten_don_vi),
                                                type: 'donvi'
                                            }))
                                            setSelectedUnits(newItems)
                                            onUnitChange?.(newItems)

                                            const promises = newItems.map(async (item) => {
                                                const members = localUnitUsersMap[item.uuid] || await fetchUnitMembers(item.uuid) || []
                                                return members.map(u => ({
                                                    uuid: String(u.ql_nguoi_dung_id),
                                                    label: String(u.ql_nguoi_dung_ho_ten),
                                                    type: 'nguoinhan' as const
                                                }))
                                            })
                                            const allArrays = await Promise.all(promises)
                                            const newUsers = allArrays.flat()

                                            const userMap = new Map()
                                            selectedUsers.forEach(u => userMap.set(u.uuid, u))
                                            newUsers.forEach(u => userMap.set(u.uuid, u))
                                            const finalSelectedUsers = Array.from(userMap.values())

                                            setSelectedUsers(finalSelectedUsers)
                                            onUsersChange?.(finalSelectedUsers)
                                        }}
                                    />
                                    <ListContainer
                                        filterText={searchValues.donvi}
                                        data={
                                            allUnit?.map((u) => ({
                                                uuid: String(u?.id_don_vi),
                                                label: String(u?.ten_don_vi),
                                                group: u.loai
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
                                        onUnitChange={(val) =>
                                            setSearchValues((prev) => ({ ...prev, nguoinhan: val }))
                                        }
                                        hasSelection={selectedUsers.length > 0}
                                        onDeselectAll={() => {
                                            setSelectedUsers([])
                                            onUsersChange?.([])
                                        }}
                                        onSelectAll={() => {
                                            if (!allUsers) return
                                            const newUsers: SelectedItem[] = allUsers.map((u) => ({
                                                uuid: String(u.ql_nguoi_dung_id),
                                                label: String(u.ql_nguoi_dung_ho_ten),
                                                type: 'nguoinhan'
                                            }))
                                            setSelectedUsers(newUsers)
                                            onUsersChange?.(newUsers)
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

                            <Tabs.Panel id="coquan">
                                <div className="flex flex-col gap-3 h-full p-3">
                                    <TabSearchContent
                                        value={searchValues.coquan}
                                        onUnitChange={(val) =>
                                            setSearchValues((prev) => ({ ...prev, coquan: val }))
                                        }
                                        hasSelection={selectedAgencies.length > 0}
                                        onDeselectAll={() => {
                                            setSelectedAgencies([])
                                            onAgencyChange?.([])
                                        }}
                                        onSelectAll={() => {
                                            if (!allAgency) return
                                            const newItems: SelectedItem[] = allAgency.map((item) => ({
                                                uuid: String(item.id_co_quan),
                                                label: String(item.ten_co_quan),
                                                type: 'coquan'
                                            }))
                                            setSelectedAgencies(newItems)
                                            onAgencyChange?.(newItems)
                                        }}
                                    />
                                    <ListContainer
                                        filterText={searchValues.coquan}
                                        data={
                                            allAgency?.map((item) => ({
                                                uuid: String(item?.id_co_quan),
                                                label: String(item?.ten_co_quan)
                                            })) || []
                                        }
                                        selectedItem={selectedAgencies}
                                        toggleSelect={toggleSelectItem}
                                        type="coquan"
                                    />
                                </div>
                            </Tabs.Panel>
                        </Tabs>
                    )}
                </div>

                <div className="flex-1 flex flex-col gap-4 border-l border-gray-100 pl-4 bg-gray-50/20 p-4 rounded-r-lg">
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {/* Selected Agencies */}
                        {selectedAgencies.length > 0 && (
                            <div className="border border-gray-200 rounded-md p-3 bg-white shadow-sm">
                                <h6 className="font-medium text-gray-700 mb-2 border-b border-gray-50 pb-1">
                                    Danh sách cơ quan ({selectedAgencies.length})
                                </h6>
                                <div className="space-y-1">
                                    {selectedAgencies.map((item) => (
                                        <div key={item.uuid} className="flex items-center justify-between py-1 group">
                                            <span className="text-sm text-gray-600">{item.label}</span>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="ghost"
                                                className="opacity-0 group-hover:opacity-100 h-6 w-6"
                                                onPress={() => toggleSelectItem(item.uuid, item.label, 'coquan')}
                                            >
                                                <X size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Selected Units & their People */}
                        {selectedUnits.length > 0 && (
                            <div className="border border-gray-200 rounded-md p-3 bg-white shadow-sm">
                                <h6 className="font-medium text-gray-700 mb-3 border-b border-gray-50 pb-2">
                                    Danh sách đơn vị ({selectedUnits.length})
                                </h6>
                                <div className="space-y-4">
                                    {selectedUnits.map((item) => {
                                        const unitMembers = localUnitUsersMap[item.uuid] || []
                                        const isUnitFetching = fetchingUnitIds.has(item.uuid)
                                        // Tính số người đã được chọn trong đơn vị này
                                        const selectedMembersCount = unitMembers.filter((u) =>
                                            selectedUserIdsSet.has(String(u.ql_nguoi_dung_id))
                                        ).length;

                                        return (
                                            <div key={item.uuid} className="flex flex-col gap-1.5 ms-1">
                                                <div
                                                    className="flex items-center justify-between group cursor-pointer hover:bg-blue-50/50 py-1.5 px-2 -mx-2 rounded-md transition-colors"
                                                    onClick={() => toggleSelectItem(item.uuid, item.label, 'donvi')}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <Checkbox
                                                            isSelected={true}
                                                            className="pointer-events-none"
                                                        >
                                                            <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                                                        </Checkbox>
                                                        <span className="text-sm font-medium text-blue-700">
                                                            {item.label} <span className="text-gray-400 font-normal ml-1">({selectedMembersCount})</span>
                                                        </span>
                                                        {isUnitFetching && (
                                                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-blue-600"></div>
                                                        )}
                                                    </div>
                                                </div>

                                                {unitMembers.length > 0 && (
                                                    <div className="ml-5 pl-4 border-l-2 border-gray-100/80 space-y-0.5 mt-0.5">
                                                        {unitMembers.map((u) => {
                                                            const isChecked = selectedUserIdsSet.has(String(u.ql_nguoi_dung_id))
                                                            return (
                                                                <div
                                                                    key={u.ql_nguoi_dung_id}
                                                                    className="flex items-center gap-2.5 py-1.5 cursor-pointer hover:bg-gray-50/80 px-2 -mx-2 rounded-md transition-colors"
                                                                    onClick={() => toggleSelectItem(String(u.ql_nguoi_dung_id), String(u.ql_nguoi_dung_ho_ten ?? ''), 'nguoinhan')}
                                                                >
                                                                    <Checkbox isSelected={isChecked} className="pointer-events-none">
                                                                        <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                                                                    </Checkbox>
                                                                    <span className="text-xs text-gray-600">{u.ql_nguoi_dung_ho_ten}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {selectedUnits.length === 0 && selectedUsers.length === 0 && selectedAgencies.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20 grayscale opacity-50">
                                <span className="text-sm italic">Chưa có đơn vị/nhân sự nào được chọn</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
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
                <Button onPress={onDeselectAll} variant="danger-soft" size="sm">
                    Bỏ chọn
                </Button>
            ) : (
                onSelectAll && (
                    <Button onPress={onSelectAll} variant="primary" size="sm">
                        Chọn tất cả
                    </Button>
                )
            )}
            <TextField
                aria-label="Tìm kiếm"
                value={value}
                onChange={(val) => onUnitChange(val)}
                className="w-full"
            >
                <InputGroup>
                    <InputGroup.Input type="search" placeholder="Tìm kiếm..." />
                </InputGroup>
            </TextField>
        </div>
    )
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
    toggleSelect: (uuid: string, label: string, type: 'coquan' | 'donvi' | 'nguoinhan') => void
    type: 'coquan' | 'donvi' | 'nguoinhan'
    filterText?: string
}) {
    const filteredData = useMemo(() => {
        let result = data
        if (filterText) {
            const lowerFilter = filterText.toLowerCase()
            result = result.filter((item) => item.label.toLowerCase().includes(lowerFilter))
        }
        return result
    }, [data, filterText])

    const isGrouped = useMemo(() => {
        return type === 'donvi'
    }, [type])

    const selectedIds = useMemo(() => {
        return new Set(selectedItem.filter((i) => i.type === type).map((i) => i.uuid))
    }, [selectedItem, type])

    const renderedContent = useMemo(() => {
        if (!isGrouped) {
            const displayData = filteredData.slice(0, 100)
            return (
                <div className="divide-y divide-gray-100">
                    {displayData.map((item, idx) => {
                        const isChecked = selectedIds.has(item.uuid)
                        return (
                            <div
                                key={`${type}-${item.uuid}-${idx}`}
                                className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-gray-50 cursor-pointer ${isChecked ? 'bg-gray-50' : ''}`}
                                onClick={() => toggleSelect(item.uuid, item.label, type)}
                            >
                                <Checkbox isSelected={isChecked} className="pointer-events-none">
                                    <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                                </Checkbox>
                                <span className="truncate">{item.label}</span>
                            </div>
                        )
                    })}
                </div>
            )
        }

        const groups: Record<string, any[]> = {}
        filteredData.forEach((item) => {
            const g = item.group || 'DEFAULT'
            if (!groups[g]) groups[g] = []
            groups[g].push(item)
        })

        const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
            const indexA = GROUP_PRIORITY.indexOf(a)
            const indexB = GROUP_PRIORITY.indexOf(b)
            if (indexA !== -1 && indexB !== -1) return indexA - indexB
            if (indexA !== -1) return -1
            if (indexB !== -1) return 1
            return a.localeCompare(b)
        })

        return (
            <div className="flex flex-col">
                {sortedGroupKeys.map((groupKey) => {
                    const items = groups[groupKey]
                    const groupLabel = UNIT_TYPE_LABELS[groupKey] || groupKey
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
                                            className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-gray-50 cursor-pointer ${isChecked ? 'bg-gray-50' : ''}`}
                                            onClick={() => toggleSelect(item.uuid, item.label, type)}
                                        >
                                            <Checkbox isSelected={isChecked} className="pointer-events-none">
                                                <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                                            </Checkbox>
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
