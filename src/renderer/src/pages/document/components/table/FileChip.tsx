import { Chip } from '@heroui-v3/react'
import OfficeIcon from '@renderer/components/OfficeIcon'
import { enscrypt } from '@renderer/utils/documents/userPreview'
import openPopout from '@renderer/utils/openPopout'
import { truncateMiddle } from '@renderer/utils/string'

interface FileChipProps {
    files: any[]
    otherFiles?: any[]
    onClickRow?: () => void
}

const handlePreview = async (url: string, name: string): Promise<void> => {
    const link = await enscrypt(url, name)
    if (link) {
        openPopout(link, name)
    }
}

export default function FileChip({
    files,
    otherFiles = [],
    onClickRow
}: FileChipProps): React.JSX.Element {
    const allFiles = [...(files || []), ...(otherFiles || [])]

    if (allFiles.length === 0) return <></>

    return (
        <div className="flex flex-wrap items-center gap-1">
            {/* File đầu tiên: Luôn hiển thị */}
            {allFiles.slice(0, 1).map((f, index) => (
                <Chip
                    key={f.ten_file_goc + index}
                    size="sm"
                    variant="soft"
                    onClick={(e) => {
                        e.stopPropagation()
                        handlePreview(f.duong_dan, f.ten_file_goc)
                    }}
                >
                    <div className="flex items-center gap-1.5">
                        <OfficeIcon name={f.ten_file_goc} size={18} />
                        <span className="text-[12px] text-gray-500 dark:text-gray-400 font-normal pr-1">
                            {truncateMiddle(f.ten_file_goc)}
                        </span>
                    </div>
                </Chip>
            ))}

            {/* File thứ hai: Chỉ hiển thị từ màn hình sm trở lên */}
            {allFiles.length > 1 && (
                <Chip
                    size="sm"
                    variant="soft"
                    onClick={(e) => {
                        e.stopPropagation()
                        handlePreview(allFiles[1].duong_dan, allFiles[1].ten_file_goc)
                    }}
                >
                    <div className="flex items-center gap-1.5">
                        <OfficeIcon name={allFiles[1].ten_file_goc} size={18} />
                        <span className="text-[12px] text-gray-500 dark:text-gray-400 font-normal pr-1">
                            {truncateMiddle(allFiles[1].ten_file_goc)}
                        </span>
                    </div>
                </Chip>
            )}

            {/* Chip +N cho Mobile (khi có > 1 file) */}
            {allFiles.length > 1 && (
                <Chip
                    size="sm"
                    variant="soft"
                    className="sm:hidden text-[10px] h-6 bg-blue-500 text-white border-1 border-blue-500 cursor-pointer hover:bg-blue-700 transition-colors font-bold shadow-sm"
                    onClick={(e) => {
                        e.stopPropagation()
                        onClickRow?.()
                    }}
                >
                    +{allFiles.length - 1}
                </Chip>
            )}

            {/* Chip +N cho Desktop (khi có > 2 file) */}
            {allFiles.length > 2 && (
                <Chip
                    size="sm"
                    variant="soft"
                    className="hidden sm:inline-flex text-[10px] h-6 bg-blue-600 text-white border-1 border-blue-600 cursor-pointer hover:bg-blue-700 transition-colors font-bold shadow-sm"
                    onClick={(e) => {
                        e.stopPropagation()
                        onClickRow?.()
                    }}
                >
                    +{allFiles.length - 2}
                </Chip>
            )}
        </div>
    )
}
