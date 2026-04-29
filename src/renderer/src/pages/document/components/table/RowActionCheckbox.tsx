import { Button, Tooltip } from '@heroui-v3/react'

type RowActionCheckboxProps = {
    selectedIds: (string | number)[]
    menu: {
        label: string
        icon?: React.ReactNode
        onClick: () => void
    }[]
}

function RowActionCheckbox({ selectedIds, menu }: RowActionCheckboxProps) {
    return (
        <div className="flex gap-1 ms-10">
            <div className="text-sm text-gray-600 self-center mr-2">
                <span className="font-medium text-blue-600">{selectedIds.length ?? 0}</span> mục đã chọn
            </div>
            {menu.map((item, idx) => (
                <Tooltip key={`${idx}_checkbox`}>
                    <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        className="text-gray-700 rounded-full"
                        onPress={item.onClick}
                    >
                        {item.icon}
                    </Button>
                    <Tooltip.Content className="capitalize bg-slate-100 px-2 py-1 rounded-sm text-xs">
                        {item.label}
                    </Tooltip.Content>
                </Tooltip>
            ))}

        </div>
    )
}

export default RowActionCheckbox
