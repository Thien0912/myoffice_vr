import { Button, toast } from '@heroui-v3/react'
import { thoiviecAxios } from '@renderer/api/hr/thoiviecAxios'
import { DrawerContentCustom, DrawerCustom, DrawerHeaderCustom } from '@renderer/components/DrawerCustom'
import TableHr from '@renderer/components/table/TableHr'
import UserInfoPopover from '@renderer/components/UserInfoPopover'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import AddProcedureModal from './AddProcedureModal'

interface Procedure extends Record<string, unknown> {
    id_nhan_vien_thoi_viec: string
    id_nhan_vien: string
    id_tttv: string
    ten_thu_tuc: string
    ngay_hoan_thanh: string | null
    trang_thai: string
}

interface ThoiviecProceduresProps {
    procedures: Procedure[]
    isLoading?: boolean
    employeeId: string | null
    employee?: any
    onClose: () => void
}

export default function ThoiviecProcedures({
    procedures,
    isLoading,
    employeeId,
    employee,
    onClose
}: ThoiviecProceduresProps) {
    const [isAddOpen, setIsAddOpen] = useState(false)
    const queryClient = useQueryClient()

    const handleUpdateStatus = async (id: string, status: string) => {
        const procedure = procedures.find((p) => p.id_nhan_vien_thoi_viec === id)
        if (!procedure) {
            console.error('Procedure not found for id:', id)
            return
        }

        console.log('Updating status:', { id, status, id_tttv: procedure.id_tttv })
        try {
            const res = await thoiviecAxios.update(id, {
                trang_thai: status,
                id_tttv: procedure.id_tttv
            })
            console.log('Update response:', res)

            if (res.success === false) {
                toast('Lỗi', { description: res.message || 'Có lỗi xảy ra', variant: 'danger' })
                // Revert change
                queryClient.invalidateQueries({ queryKey: ['dataThutuc', employeeId] })
                return
            }
            toast('Thành công', { description: 'Cập nhật trạng thái thành công', variant: 'success' })
            queryClient.invalidateQueries({ queryKey: ['dataThutuc', employeeId] })
        } catch (error: any) {
            console.error('Update error:', error)
            toast('Lỗi', { description: error.response?.data?.message || error.message || 'Có lỗi xảy ra', variant: 'danger' })
            // Revert change
            queryClient.invalidateQueries({ queryKey: ['dataThutuc', employeeId] })
        }
    }

    const handleUpdateDate = async (id: string, date: any) => {
        const procedure = procedures.find((p) => p.id_nhan_vien_thoi_viec === id)
        if (!procedure) return

        // Format date YYYY-MM-DD for API
        // Kiểm tra nếu date là object CalendarDate (có year, month, day)
        let formattedDate: string | null = null
        if (date && typeof date === 'object' && 'year' in date) {
            formattedDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
        } else if (typeof date === 'string') {
            // Trường hợp date là string (vd: từ input type="date" hoặc đã format)
            formattedDate = date
        }

        console.log('Updating date:', { id, rawDate: date, formattedDate, id_tttv: procedure.id_tttv })

        try {
            const res = await thoiviecAxios.update(id, {
                ngay_hoan_thanh: formattedDate,
                id_tttv: procedure.id_tttv
            })

            if (res.success === false) {
                toast('Lỗi', { description: res.message || 'Có lỗi xảy ra', variant: 'danger' })
                queryClient.invalidateQueries({ queryKey: ['dataThutuc', employeeId] })
                return
            }
            toast('Thành công', { description: 'Cập nhật ngày hoàn thành thành công', variant: 'success' })
            queryClient.invalidateQueries({ queryKey: ['dataThutuc', employeeId] })
        } catch (error: any) {
            console.error('Update date error:', error)
            toast('Lỗi', { description: error.response?.data?.message || error.message || 'Có lỗi xảy ra', variant: 'danger' })
            queryClient.invalidateQueries({ queryKey: ['dataThutuc', employeeId] })
        }
    }

    const columns = useMemo(
        () => [
            {
                uid: 'ten_thu_tuc',
                name: 'Thủ tục',
                className: 'text-xs',
                width: 150
            },
            {
                uid: 'ngay_hoan_thanh',
                name: 'Ngày',
                type: 'date' as const,
                width: 140
            },
            {
                uid: 'trang_thai',
                name: 'Trạng thái',
                width: 130,
                type: 'select' as const,
                options: [
                    { value: 'Hoan_thanh', label: 'Hoàn thành' },
                    { value: 'Chua_hoan_thanh', label: 'Chưa xong' }
                ]
            }
        ],
        []
    )

    return (
        <DrawerCustom width={500} open={!!employeeId} onClose={onClose}>
            <DrawerHeaderCustom onClose={onClose} title="Danh sách thủ tục" />
            <DrawerContentCustom className="p-0 flex flex-col bg-white overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-slate-50/50">
                    <div className="flex-1 min-w-0">
                        {employee && <UserInfoPopover user={employee} showExtraInfo={true} />}
                    </div>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        onPress={() => setIsAddOpen(true)}
                        className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full shrink-0"
                    >
                        <Plus size={16} />
                    </Button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <TableHr
                        columns={columns}
                        data={procedures}
                        isLoading={isLoading}
                        primaryKey="id_nhan_vien_thoi_viec"
                        editable={true}
                        enableSorting={false}
                        enablePinning={false}
                        onRowChange={(id, col, val) => {
                            if (col === 'trang_thai') {
                                handleUpdateStatus(id as string, val)
                            } else if (col === 'ngay_hoan_thanh') {
                                handleUpdateDate(id as string, val)
                            }
                        }}
                    />
                </div>

                <AddProcedureModal isOpen={isAddOpen} onOpenChange={setIsAddOpen} employeeId={employeeId} />
            </DrawerContentCustom>
        </DrawerCustom>
    )
}
