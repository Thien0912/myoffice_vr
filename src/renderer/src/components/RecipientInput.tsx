
import { Chip, ScrollShadow, Button } from '@heroui/react'
import { NguoiDung } from '@renderer/shared/CommonInterface'
import { useEffect, useRef, useState, useLayoutEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

type RecipientInputProps = {
    label?: string
    formData: any
    placeholder?: string
    allUsers: NguoiDung[]
    value?: string // Comma separated IDs
    onChange: (field: string, value: string, immediate?: boolean) => void
    onFocus?: () => void
    isLoading?: boolean
}

export default function RecipientInput({
    label = 'Người nhận',
    formData,
    placeholder = 'Nhập tên người nhận...',
    allUsers,
    value = '',
    onChange,
    onFocus,
    isLoading
}: RecipientInputProps) {
    const [inputValue, setInputValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const [hiddenCount, setHiddenCount] = useState(0)
    const chipContainerRef = useRef<HTMLDivElement>(null)

    const selectedIds = value ? value.split(',').filter(Boolean) : []

    const selectedUsers = selectedIds
        .map((id) => allUsers.find((u) => String(u.ql_nguoi_dung_id) === id))
        .filter(Boolean) as NguoiDung[]

    const filteredUsers = allUsers.filter((u) => {
        const search = inputValue.toLowerCase()
        const name = (u.ql_nguoi_dung_ho_ten || '').toLowerCase()
        const email = (u.ql_nguoi_dung_email || '').toLowerCase()
        const isSelected = selectedIds.includes(String(u.ql_nguoi_dung_id))
        return !isSelected && (name.includes(search) || email.includes(search))
    })

    // Limit suggestions
    const suggestions = filteredUsers.slice(0, 50)

    const [resizeKey, setResizeKey] = useState(0)
    const lastWidth = useRef(0)

    useLayoutEffect(() => {
        // Find the ghost container (it's the second child of the wrapper usually, but let's be safe)
        const ghostContainer = wrapperRef.current?.querySelector('.absolute.opacity-0') as HTMLElement;
        if (!ghostContainer || isExpanded || selectedUsers.length === 0) {
            if (hiddenCount !== 0) setHiddenCount(0)
            return
        }

        const chips = ghostContainer.querySelectorAll('.ghost-chip')
        if (chips.length === 0) {
            if (hiddenCount !== 0) setHiddenCount(0)
            return
        }

        const firstChip = chips[0] as HTMLElement
        const firstRowTop = firstChip.offsetTop
        let count = 0

        for (let i = 0; i < chips.length; i++) {
            const chip = chips[i] as HTMLElement
            if (chip.offsetTop > firstRowTop + 5) {
                count = chips.length - i
                break
            }
        }

        if (hiddenCount !== count) {
            setHiddenCount(count)
        }
    }, [selectedUsers, isExpanded, resizeKey, hiddenCount])

    useEffect(() => {
        if (!chipContainerRef.current) return

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const width = entry.contentRect.width
                if (width !== lastWidth.current) {
                    lastWidth.current = width
                    window.requestAnimationFrame(() => {
                        setResizeKey((prev) => prev + 1)
                    })
                }
            }
        })

        observer.observe(chipContainerRef.current)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
                setIsFocused(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelectUser = (user: NguoiDung) => {
        const newIds = [...selectedIds, String(user.ql_nguoi_dung_id)]

        console.log('newIds: ', newIds)
        console.log('handleSelectUser: ', user)
        console.log('formData: ', formData)
        let donviSelected = formData.ids_don_vi_xu_ly ? formData.ids_don_vi_xu_ly.split(',') : []
        if (!donviSelected.includes(String(user.id_don_vi))) {
            donviSelected.push(String(user.id_don_vi))
            onChange('ids_don_vi_xu_ly', donviSelected.join(','), true)
        }

        onChange('ids_ql_nguoi_dung', newIds.join(','))
        setInputValue('')
        inputRef.current?.focus()
    }

    const handleRemoveUser = (id: string | number) => {
        const newIds = selectedIds.filter((sid) => sid !== String(id))

        const removedUser = allUsers.find((u) => String(u.ql_nguoi_dung_id) === String(id))
        let idsDonviSelectedArray = formData.ids_don_vi_xu_ly ? formData.ids_don_vi_xu_ly.split(',') : []

        if (removedUser) {
            const removedUnitId = String(removedUser.id_don_vi)
            // Lọc ra các user còn lại
            const newUsers = allUsers.filter((u) => newIds.includes(String(u.ql_nguoi_dung_id)))

            // Kiểm tra xem đơn vị của user vừa xóa có còn được sử dụng bởi user nào khác không
            const isUnitStillUsed = newUsers.some((u) => String(u.id_don_vi) === removedUnitId)

            if (!isUnitStillUsed) {
                idsDonviSelectedArray = idsDonviSelectedArray.filter(
                    (uid) => uid !== removedUnitId
                )
                onChange('ids_don_vi_xu_ly', idsDonviSelectedArray.join(','), true)
            }
        }

        onChange('ids_ql_nguoi_dung', newIds.join(','))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && inputValue === '' && selectedIds.length > 0) {
            // Remove last item
            const newIds = selectedIds.slice(0, -1)
            onChange('ids_ql_nguoi_dung', newIds.join(','))
        }
    }

    return (
        <div className="flex flex-col gap-1 relative" ref={wrapperRef}>
            {label && <label className="text-sm text-gray-500 font-medium">{label}</label>}
            <div
                className={`
          flex flex-wrap items-center gap-1.5 p-2 rounded-xl border bg-white dark:bg-gray-800
          transition-colors duration-200 min-h-12 cursor-text
          ${isFocused ? 'border-primary outline-2 outline-primary outline-offset-2' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
        `}
                onClick={() => {
                    setIsExpanded(true)
                    setIsFocused(true)
                    setIsOpen(true)
                    onFocus?.()
                    setTimeout(() => inputRef.current?.focus(), 0)
                }}
            >
                {/* Real Container */}
                <div
                    ref={chipContainerRef}
                    className={`flex flex-wrap items-center gap-1.5 flex-1 ${!isExpanded ? 'max-h-[40px] overflow-hidden' : ''}`}
                >
                    {selectedUsers.map((user, index) => {
                        // In collapsed mode, hide chips that overflow
                        const isHidden = !isExpanded && hiddenCount > 0 && index >= (selectedUsers.length - hiddenCount);
                        if (isHidden) return null;

                        return (
                            <Chip
                                key={user.ql_nguoi_dung_id}
                                onClose={() => handleRemoveUser(user.ql_nguoi_dung_id)}
                                variant="flat"
                                size="sm"
                                className="recipient-chip shrink-0"
                                classNames={{
                                    base: "h-7 bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600",
                                    content: "text-xs font-medium text-gray-700 dark:text-gray-200",
                                }}
                            >
                                {user.ql_nguoi_dung_ho_ten}
                            </Chip>
                        )
                    })}

                    {hiddenCount > 0 && !isExpanded && (
                        <span className="text-xs text-blue-600 font-medium px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-md shrink-0 border border-blue-100 dark:border-blue-800">
                            +{hiddenCount} người khác
                        </span>
                    )}

                    {(isExpanded || hiddenCount === 0 || selectedUsers.length === 0) && (
                        <input
                            ref={inputRef}
                            type="text"
                            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                            placeholder={selectedUsers.length === 0 ? placeholder : ''}
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value)
                                setIsOpen(true)
                            }}
                            onFocus={() => {
                                setIsFocused(true)
                                setIsOpen(true)
                                onFocus?.()
                            }}
                            onKeyDown={handleKeyDown}
                        />
                    )}
                </div>

                {/* Ghost Container for Measurement - Always renders everything, invisible */}
                <div
                    className="absolute opacity-0 pointer-events-none flex flex-wrap items-center gap-1.5"
                    style={{
                        width: chipContainerRef.current ? chipContainerRef.current.clientWidth : '100%',
                        top: -9999,
                        left: 0,
                        visibility: 'hidden'
                    }}
                >
                    {selectedUsers.map((user) => (
                        <div key={`ghost-${user.ql_nguoi_dung_id}`} className="ghost-chip h-7 px-3 flex items-center gap-1.5">
                            {user.ql_nguoi_dung_ho_ten}
                        </div>
                    ))}
                    <div className="ghost-input min-w-[120px] h-7"></div>
                </div>

                {selectedUsers.length > 0 && (
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="ml-auto"
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsExpanded(!isExpanded)
                        }}
                    >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </Button>
                )}
            </div>

            {/* Helper text / Selected count */}
            {/* <div className="flex justify-end px-1">
        <span className="text-[10px] text-gray-400">
          Đã chọn: {selectedUsers.length} | Tổng: {allUsers.length}
        </span>
      </div> */}

            {isOpen && (inputValue || suggestions.length > 0) && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    <ScrollShadow className="max-h-[250px] w-full p-2">
                        {isLoading ? (
                            <div className="p-4 text-center text-sm text-gray-400">
                                Đang tải dữ liệu...
                            </div>
                        ) : suggestions.length > 0 ? (
                            <div className="flex flex-col gap-1">
                                {suggestions.map((user) => (
                                    <div
                                        key={user.ql_nguoi_dung_id}
                                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleSelectUser(user)
                                        }}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                            {String(user.ql_nguoi_dung_ho_ten || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                                {user.ql_nguoi_dung_ho_ten}
                                            </span>
                                            <span className="text-xs text-gray-400 truncate">
                                                {user.ql_nguoi_dung_email}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-sm text-gray-400">
                                Không tìm thấy kết quả "{inputValue}"
                            </div>
                        )}
                    </ScrollShadow>
                </div>
            )}
        </div>
    )
}
