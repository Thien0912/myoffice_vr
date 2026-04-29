import { Selection, Skeleton } from '@heroui/react'
import { FilePreviewModal } from '@renderer/components/FilePreviewModal'
import { Inbox } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ProposeData } from '../hooks/usePropose'
import { ProposeListHeader } from './list/ProposeListHeader'
import { ProposeListItem } from './list/ProposeListItem'

interface ProposeListViewProps {
    data: ProposeData[]
    page: number
    totalRecordFiltered: number
    limit: number
    isLoading: boolean
    onChangePage: (page: number) => void
    onChangeLimit: (limit: number) => void
    onRowClick: (row: ProposeData) => void
    onViewDetail?: (id: string, row: ProposeData) => void
    selectedKeys: Selection
    onSelectionChange: (keys: Selection) => void
    activeId?: string | number | null
}

const ProposeListSkeleton = ({ limit }: { limit: number }) => {
    return (
        <div className="flex flex-col">
            {[...Array(limit)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex flex-col gap-2 flex-1">
                        <Skeleton className="w-1/4 h-3 rounded" />
                        <Skeleton className="w-3/4 h-3 rounded" />
                    </div>
                    <Skeleton className="w-20 h-3 rounded" />
                </div>
            ))}
        </div>
    )
}

export default function ProposeListView({
    data,
    page,
    totalRecordFiltered,
    limit,
    isLoading,
    onChangePage,
    onChangeLimit,
    onRowClick,
    onViewDetail,
    selectedKeys,
    onSelectionChange,
    activeId
}: ProposeListViewProps) {
    const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null)

    const isSelected = (id: string | number) => {
        if (selectedKeys === 'all') return true
        return (selectedKeys as Set<React.Key>).has(String(id))
    }

    const handleSelectRow = (id: string | number, isChecked: boolean) => {
        const newSelection = new Set(selectedKeys === 'all' ? data.map(i => String(i.id_de_xuat)) : (selectedKeys as Set<React.Key>))
        if (isChecked) {
            newSelection.add(String(id))
        } else {
            newSelection.delete(String(id))
        }
        onSelectionChange(newSelection as any)
    }

    const [accumulatedData, setAccumulatedData] = useState<ProposeData[]>([])

    useEffect(() => {
        if (page === 1) {
            setAccumulatedData(data || [])
        } else if (data && data.length > 0) {
            setAccumulatedData((prev) => {
                const existingIds = new Set(prev.map((i) => i.id_de_xuat))
                const newItems = data.filter((i) => !existingIds.has(i.id_de_xuat))
                return [...prev, ...newItems]
            })
        }
    }, [data, page])

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
        // If scrolled to bottom and not loading and have more items
        if (
            scrollHeight - scrollTop <= clientHeight + 100 &&
            !isLoading &&
            accumulatedData.length < totalRecordFiltered
        ) {
            onChangePage(page + 1)
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 flex flex-col border border-gray-200 dark:border-gray-800">
            <ProposeListHeader
                selectedKeys={selectedKeys}
                dataLength={accumulatedData.length}
                onSelectionChange={onSelectionChange}
                page={page}
                limit={limit}
                totalRecordFiltered={totalRecordFiltered}
                onChangePage={onChangePage}
                onChangeLimit={onChangeLimit}
            />

            <div
                className="flex-1 overflow-y-auto custom-scrollbar max-h-[calc(100vh-220px)]"
                onScroll={handleScroll}
            >
                <div className="flex flex-col min-w-[800px]">
                    {isLoading && page === 1 ? (
                        <ProposeListSkeleton limit={limit} />
                    ) : accumulatedData.length > 0 ? (
                        <>
                            {accumulatedData.map((row, index) => (
                                <ProposeListItem
                                    key={row.id_de_xuat}
                                    row={row}
                                    index={index}
                                    active={activeId === row.id_de_xuat}
                                    isSelected={isSelected(row.id_de_xuat)}
                                    onSelectRow={handleSelectRow}
                                    onRowClick={onRowClick}
                                    onViewDetail={onViewDetail}
                                    onPreviewFile={(url, name) => setPreviewFile({ url, name })}
                                />
                            ))}
                            {isLoading && page > 1 && (
                                <div className="py-4 flex justify-center">
                                    <Skeleton className="w-1/2 h-4 rounded-lg" />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                <Inbox size={40} className="text-gray-300 dark:text-gray-600" />
                            </div>
                            <div className="text-center">
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Danh sách trống</p>
                                <p className="text-gray-400 dark:text-gray-500 text-xs">Không tìm thấy đề xuất nào trong danh mục này</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <FilePreviewModal
                isOpen={!!previewFile}
                onOpenChange={(open) => !open && setPreviewFile(null)}
                fileUrl={previewFile?.url || null}
                fileName={previewFile?.name}
            />
        </div>
    )
}
