import {
  Table,
  Pagination,
  Checkbox
} from '@heroui-v3/react'
import { useState } from 'react'

const columns = [
  { key: 'id', label: 'STT' },
  { key: 'soVanBan', label: 'Số văn bản' },
  { key: 'ngayDen', label: 'Ngày đến' },
  { key: 'loaiVanBan', label: 'Loại văn bản' },
  { key: 'trichYeu', label: 'Trích yếu' },
  { key: 'noiGui', label: 'Nơi gửi' },
  { key: 'nguoiKy', label: 'Người ký' },
  { key: 'mucDoKhan', label: 'Mức độ khẩn' },
  { key: 'trangThai', label: 'Trạng thái' }
]

const rows = Array.from({ length: 67 }, (_, i) => ({
  key: i + 1,
  id: i + 1,
  soVanBan: `VB-${2025}${(i + 1).toString().padStart(3, '0')}`,
  ngayDen: `2025-10-${((i % 30) + 1).toString().padStart(2, '0')}`,
  loaiVanBan: ['Công văn', 'Thông báo', 'Quyết định', 'Tờ trình'][i % 4],
  trichYeu: `V/v xử lý công văn số ${i + 1}`,
  noiGui: ['Sở Tài chính', 'UBND Tỉnh', 'Phòng GD&ĐT', 'Công ty ABC'][i % 4],
  nguoiKy: ['Nguyễn Văn A', 'Trần Thị B', 'Phạm Quốc C', 'Lê Văn D'][i % 4],
  mucDoKhan: ['Thường', 'Khẩn', 'Hỏa tốc'][i % 3],
  trangThai: ['Đã xử lý', 'Đang xử lý', 'Chờ xử lý'][i % 3]
}))

export default function TableVanbanden(): React.JSX.Element {
  const [page, setPage] = useState(1)
  const [selectedKeys, setSelectedKeys] = useState<Set<number>>(new Set([]))
  const rowsPerPage = 10
  const totalPages = Math.ceil(rows.length / rowsPerPage)
  const displayedRows = rows.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  console.log('selectedKeys: ', selectedKeys)

  return (
    <div className="flex flex-col gap-4">
      <Table aria-label="Bảng văn bản đến">
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Bảng văn bản đến"
            className="overflow-visible"
            selectionMode="multiple"
            selectedKeys={selectedKeys as any}
            onSelectionChange={(keys) => {
              if (keys === 'all') {
                setSelectedKeys(new Set(rows.map((r) => r.key)))
              } else {
                setSelectedKeys(new Set(Array.from(keys).map(Number)))
              }
            }}
          >
            <Table.Header>
              {columns.map((col) => (
                <Table.Column key={col.key}>{col.label}</Table.Column>
              ))}
            </Table.Header>

            <Table.Body>
              {displayedRows.map((row, idx) => {
                const checked = selectedKeys.has(row.key)
                return (
                  <Table.Row key={row.key} id={row.key} className="group hover:bg-gray-50 transition">
                    <Table.Cell className="w-[60px] text-center">
                      <div className="relative flex justify-center items-center h-full">
                        <span
                          className={`absolute transition-opacity duration-150 ${
                            checked ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'
                          }`}
                        >
                          {(page - 1) * rowsPerPage + idx + 1}
                        </span>

                        <Checkbox
                          slot="selection"
                          aria-label="Select row"
                          isSelected={checked}
                          onChange={(isSelected) => {
                            const newSet = new Set(selectedKeys)
                            if (isSelected) newSet.add(row.key)
                            else newSet.delete(row.key)
                            setSelectedKeys(newSet)
                          }}
                          className={`m-0 p-0 transition-opacity duration-150 ${
                            checked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox>
                      </div>
                    </Table.Cell>
                    {columns.filter((c) => c.key !== 'id').map((col) => {
                      const columnKey = col.key
                      return <Table.Cell key={columnKey}>{String(row[columnKey as keyof typeof row] || '')}</Table.Cell>
                    })}
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
        <Table.Footer>
          <div className="flex items-center justify-between w-full px-2 py-2 border-t mt-2">
            <span className="text-sm text-gray-500">
              Trang <strong>{page}</strong> / {totalPages}
            </span>
            <Pagination className="justify-end" size="sm">
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous isDisabled={page === 1} onPress={() => setPage((p) => Math.max(1, p - 1))}>
                    <Pagination.PreviousIcon />
                  </Pagination.Previous>
                </Pagination.Item>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Pagination.Item key={p}>
                    <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
                      {p}
                    </Pagination.Link>
                  </Pagination.Item>
                ))}
                <Pagination.Item>
                  <Pagination.Next isDisabled={page === totalPages} onPress={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          </div>
        </Table.Footer>
      </Table>
    </div>
  )
}
