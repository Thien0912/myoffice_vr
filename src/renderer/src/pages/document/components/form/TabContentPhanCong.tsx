import { Button, Checkbox, InputGroup, Tabs, TextField } from '@heroui-v3/react'
import { LOAI_DON_VI } from '@renderer/api/danhmuc/DonviAxios'
import { mapNhanSuCungDonviOptions } from '@renderer/api/danhmuc/nhansuAxios'
import { removeVietnameseTones } from '@renderer/utils/string'
import { useEffect, useMemo, useState } from 'react'

type SelectedItem = {
    uuid: string
    label: string
    type: 'donvichinh' | 'nguoichinh' | 'donviphoihop' | 'nguoiphoihop'
}

type NguoiDung = {
    value: string
    label: string
}

type DonVi = {
    uuid: string
    label: string
    group?: string
}

const UNIT_TYPE_LABELS: Record<string, string> = Object.keys(LOAI_DON_VI).reduce((acc, key) => {
    acc[key] = LOAI_DON_VI[key as keyof typeof LOAI_DON_VI].label
    return acc
}, {} as Record<string, string>)

type TabContentPhanCongProps = {
    formData: Record<string, any>
    onChange: (name: string, value: any) => void
    allUnit?: DonVi[]
}

export default function TabContentPhanCong({
    formData,
    onChange,
    allUnit
}: TabContentPhanCongProps) {
    const [localUnitUsersMap, setLocalUnitUsersMap] = useState<Record<string, NguoiDung[]>>({})
    const [fetchingUnitIds, setFetchingUnitIds] = useState<Set<string>>(new Set())

    const fetchUnitMembers = async (unitId: string) => {
        if (localUnitUsersMap[unitId] || fetchingUnitIds.has(unitId)) return null

        setFetchingUnitIds((prev) => new Set(prev).add(unitId))
        try {
            const users = await mapNhanSuCungDonviOptions(unitId)
            setLocalUnitUsersMap((prev) => ({
                ...prev,
                [unitId]: users
            }))
            return users
        } catch (err) {
            console.error(`Failed to fetch users for unit ${unitId}:`, err)
            return []
        } finally {
            setFetchingUnitIds((prev) => {
                const next = new Set(prev)
                next.delete(unitId)
                return next
            })
        }
    }

    const [searchValues, setSearchValues] = useState({
        donvichinh: '',
        donviphoihop: ''
    })

    const [selectedDonVichinh, setSelectedDonVichinh] = useState<SelectedItem[]>([])
    const [selectedNguoichinh, setSelectedNguoichinh] = useState<SelectedItem[]>([])

    const [selectedDonViphoihop, setSelectedDonViphoihop] = useState<SelectedItem[]>([])
    const [selectedNguoiphoihop, setSelectedNguoiphoihop] = useState<SelectedItem[]>([])

    const [currentTab, setCurrentTab] = useState<'donvichinh' | 'donviphoihop'>('donvichinh')

    useEffect(() => {
        const ids_dv_chinh = formData.id_don_vi_xu_ly || []
        const ids_ng_chinh = formData.nguoi_xu_ly_chinh_ids || []

        const ids_dv_phoi = formData.id_don_vi_phoi_hop || []
        const ids_ng_phoi = formData.nguoi_xu_ly_phoi_hop_ids || []

        if (allUnit) {
            const itemsChinh: SelectedItem[] = allUnit
                .filter((u) => ids_dv_chinh.includes(String(u.uuid)))
                .map((u) => ({
                    uuid: String(u.uuid),
                    label: String(u.label),
                    type: 'donvichinh'
                }))
            setSelectedDonVichinh(itemsChinh)

            itemsChinh.forEach(async (item) => {
                const members = localUnitUsersMap[item.uuid] || await fetchUnitMembers(item.uuid) || []
                const mappedMembers: SelectedItem[] = members
                    .filter(u => ids_ng_chinh.includes(String(u.value)))
                    .map(u => ({
                        uuid: String(u.value),
                        label: String(u.label),
                        type: 'nguoichinh'
                    }))
                setSelectedNguoichinh(prev => {
                    const existing = prev.map(p => p.uuid)
                    const newMembers = mappedMembers.filter(m => !existing.includes(m.uuid))
                    return [...prev, ...newMembers]
                })
            })

            const itemsPhoihop: SelectedItem[] = allUnit
                .filter((u) => ids_dv_phoi.includes(String(u.uuid)))
                .map((u) => ({
                    uuid: String(u.uuid),
                    label: String(u.label),
                    type: 'donviphoihop'
                }))
            setSelectedDonViphoihop(itemsPhoihop)

            itemsPhoihop.forEach(async (item) => {
                const members = localUnitUsersMap[item.uuid] || await fetchUnitMembers(item.uuid) || []
                const mappedMembers: SelectedItem[] = members
                    .filter(u => ids_ng_phoi.includes(String(u.value)))
                    .map(u => ({
                        uuid: String(u.value),
                        label: String(u.label),
                        type: 'nguoiphoihop'
                    }))
                setSelectedNguoiphoihop(prev => {
                    const existing = prev.map(p => p.uuid)
                    const newMembers = mappedMembers.filter(m => !existing.includes(m.uuid))
                    return [...prev, ...newMembers]
                })
            })
        }
    }, [allUnit])

    const toggleSelectItem = async (
        uuid: string,
        label: string,
        type: 'donvichinh' | 'nguoichinh' | 'donviphoihop' | 'nguoiphoihop'
    ) => {
        switch (type) {
            case 'donvichinh': {
                const exists = selectedDonVichinh.find((i) => i.uuid === uuid)
                let newItems: SelectedItem[] = []

                if (exists) {
                    newItems = selectedDonVichinh.filter((i) => i.uuid !== uuid)
                    // Xoá người thuộc đơn vị này
                    const members = localUnitUsersMap[uuid] || []
                    const removeIds = members.map((u) => String(u.value))
                    const newUsers = selectedNguoichinh.filter((user) => !removeIds.includes(user.uuid))
                    setSelectedNguoichinh(newUsers)
                    onChange('nguoi_xu_ly_chinh_ids', newUsers.map((u) => u.uuid))
                } else {
                    newItems = [...selectedDonVichinh, { uuid, label, type }]
                    // Add users default
                    let members = localUnitUsersMap[uuid]
                    if (!members) {
                        members = (await fetchUnitMembers(uuid)) || []
                    }
                    const addUsers: SelectedItem[] = members.map((u) => ({
                        uuid: String(u.value),
                        label: String(u.label),
                        type: 'nguoichinh'
                    }))
                    const newUsers = [...selectedNguoichinh, ...addUsers.filter(a => !selectedNguoichinh.some(s => s.uuid === a.uuid))]
                    setSelectedNguoichinh(newUsers)
                    onChange('nguoi_xu_ly_chinh_ids', newUsers.map((u) => u.uuid))
                }
                setSelectedDonVichinh(newItems)
                onChange('id_don_vi_xu_ly', newItems.map((i) => i.uuid))
                break
            }
            case 'nguoichinh': {
                const exists = selectedNguoichinh.find((i) => i.uuid === uuid)
                const newItems = exists
                    ? selectedNguoichinh.filter((i) => i.uuid !== uuid)
                    : [...selectedNguoichinh, { uuid, label, type }]
                setSelectedNguoichinh(newItems)
                onChange('nguoi_xu_ly_chinh_ids', newItems.map((u) => u.uuid))
                break
            }
            case 'donviphoihop': {
                const exists = selectedDonViphoihop.find((i) => i.uuid === uuid)
                let newItems: SelectedItem[] = []

                if (exists) {
                    newItems = selectedDonViphoihop.filter((i) => i.uuid !== uuid)
                    // Xoá người thuộc đơn vị này
                    const members = localUnitUsersMap[uuid] || []
                    const removeIds = members.map((u) => String(u.value))
                    const newUsers = selectedNguoiphoihop.filter((user) => !removeIds.includes(user.uuid))
                    setSelectedNguoiphoihop(newUsers)
                    onChange('nguoi_xu_ly_phoi_hop_ids', newUsers.map((u) => u.uuid))
                } else {
                    newItems = [...selectedDonViphoihop, { uuid, label, type }]
                    // Add users default
                    let members = localUnitUsersMap[uuid]
                    if (!members) {
                        members = (await fetchUnitMembers(uuid)) || []
                    }
                    const addUsers: SelectedItem[] = members.map((u) => ({
                        uuid: String(u.value),
                        label: String(u.label),
                        type: 'nguoiphoihop'
                    }))
                    const newUsers = [...selectedNguoiphoihop, ...addUsers.filter(a => !selectedNguoiphoihop.some(s => s.uuid === a.uuid))]
                    setSelectedNguoiphoihop(newUsers)
                    onChange('nguoi_xu_ly_phoi_hop_ids', newUsers.map((u) => u.uuid))
                }
                setSelectedDonViphoihop(newItems)
                onChange('id_don_vi_phoi_hop', newItems.map((i) => i.uuid))
                break
            }
            case 'nguoiphoihop': {
                const exists = selectedNguoiphoihop.find((i) => i.uuid === uuid)
                const newItems = exists
                    ? selectedNguoiphoihop.filter((i) => i.uuid !== uuid)
                    : [...selectedNguoiphoihop, { uuid, label, type }]
                setSelectedNguoiphoihop(newItems)
                onChange('nguoi_xu_ly_phoi_hop_ids', newItems.map((u) => u.uuid))
                break
            }
        }
    }
    const selectedNguoichinhIdsSet = useMemo(() => new Set(selectedNguoichinh.map(u => u.uuid)), [selectedNguoichinh])
    const selectedNguoiphoihopIdsSet = useMemo(() => new Set(selectedNguoiphoihop.map(u => u.uuid)), [selectedNguoiphoihop])

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-stretch h-[500px]">
                <div className="flex flex-col gap-4 flex-1">
                    <Tabs
                        selectedKey={currentTab}
                        onSelectionChange={(key) => setCurrentTab(key as any)}
                        className="w-full"
                    >
                        <Tabs.ListContainer className="w-fit">
                            <Tabs.List aria-label="Phan cong options" className="justify-start">
                                <Tabs.Tab id="donvichinh" className="whitespace-nowrap">
                                    <span>Đơn vị xử lý chính</span>
                                    <Tabs.Indicator />
                                </Tabs.Tab>
                                <Tabs.Tab id="donviphoihop" className="whitespace-nowrap">
                                    <span>Đơn vị phối hợp xử lý</span>
                                    <Tabs.Indicator />
                                </Tabs.Tab>
                            </Tabs.List>
                        </Tabs.ListContainer>

                        <Tabs.Panel id="donvichinh">
                            <div className="flex flex-col gap-3 h-full">
                                <TabSearchContent
                                    value={searchValues.donvichinh}
                                    onUnitChange={(val) => setSearchValues((prev) => ({ ...prev, donvichinh: val }))}
                                    hasSelection={selectedDonVichinh.length > 0}
                                    onDeselectAll={() => {
                                        setSelectedDonVichinh([])
                                        setSelectedNguoichinh([])
                                        onChange('id_don_vi_xu_ly', [])
                                        onChange('nguoi_xu_ly_chinh_ids', [])
                                    }}
                                    onSelectAll={async () => {
                                        if (!allUnit) return
                                        const newItems: SelectedItem[] = allUnit.map((u) => ({
                                            uuid: String(u.uuid),
                                            label: String(u.label),
                                            type: 'donvichinh'
                                        }))
                                        setSelectedDonVichinh(newItems)
                                        onChange('id_don_vi_xu_ly', newItems.map(i => i.uuid))

                                        const promises = newItems.map(async (item) => {
                                            const members = localUnitUsersMap[item.uuid] || await fetchUnitMembers(item.uuid) || []
                                            return members.map(u => ({
                                                uuid: String(u.value),
                                                label: String(u.label),
                                                type: 'nguoichinh' as const
                                            }))
                                        })
                                        const allArrays = await Promise.all(promises)
                                        const newUsers = allArrays.flat()
                                        setSelectedNguoichinh(newUsers)
                                        onChange('nguoi_xu_ly_chinh_ids', newUsers.map((u) => u.uuid))
                                    }}
                                />
                                <ListContainer
                                    filterText={searchValues.donvichinh}
                                    data={allUnit || []}
                                    selectedItem={selectedDonVichinh}
                                    toggleSelect={toggleSelectItem}
                                    type="donvichinh"
                                />
                            </div>
                        </Tabs.Panel>

                        <Tabs.Panel id="donviphoihop">
                            <div className="flex flex-col gap-3 h-full">
                                <TabSearchContent
                                    value={searchValues.donviphoihop}
                                    onUnitChange={(val) => setSearchValues((prev) => ({ ...prev, donviphoihop: val }))}
                                    hasSelection={selectedDonViphoihop.length > 0}
                                    onDeselectAll={() => {
                                        setSelectedDonViphoihop([])
                                        setSelectedNguoiphoihop([])
                                        onChange('id_don_vi_phoi_hop', [])
                                        onChange('nguoi_xu_ly_phoi_hop_ids', [])
                                    }}
                                    onSelectAll={async () => {
                                        if (!allUnit) return
                                        const newItems: SelectedItem[] = allUnit.map((u) => ({
                                            uuid: String(u.uuid),
                                            label: String(u.label),
                                            type: 'donviphoihop'
                                        }))
                                        setSelectedDonViphoihop(newItems)
                                        onChange('id_don_vi_phoi_hop', newItems.map(i => i.uuid))

                                        const promises = newItems.map(async (item) => {
                                            const members = localUnitUsersMap[item.uuid] || await fetchUnitMembers(item.uuid) || []
                                            return members.map(u => ({
                                                uuid: String(u.value),
                                                label: String(u.label),
                                                type: 'nguoiphoihop' as const
                                            }))
                                        })
                                        const allArrays = await Promise.all(promises)
                                        const newUsers = allArrays.flat()
                                        setSelectedNguoiphoihop(newUsers)
                                        onChange('nguoi_xu_ly_phoi_hop_ids', newUsers.map((u) => u.uuid))
                                    }}
                                />
                                <ListContainer
                                    filterText={searchValues.donviphoihop}
                                    data={allUnit || []}
                                    selectedItem={selectedDonViphoihop}
                                    toggleSelect={toggleSelectItem}
                                    type="donviphoihop"
                                />
                            </div>
                        </Tabs.Panel>
                    </Tabs>
                </div>

                <div className="flex-1 flex flex-col gap-4 border-l border-gray-100 pl-4 bg-gray-50/20 p-4 rounded-r-lg min-w-[300px]">
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {/* Selected Đơn vị chính & their People */}
                        {selectedDonVichinh.length > 0 && (
                            <div className="border border-gray-200 rounded-md p-3 bg-white shadow-sm">
                                <h6 className="font-medium text-gray-700 mb-3 border-b border-gray-50 pb-2">
                                    Đơn vị xử lý chính ({selectedDonVichinh.length})
                                </h6>
                                <div className="space-y-4">
                                    {selectedDonVichinh.map((item) => {
                                        const unitMembers = localUnitUsersMap[item.uuid] || []
                                        const isUnitFetching = fetchingUnitIds.has(item.uuid)
                                        const selectedMembersCount = unitMembers.filter((u) =>
                                            selectedNguoichinh.some((usr) => usr.uuid === String(u.value))
                                        ).length
                                        return (
                                            <div key={item.uuid} className="flex flex-col gap-1.5 ms-1">
                                                <div
                                                    className="flex items-center justify-between group cursor-pointer hover:bg-blue-50/50 py-1.5 px-2 -mx-2 rounded-md transition-colors"
                                                    onClick={() => toggleSelectItem(item.uuid, item.label, 'donvichinh')}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <Checkbox isSelected={true} className="pointer-events-none">
                                                            <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                                                        </Checkbox>
                                                        <span className="text-sm font-medium text-blue-700">
                                                            {item.label}{' '}
                                                            <span className="text-gray-400 font-normal ml-1">
                                                                ({selectedMembersCount})
                                                            </span>
                                                        </span>
                                                        {isUnitFetching && (
                                                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-blue-600"></div>
                                                        )}
                                                    </div>
                                                </div>

                                                {unitMembers.length > 0 && (
                                                    <div className="ml-5 pl-4 border-l-2 border-gray-100/80 space-y-0.5 mt-0.5">
                                                        {unitMembers.map((u) => {
                                                            const isChecked = selectedNguoichinhIdsSet.has(String(u.value))
                                                            return (
                                                                <div
                                                                    key={u.value}
                                                                    className="flex items-center gap-2.5 py-1.5 cursor-pointer hover:bg-gray-50/80 px-2 -mx-2 rounded-md transition-colors"
                                                                    onClick={() =>
                                                                        toggleSelectItem(String(u.value), String(u.label), 'nguoichinh')
                                                                    }
                                                                >
                                                                    <Checkbox isSelected={isChecked} className="pointer-events-none">
                                                                        <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                                                                    </Checkbox>
                                                                    <span className="text-xs text-gray-600">{u.label}</span>
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

                        {/* Selected Đơn vị phối hợp & their People */}
                        {selectedDonViphoihop.length > 0 && (
                            <div className="border border-gray-200 rounded-md p-3 bg-white shadow-sm mt-4">
                                <h6 className="font-medium text-gray-700 mb-3 border-b border-gray-50 pb-2">
                                    Đơn vị phối hợp xử lý ({selectedDonViphoihop.length})
                                </h6>
                                <div className="space-y-4">
                                    {selectedDonViphoihop.map((item) => {
                                        const unitMembers = localUnitUsersMap[item.uuid] || []
                                        const isUnitFetching = fetchingUnitIds.has(item.uuid)
                                        const selectedMembersCount = unitMembers.filter((u) =>
                                            selectedNguoiphoihopIdsSet.has(String(u.value))
                                        ).length
                                        return (
                                            <div key={item.uuid} className="flex flex-col gap-1.5 ms-1">
                                                <div
                                                    className="flex items-center justify-between group cursor-pointer hover:bg-blue-50/50 py-1.5 px-2 -mx-2 rounded-md transition-colors"
                                                    onClick={() => toggleSelectItem(item.uuid, item.label, 'donviphoihop')}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <Checkbox isSelected={true} className="pointer-events-none">
                                                            <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                                                        </Checkbox>
                                                        <span className="text-sm font-medium text-emerald-700">
                                                            {item.label}{' '}
                                                            <span className="text-gray-400 font-normal ml-1">
                                                                ({selectedMembersCount})
                                                            </span>
                                                        </span>
                                                        {isUnitFetching && (
                                                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-emerald-600"></div>
                                                        )}
                                                    </div>
                                                </div>

                                                {unitMembers.length > 0 && (
                                                    <div className="ml-5 pl-4 border-l-2 border-gray-100/80 space-y-0.5 mt-0.5">
                                                        {unitMembers.map((u) => {
                                                            const isChecked = selectedNguoiphoihopIdsSet.has(String(u.value))
                                                            return (
                                                                <div
                                                                    key={u.value}
                                                                    className="flex items-center gap-2.5 py-1.5 cursor-pointer hover:bg-gray-50/80 px-2 -mx-2 rounded-md transition-colors"
                                                                    onClick={() =>
                                                                        toggleSelectItem(String(u.value), String(u.label), 'nguoiphoihop')
                                                                    }
                                                                >
                                                                    <Checkbox isSelected={isChecked} className="pointer-events-none">
                                                                        <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                                                                    </Checkbox>
                                                                    <span className="text-xs text-gray-600">{u.label}</span>
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

                        {selectedDonVichinh.length === 0 && selectedDonViphoihop.length === 0 && (
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

const GROUP_PRIORITY: string[] = Object.values(LOAI_DON_VI).map((item) => item.label)

function ListContainer({
    data,
    selectedItem,
    toggleSelect,
    type,
    filterText
}: {
    data: { uuid: string; label: string; group?: string }[]
    selectedItem: { uuid: string; type: string }[]
    toggleSelect: (uuid: string, label: string, type: 'donvichinh' | 'donviphoihop') => void
    type: 'donvichinh' | 'donviphoihop'
    filterText?: string
}) {
    const filteredData = useMemo(() => {
        let result = data
        if (filterText) {
            const lowerFilter = removeVietnameseTones(filterText)
            result = result.filter((item) => removeVietnameseTones(item.label).includes(lowerFilter))
        }
        return result
    }, [data, filterText])

    const selectedIds = useMemo(() => {
        return new Set(selectedItem.filter((i) => i.type === type).map((i) => i.uuid))
    }, [selectedItem, type])

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
        <div className="flex-1 overflow-y-auto border border-gray-100 rounded-md bg-white max-h-75">
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
        </div>
    )
}
