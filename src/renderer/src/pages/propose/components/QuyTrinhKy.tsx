import { Button, Chip, Tooltip } from '@heroui/react'
import { mapDonviGroupedOptions } from '@renderer/api/danhmuc/DonviAxios'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import { useQuery } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'

type DonViItem = {
    id_don_vi: string | number
    ten_don_vi?: string
}

type QuyTrinhKyProps = {
    formData: Record<string, any>
    setFormData: Dispatch<SetStateAction<Record<string, any>>>
}

export default function QuyTrinhKy({ formData, setFormData }: QuyTrinhKyProps) {
    const quyTrinhKy: DonViItem[] = formData.quy_trinh_ky || []

    const { data: donViOptions = [] } = useQuery({
        queryKey: ['donvi-grouped'],
        queryFn: () => mapDonviGroupedOptions(),
        staleTime: 5 * 60 * 1000
    })

    const updateList = (list: DonViItem[]) => {
        setFormData((prev) => ({ ...prev, quy_trinh_ky: list }))
    }

    const handleAdd = () => {
        updateList([...quyTrinhKy, { id_don_vi: '' }])
    }

    const handleChange = (index: number, id_don_vi: string) => {
        // Flatten grouped options để tìm tên đơn vị
        const flatOptions = donViOptions.flatMap((g: any) => ('options' in g ? g.options : [g]))
        const found = flatOptions.find((o: any) => String(o.value) === id_don_vi)
        const newList = [...quyTrinhKy]
        newList[index] = {
            id_don_vi,
            ten_don_vi: found?.label || ''
        }
        updateList(newList)
    }

    const handleRemove = (index: number) => {
        updateList(quyTrinhKy.filter((_, i) => i !== index))
    }

    const handleMoveUp = (index: number) => {
        if (index === 0) return
        const newList = [...quyTrinhKy]
        ;[newList[index - 1], newList[index]] = [newList[index], newList[index - 1]]
        updateList(newList)
    }

    const handleMoveDown = (index: number) => {
        if (index === quyTrinhKy.length - 1) return
        const newList = [...quyTrinhKy]
        ;[newList[index], newList[index + 1]] = [newList[index + 1], newList[index]]
        updateList(newList)
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Danh sách */}
            <div className="flex flex-col">
                {/* Row cố định: Đơn vị người tạo (luôn là cấp 1) */}
                <div className="flex items-center gap-2">
                    <Chip
                        size="sm"
                        color="primary"
                        variant="solid"
                        className="min-w-[28px] text-center font-bold shrink-0"
                    >
                        1
                    </Chip>
                    <div className="flex-1 flex items-center gap-2 border border-dashed border-blue-300 bg-blue-50/50 rounded-lg px-3 py-2 min-h-[42px]">
                        <span className="text-sm text-blue-700 font-medium">
                            Đơn vị của người tạo đề xuất
                        </span>
                        <Chip size="sm" color="primary" variant="flat" className="text-[10px]">
                            Tự động
                        </Chip>
                    </div>
                    {/* Placeholder nút để giữ layout */}
                    <div className="flex items-center gap-1 shrink-0 opacity-0 pointer-events-none">
                        <Button isIconOnly size="sm" variant="light"><ArrowUp size={14} /></Button>
                        <Button isIconOnly size="sm" variant="light"><ArrowDown size={14} /></Button>
                        <Button isIconOnly size="sm" variant="light"><Trash2 size={14} /></Button>
                    </div>
                </div>

                {/* Các đơn vị do admin cấu hình (bắt đầu từ thứ tự 2) */}
                {quyTrinhKy.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 pt-5"
                    >
                        {/* Số thứ tự: +1 vì slot 1 đã là người tạo */}
                        <Chip
                            size="sm"
                            color="default"
                            variant="flat"
                            className="min-w-[28px] text-center font-bold shrink-0"
                        >
                            {index + 2}
                        </Chip>

                        {/* Select đơn vị */}
                        <div className="flex-1">
                            <SelectDropdown
                                label="Chọn đơn vị"
                                name={`don_vi_${index}`}
                                value={item.id_don_vi ? String(item.id_don_vi) : ''}
                                onChange={(val) => handleChange(index, val as string)}
                                options={donViOptions}
                                isRequired
                            />
                        </div>

                        {/* Nút di chuyển & xóa */}
                        <div className="flex items-center gap-1 shrink-0">
                            <Tooltip content="Lên">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    isDisabled={index === 0}
                                    onPress={() => handleMoveUp(index)}
                                >
                                    <ArrowUp size={14} />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Xuống">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    isDisabled={index === quyTrinhKy.length - 1}
                                    onPress={() => handleMoveDown(index)}
                                >
                                    <ArrowDown size={14} />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Xóa" color="danger">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color="danger"
                                    onPress={() => handleRemove(index)}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                ))}
            </div>

            {/* Nút thêm */}
            <Button
                size="sm"
                variant="flat"
                color="primary"
                startContent={<Plus size={14} />}
                onPress={handleAdd}
                className="self-start"
            >
                Thêm đơn vị
            </Button>
        </div>
    )
}
