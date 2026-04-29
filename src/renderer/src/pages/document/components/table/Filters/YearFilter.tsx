import { ListBox, Select } from '@heroui-v3/react'
import { useCurrentStore } from '@renderer/utils/useCurrentStore'
import { FolderOpen } from 'lucide-react'

export default function YearFilter() {
    const { filters, setFilters } = useCurrentStore()

    const currentYear = new Date().getFullYear()
    // Generate years from 2013 to current year + 1 (or similar logic from BoxFilter)
    const years = [
        { key: 'all_years', label: 'Tất cả' },
        ...Array.from({ length: currentYear - 2013 + 1 }, (_, i) => {
            const year = currentYear - i
            return { key: String(year), label: String(year) }
        })
    ]

    const defaultYearKey = filters.year ? String(filters.year) : 'all_years'

    return (
        <div className="w-[160px] hidden lg:block">
            <Select
                aria-label="Lọc theo năm"
                selectedKey={defaultYearKey}
                onSelectionChange={(key) => {
                    const value = key as string
                    if (value) {
                        setFilters({ year: value })
                    }
                }}
            >
                <Select.Trigger className="h-11">
                    <div className="flex items-center gap-2 flex-1">
                        <FolderOpen className="text-amber-400 shrink-0" size={18} />
                        <Select.Value className="text-gray-700 dark:text-gray-300 font-medium text-[15px] flex-1 text-left" />
                    </div>
                    <Select.Indicator />
                </Select.Trigger>
                <Select.Popover className="bg-white dark:bg-gray-800">
                    <ListBox>
                        {years.map((y) => (
                            <ListBox.Item id={y.key} key={y.key} textValue={y.label} className="text-sm data-[hovered]:bg-gray-100 dark:data-[hovered]:bg-gray-700 rounded-md">
                                {y.label}
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </Select.Popover>
            </Select>
        </div>
    )
}

