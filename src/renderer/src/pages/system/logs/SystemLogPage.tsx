/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Chip, Input, Modal } from '@heroui-v3/react'
import { LogEntry, logsAxios } from '@renderer/api/admin/logsAxios'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useQuery } from '@tanstack/react-query'
import SearchInput from '@renderer/components/SearchInput'
import { Eye, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'

export default function SystemLogPage() {
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(15)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})

    const [isOpen, setIsOpen] = useState(false)

    // Handle debounce search
    useMemo(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['systemLogs', page, rowsPerPage, debouncedSearch, startDate, endDate],
        queryFn: async (): Promise<any> => {
            const response = await logsAxios.getLogs({
                start: (page - 1) * rowsPerPage,
                length: rowsPerPage,
                searchValue: debouncedSearch,
                search_from_date: startDate ? startDate : undefined,
                search_to_date: endDate ? endDate : undefined,
                order: JSON.stringify([{ column: 1, dir: 'desc' }]) // Giữ nguyên type string để backend json_decode được
            })
            return response
        }
    })

    const logs = data?.data || []
    const totalRecords = data?.recordsFiltered || 0
    const pages = Math.ceil(totalRecords / rowsPerPage) || 1

    const handleResetDateRange = () => {
        setStartDate('')
        setEndDate('')
        setPage(1)
    }

    const handleViewDetails = (log: LogEntry) => {
        setSelectedLog(log)
        setIsOpen(true)
    }

    const formatJsonData = (jsonData?: string | null) => {
        if (!jsonData) return 'Không có dữ liệu'
        try {
            const parsed = JSON.parse(jsonData)
            return (
                <pre className="p-3 bg-gray-50 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap text-left">
                    {JSON.stringify(parsed, null, 2)}
                </pre>
            )
        } catch {
            return jsonData
        }
    }

    const columns: TableColumnType<LogEntry>[] = useMemo(() => [
        {
            uid: 'stt',
            name: 'STT',
            width: 60,
            render: (_val: any, log?: LogEntry) => log ? <span className="text-gray-500 font-medium">#{log.ql_nhat_ky_id}</span> : null
        },
        {
            uid: 'ql_nhat_ky_ngay_tao',
            name: 'THỜI GIAN',
            width: 150,
            render: (_val: any, log?: LogEntry) => log ? (
                <div className="text-sm">
                    {log.ql_nhat_ky_ngay_tao ? new Date(log.ql_nhat_ky_ngay_tao).toLocaleString('vi-VN') : '-'}
                </div>
            ) : null
        },
        {
            uid: 'nguoi_dung',
            name: 'NGƯỜI DÙNG',
            width: 200,
            render: (_val: any, log?: LogEntry) => log ? (
                <div className="flex flex-col">
                    <span className="font-medium text-sm text-gray-800">
                        {log.ql_nguoi_dung_ho_ten || 'Hệ thống'}
                    </span>
                    {log.ql_nguoi_dung_email && (
                        <span className="text-xs text-gray-500">
                            {log.ql_nguoi_dung_email}
                        </span>
                    )}
                </div>
            ) : null
        },
        {
            uid: 'ql_nhat_ky_hanh_dong',
            name: 'HÀNH ĐỘNG',
            width: 150,
            render: (_val: any, log?: LogEntry) => log ? (
                <Chip size="sm" variant={
                    log.ql_nhat_ky_hanh_dong?.toLowerCase().includes('thêm') ? 'soft' :
                        log.ql_nhat_ky_hanh_dong?.toLowerCase().includes('xóa') ? 'soft' :
                            log.ql_nhat_ky_hanh_dong?.toLowerCase().includes('sửa') || log.ql_nhat_ky_hanh_dong?.toLowerCase().includes('cập nhật') ? 'soft' :
                                'primary'
                } className={
                    log.ql_nhat_ky_hanh_dong?.toLowerCase().includes('thêm') ? 'text-green-600 bg-green-50' :
                        log.ql_nhat_ky_hanh_dong?.toLowerCase().includes('xóa') ? 'text-red-600 bg-red-50' :
                            log.ql_nhat_ky_hanh_dong?.toLowerCase().includes('sửa') || log.ql_nhat_ky_hanh_dong?.toLowerCase().includes('cập nhật') ? 'text-yellow-600 bg-yellow-50' :
                                ''
                }>
                    {log.ql_nhat_ky_hanh_dong || 'Thao tác'}
                </Chip>
            ) : null
        },
        {
            uid: 'ql_nhat_ky_noi_dung',
            name: 'NỘI DUNG',
            width: 350,
            render: (_val: any, log?: LogEntry) => log ? (
                <div className="flex flex-col">
                    <div
                        className="text-sm text-gray-600 line-clamp-2"
                        title={log.ql_nhat_ky_noi_dung}
                    >
                        {log.ql_nhat_ky_noi_dung}
                    </div>
                    {log.ql_nhat_ky_bang_du_lieu && (
                        <div className="text-xs text-blue-500 mt-1">
                            Bảng: {log.ql_nhat_ky_bang_du_lieu}
                        </div>
                    )}
                </div>
            ) : null
        },
        {
            uid: 'actions',
            name: 'CHI TIẾT',
            width: 100,
            pinned: 'right',
            render: (_val: any, log?: LogEntry) => log ? (
                <div className="flex justify-center w-full">
                    <Button isIconOnly size="sm" variant="secondary" onPress={() => handleViewDetails(log)}>
                        <Eye size={18} />
                    </Button>
                </div>
            ) : null
        }
    ], [])

    return (
        <div className="flex flex-col overflow-hidden bg-gray-50/50 dark:bg-gray-900">
            <div className="flex flex-col h-full gap-2 relative">
                <div className="flex flex-col gap-3 px-6 mb-1">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 w-full lg:flex-1">
                            <SearchInput
                                placeholder="Tìm kiếm nội dung..."
                                value={search}
                                onChange={setSearch}
                                className="w-full sm:w-auto flex-1 max-w-md"
                            />
                        </div>

                        <div className="flex items-center gap-2 shrink-0 lg:ml-auto w-full lg:w-auto justify-end">
                            <Input
                                type="date"
                                aria-label="Từ ngày"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value)
                                    setPage(1)
                                }}
                                className="w-[140px]"
                            />
                            <span className="text-gray-400">-</span>
                            <Input
                                type="date"
                                aria-label="Đến ngày"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value)
                                    setPage(1)
                                }}
                                className="w-[140px]"
                            />
                            {(startDate || endDate) && (
                                <Button size="sm" variant="danger-soft" onPress={handleResetDateRange} className="px-2 ml-1 text-red-500">
                                    Xóa lọc
                                </Button>
                            )}
                            <Button
                                className="font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 ml-2"
                                size="sm"
                                variant="outline"
                                onPress={() => refetch()}
                            >
                                <RefreshCw size={16} className={isFetching ? "animate-spin mr-2" : "mr-2"} />
                                Làm mới
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 relative">
                    <div className="flex-1 flex flex-col min-h-0 relative">
                        <TableHr
                            data={logs}
                            columns={columns as any}
                            isLoading={isLoading || isFetching}
                            primaryKey="ql_nhat_ky_id"
                            columnWidths={columnWidths}
                            onColumnResize={(uid, w) => setColumnWidths(prev => ({ ...prev, [uid]: w }))}
                            enableResizing={true}
                            enablePinning={true}
                        />

                        {!isLoading && !isFetching && logs.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-white/50 z-10">
                                Không tìm thấy nhật ký nào
                            </div>
                        )}
                    </div>

                    <TablePagination
                        page={page}
                        total={totalRecords}
                        filtered={totalRecords}
                        limit={rowsPerPage}
                        onChangePage={setPage}
                        onChangeLimit={(limit) => {
                            setRowsPerPage(limit)
                            setPage(1)
                        }}
                        className="border-t border-gray-100 dark:border-gray-700"
                    />
                </div>
            </div>

            <Modal>
                <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
                    <Modal.Container>
                        <Modal.Dialog className="max-w-3xl">
                            <Modal.CloseTrigger />
                            <Modal.Header className="flex flex-col gap-1 border-b border-gray-100">
                                <span className="text-lg">Chi tiết nhật ký #{selectedLog?.ql_nhat_ky_id}</span>
                                <span className="text-sm font-normal text-gray-500">
                                    {selectedLog?.ql_nhat_ky_ngay_tao ? new Date(selectedLog.ql_nhat_ky_ngay_tao).toLocaleString('vi-VN') : ''}
                                </span>
                            </Modal.Header>
                            <Modal.Body className="py-6">
                                {selectedLog && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Người thực hiện</p>
                                                <p className="font-medium text-sm">{selectedLog.ql_nguoi_dung_ho_ten || 'Hệ thống'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Hành động</p>
                                                <Chip size="sm" variant="soft">{selectedLog.ql_nhat_ky_hanh_dong || 'Thao tác'}</Chip>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Nội dung</p>
                                                <p className="text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">{selectedLog.ql_nhat_ky_noi_dung}</p>
                                            </div>
                                            {selectedLog.ql_nhat_ky_bang_du_lieu && (
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium uppercase mb-1">Bảng dữ liệu</p>
                                                    <p className="text-sm font-mono">{selectedLog.ql_nhat_ky_bang_du_lieu}</p>
                                                </div>
                                            )}
                                            {selectedLog.ql_nhat_ky_controller && (
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium uppercase mb-1">Module / Controller</p>
                                                    <p className="text-sm font-mono">{selectedLog.ql_nhat_ky_controller}</p>
                                                </div>
                                            )}
                                        </div>

                                        {(selectedLog.ql_nhat_ky_gia_tri_cu || selectedLog.ql_nhat_ky_gia_tri_moi) && (
                                            <div className="border-t border-gray-200 pt-6">
                                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">Thay đổi dữ liệu</h4>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <p className="text-xs text-red-500 font-medium uppercase flex items-center gap-2">Dữ liệu cũ</p>
                                                        <div className="border border-red-100 rounded-lg h-[300px] overflow-auto bg-red-50/30">
                                                            {formatJsonData(selectedLog.ql_nhat_ky_gia_tri_cu)}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-xs text-green-500 font-medium uppercase flex items-center gap-2">Dữ liệu mới</p>
                                                        <div className="border border-green-100 rounded-lg h-[300px] overflow-auto bg-green-50/30">
                                                            {formatJsonData(selectedLog.ql_nhat_ky_gia_tri_moi)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Modal.Body>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </div>
    )
}
