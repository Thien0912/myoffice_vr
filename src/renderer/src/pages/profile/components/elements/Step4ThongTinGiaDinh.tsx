import { Card, Chip } from '@heroui/react'
import { hopdongAxios } from '@renderer/api/hr/hopdongAxios'
import { DataGrid, DataGridColumn } from '@renderer/components/DataGrid'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'

interface HopdongData extends Record<string, unknown> {
  id_hop_dong: string
  so_hop_dong: string
  ten_hop_dong: string
  ngay_bat_dau: string
  ngay_ket_thuc?: string
  dang_hieu_luc?: string | boolean
}

const Step4: React.FC = () => {
  const { data: hopdongList, isLoading } = useQuery({
    queryKey: ['hopdongListStep4'],
    queryFn: async () => {
      const res = await hopdongAxios.fetch({})
      return Array.isArray(res.data) ? res.data : []
    }
  })

  const gridColumns: DataGridColumn[] = useMemo(
    () => [
      {
        key: 'so_hop_dong',
        header: 'Số hợp đồng',
        flex: 1
      },
      {
        key: 'ten_hop_dong',
        header: 'Tên hợp đồng',
        flex: 2
      },
      {
        key: 'ngay_bat_dau',
        header: 'Ngày bắt đầu',
        flex: 1
      },
      {
        key: 'ngay_ket_thuc',
        header: 'Ngày kết thúc',
        flex: 1
      },
      {
        key: 'dang_hieu_luc',
        header: 'Trạng thái',
        flex: 1
      }
    ],
    []
  )

  const renderCell = (row: HopdongData, col: DataGridColumn) => {
    switch (col.key) {
      case 'so_hop_dong':
        return <span className="font-medium text-gray-800 text-[13.5px]">{row.so_hop_dong}</span>
      case 'ten_hop_dong':
        return <span className="text-[13.5px] text-gray-700">{row.ten_hop_dong}</span>
      case 'ngay_bat_dau':
        return (
          <span className="text-[13px] text-gray-600">
            {row.ngay_bat_dau ? new Date(row.ngay_bat_dau).toLocaleDateString('vi-VN') : '-'}
          </span>
        )
      case 'ngay_ket_thuc':
        return (
          <span className="text-[13px] text-gray-600">
            {row.ngay_ket_thuc ? new Date(row.ngay_ket_thuc).toLocaleDateString('vi-VN') : '-'}
          </span>
        )
      case 'dang_hieu_luc':
        return (
          <Chip
            className="capitalize"
            color={row.dang_hieu_luc === '1' || row.dang_hieu_luc === true ? 'success' : 'default'}
            size="sm"
            variant="flat"
          >
            {row.dang_hieu_luc === '1' || row.dang_hieu_luc === true ? 'Đang hiệu lực' : 'Hết hiệu lực'}
          </Chip>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 pb-2.5">
      <Card className="p-4 overflow-visible h-[500px] flex flex-col">
        <h4 className="font-semibold text-gray-700 mb-4 pb-2 shrink-0">Danh sách hợp đồng</h4>
        <div className="flex-1 overflow-hidden rounded-lg relative">
          <DataGrid<HopdongData>
            data={hopdongList || []}
            columns={gridColumns}
            rowKey={(item) => String(item.id_hop_dong || '')}
            renderCell={renderCell}
            isLoading={isLoading}
            emptyText="Chưa có hợp đồng nào"
          />
        </div>
      </Card>
    </div>
  )
}

export default React.memo(Step4)

