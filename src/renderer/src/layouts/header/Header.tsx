import { Breadcrumbs, Button, InputGroup, Popover, Separator, TextField, toast } from '@heroui-v3/react'
import { userAxios } from '@renderer/api/auth/userAxios'
import UserAvatar from '@renderer/components/UserAvatar'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useBreadcrumbMap } from '@renderer/store/useBreadcrumbMap'
import { useThemeStore } from '@renderer/store/useThemeStore'
import { clearCookiesAuth } from '@renderer/utils/cookieService'
import { Check, LogOut, Menu, Moon, Search, Sun, User, Users, X } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'


import { invalidateAllQueries } from '@renderer/utils/queryUtils'
import { useQueryClient } from '@tanstack/react-query'

import NotificationDropdown from './NotificationDropdown'
import OnlineUserGroup from './components/OnlineUserGroup'
import { useProfileModalStore } from '@renderer/store/useProfileModalStore'

type HeaderProps = {
    toggleSidebar: () => void
}

type UserRole = {
    ql_vai_tro_nguoi_dung_id?: string | number
    ql_vai_tro_id?: string | number
    ql_ma_vai_tro?: string
    ql_vai_tro_ten?: string
    ten_vai_tro?: string
    is_active?: string | number
}

function Header({ toggleSidebar }: HeaderProps): React.JSX.Element {
    const { user, logout, setUser, setPermissions } = useAuthStore()
    const { mode, setMode } = useThemeStore()
    const breadcrumb = useBreadcrumbMap()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { pathname } = useLocation()
    const [searchParams, setSearchParams] = useSearchParams()

    const initialSearch = searchParams.get('search') || ''
    const [isSearchOpen, setIsSearchOpen] = useState(!!initialSearch)
    const [searchValue, setSearchValue] = useState(initialSearch)

    const showSearch = pathname.includes('/ngoai-gio') || pathname.includes('/bang-cham-cong')

    useEffect(() => {
        if (!showSearch) return

        const timer = setTimeout(() => {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev)
                if (searchValue) {
                    next.set('search', searchValue)
                } else {
                    next.delete('search')
                }
                if (next.toString() !== prev.toString()) {
                    return next
                }
                return prev
            }, { replace: true })
        }, 400)

        return () => clearTimeout(timer)
    }, [searchValue, pathname, setSearchParams])

    const handleCloseSearch = () => {
        setIsSearchOpen(false)
        setSearchValue('')
    }

    const handleLogout = (): void => {
        setIsPopoverOpen(false)
        clearCookiesAuth()
        logout()
        navigate('/login')
    }

    const profileModal = useProfileModalStore()
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)

    const roleOptions = useMemo(() => {
        const rawRoles = (user?.vai_tro ?? []) as UserRole[]

        return rawRoles.map((role) => {
            const value = String(role.ql_vai_tro_id ?? role.ql_ma_vai_tro ?? '')
            const label =
                role.ql_vai_tro_ten || role.ten_vai_tro || role.ql_ma_vai_tro || 'Không xác định'
            const isActive = String(role.is_active ?? '0') === '1'
            return { value, label, isActive }
        })
    }, [user?.vai_tro])

    const [activeRole, setActiveRole] = useState('')

    useEffect(() => {
        const currentRole = roleOptions.find((role) => role.isActive) ?? roleOptions[0]
        setActiveRole(currentRole?.value ?? '')
    }, [roleOptions])

    const handleRoleChange = async (roleValue: string) => {
        if (activeRole === roleValue) {
            setIsPopoverOpen(false)
            return
        }

        const selectedRole = roleOptions.find((role) => role.value === roleValue)
        const response = await userAxios.changeRole({ ql_vai_tro_id: roleValue })

        if (!response?.success || !response?.data?.user) {
            toast('Chuyển vai trò thất bại', { description: response?.message || 'Không thể chuyển vai trò, vui lòng thử lại', variant: 'danger' })
            return
        }

        const permissionKeys = response?.data?.permission_keys || []
        setUser({ ...response.data.user, permissions: permissionKeys })
        setPermissions(permissionKeys)
        setActiveRole(roleValue)
        setIsPopoverOpen(false)

        // Invalidate tất cả queries để trigger refetch trang hiện tại
        invalidateAllQueries(queryClient)

        toast('Chuyển vai trò thành công', { description: response?.message || `Đã chuyển sang vai trò: ${selectedRole?.label ?? roleValue}`, variant: 'success' })
    }

    return (
        <div className="h-14 py-2 px-2 sm:pr-4 lg:pr-6 transition-colors duration-300">
            <div className="h-full flex justify-between items-center md:ps-2">
                <div className="flex items-center gap-2">
                    <Button
                        aria-label="Menu"
                        variant="ghost"
                        isIconOnly
                        onPress={toggleSidebar}
                        className="dark:text-white"
                    >
                        <Menu className='size-5.5' />
                    </Button>

                    {showSearch && (
                        <div className="flex items-center transition-all ml-1 lg:ml-2">
                            {!isSearchOpen ? (
                                <Button
                                    isIconOnly
                                    variant="ghost"
                                    onPress={() => setIsSearchOpen(true)}
                                    className="text-gray-500 hover:text-gray-900 rounded-full"
                                >
                                    <Search size={20} />
                                </Button>
                            ) : (
                                <div className="relative w-[240px] md:w-[320px] animate-appearance-in">
                                    <TextField aria-label="Tìm kiếm" className="w-full">
                                        <InputGroup className="bg-white border-gray-200 hover:border-blue-400 h-10 shadow-sm transition-colors rounded-full">
                                            <InputGroup.Prefix>
                                                <Search size={18} className="text-gray-400" />
                                            </InputGroup.Prefix>
                                            <InputGroup.Input
                                                autoFocus
                                                value={searchValue}
                                                onChange={(e) => setSearchValue(e.target.value)}
                                                placeholder="Tìm kiếm"
                                                className="text-[14px]"
                                            />
                                            <InputGroup.Suffix>
                                                <div className="flex items-center gap-1">
                                                    <Button isIconOnly size="sm" variant="ghost" className="text-gray-400 min-w-0 w-6 h-6 hover:text-gray-600" onPress={handleCloseSearch}>
                                                        <X size={14} />
                                                    </Button>
                                                </div>
                                            </InputGroup.Suffix>
                                        </InputGroup>
                                    </TextField>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="hidden">
                        {breadcrumb.length > 1 && (
                            <Breadcrumbs
                                separator="/"
                                className="text-gray-600 dark:text-gray-300 hidden md:flex"
                            >
                                {breadcrumb.map((item, index) => (
                                    <Breadcrumbs.Item
                                        key={index}
                                        onClick={item.onClick}
                                        className={`cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 text-xs ${item.isLast
                                            ? 'text-blue-500 dark:text-blue-400 font-medium cursor-default'
                                            : ''
                                            }`}
                                    >
                                        {item.label}
                                    </Breadcrumbs.Item>
                                ))}
                            </Breadcrumbs>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        isIconOnly
                        variant="ghost"
                        onPress={() => setMode(mode === 'light' ? 'dark' : 'light')}
                        className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hidden"
                    >
                        {mode === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                    </Button>

                    <OnlineUserGroup />
                    <NotificationDropdown />

                    <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <Popover.Trigger>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 h-auto rounded-full pr-3 transition-colors bg-transparent border-none min-w-0"
                            >
                                <UserAvatar
                                    src={user?.ql_nguoi_dung_avatar}
                                    name={user?.ql_nguoi_dung_ho_ten}
                                    size="sm"
                                />
                                <div className="hidden md:flex flex-col items-start leading-tight">
                                    <span className="font-bold text-gray-700 dark:text-gray-200 line-clamp-1 max-w-[150px]">
                                        {user?.ql_nguoi_dung_ho_ten || 'Người dùng'}
                                    </span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                                        {user?.ten_cong_viec || 'Nhân viên'}
                                    </span>
                                </div>
                            </Button>
                        </Popover.Trigger>
                        <Popover.Content placement="bottom end" className="p-0 overflow-hidden w-[95vw] sm:w-[380px] bg-[#f0f4f9] dark:bg-[#1f1f1f] rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border-none mt-1 sm:me-3">
                            <Popover.Dialog className="flex flex-col w-full p-0 pb-3 gap-0 items-center outline-none max-h-[85vh]">

                                <div className="absolute top-4 right-4 z-10">
                                    <Button size="sm" isIconOnly variant="ghost" className="rounded-full text-gray-500 hover:bg-black/5 dark:hover:bg-white/10" onPress={() => setIsPopoverOpen(false)}>
                                        <X size={20} className="stroke-[1.5px]" />
                                    </Button>
                                </div>

                                {/* Top Section */}
                                <div className="flex flex-col items-center justify-center pt-9 pb-3 px-6 w-full relative shrink-0">
                                    <div className="font-medium text-[14px] text-gray-900 dark:text-gray-100 mb-0.5 line-clamp-1">
                                        {user?.ql_nguoi_dung_ho_ten || 'Người dùng'}
                                    </div>
                                    <div className="text-[12px] text-gray-600 dark:text-gray-400 mb-4 line-clamp-1">
                                        Bảo mật bởi Hệ thống
                                    </div>

                                    <div className="relative">
                                        <UserAvatar
                                            src={user?.ql_nguoi_dung_avatar}
                                            name={user?.ql_nguoi_dung_ho_ten}
                                            size="lg"
                                            className="h-[76px] w-[76px] text-3xl bg-gray-500 text-white"
                                        />
                                    </div>

                                    <div className="text-[22px] font-normal text-gray-900 dark:text-gray-100 mt-4 mb-4 tracking-tight">
                                        Chào {user?.ql_nguoi_dung_ho_ten?.split(' ').pop() || 'bạn'},
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="rounded-full px-6 py-2 font-medium text-[#0b57d0] dark:text-[#a8c7fa] border border-gray-300 dark:border-gray-600 hover:bg-black/5 dark:hover:bg-white/5 min-h-0 h-[40px] text-[14px] transition-all bg-transparent"
                                        onPress={() => {
                                            profileModal.open()
                                            setIsPopoverOpen(false)
                                        }}
                                    >
                                        Quản lý Tài khoản của bạn
                                    </Button>
                                </div>

                                {/* Roles section */}
                                {roleOptions.length > 0 && (
                                    <div className="w-[calc(100%-20px)] mx-[10px] mt-2 bg-white dark:bg-[#282a2d] rounded-[24px] overflow-hidden flex flex-col shrink min-h-0 p-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-transparent dark:border-white/5">
                                        <div className="px-3 pt-2 pb-2 text-[12px] font-medium text-gray-600 dark:text-gray-400 shrink-0">
                                            Chuyển đổi vai trò
                                        </div>
                                        <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[160px] md:max-h-[220px]">
                                            {roleOptions.map((role) => (
                                                <Button
                                                    key={role.value}
                                                    variant="ghost"
                                                    className={`w-full justify-start items-center rounded-[18px] h-auto py-2.5 px-3 transition-colors shrink-0 ${activeRole === role.value ? 'bg-[#f0f4f9] dark:bg-[#3c4043]' : 'hover:bg-[#f8f9fa] dark:hover:bg-[#303134]'}`}
                                                    onPress={() => handleRoleChange(role.value)}
                                                >
                                                    <div className="flex items-center gap-3 w-full overflow-hidden">
                                                        <div className={`flex shrink-0 items-center justify-center h-[34px] w-[34px] rounded-full ${activeRole === role.value ? 'bg-[#0b57d0] text-white dark:bg-[#8ab4f8] dark:text-[#202124]' : 'bg-[#e9eef6] text-gray-700 dark:bg-[#3c4043] dark:text-gray-300'}`}>
                                                            {activeRole === role.value ? <Check size={18} strokeWidth={2.5} /> : <Users size={16} strokeWidth={2} />}
                                                        </div>
                                                        <div className="flex flex-col flex-1 text-left min-w-0">
                                                            <span className={`text-[14px] line-clamp-1 ${activeRole === role.value ? 'font-medium text-gray-900 dark:text-gray-100' : 'font-normal text-gray-700 dark:text-gray-300'}`}>
                                                                {role.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Logout section */}
                                <div className="w-[calc(100%-20px)] mx-[10px] mt-[10px] mb-3 bg-white dark:bg-[#282a2d] rounded-[24px] overflow-hidden flex shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-transparent dark:border-white/5 shrink-0">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-center text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#303134] rounded-[24px] h-[52px] text-[14px] font-medium transition-colors"
                                        onPress={handleLogout}
                                    >
                                        <LogOut size={18} className="mr-2 stroke-[2px]" />
                                        Đăng xuất
                                    </Button>
                                </div>

                                {/* Footer Policy */}
                                <div className="w-full pt-1 pb-1 text-center text-[12px] text-gray-500 dark:text-gray-400 font-medium shrink-0">
                                    Chính sách quyền riêng tư <span className="mx-1">•</span> Điều khoản dịch vụ
                                </div>
                            </Popover.Dialog>
                        </Popover.Content>
                    </Popover>

                </div>
            </div>
        </div>
    )
}

export default Header
