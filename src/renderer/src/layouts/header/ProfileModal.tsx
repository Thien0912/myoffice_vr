import { Button, Chip, ListBox, ListBoxItem, Modal, Skeleton, Spinner, Tooltip, Tabs } from '@heroui-v3/react'
import { nhanvientucapnhatAxios, YeuCauCapNhat } from '@renderer/api/hr/nhanvientucapnhatAxios'
import { profileAxios } from '@renderer/api/profileAxios'

import { HrDrawer, HrDrawerBody, HrDrawerHeader } from '@renderer/components/hero-custom'
import MinhChungPanel from '@renderer/pages/profile/components/MinhChungPanel'
import MinhChungCollector, { type CachedMinhChung, type MinhChungCollectorRef } from '@renderer/pages/profile/components/MinhChungCollector'
import ModalDetailYeuCau from '@renderer/pages/hr/nhanvientucapnhat/components/ModalDetailYeuCau'
import { SidePanelProvider, useSidePanel } from '@renderer/components/side-panel'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ChevronLeft, ChevronsRight, Clock, Images, X, XCircle } from 'lucide-react'
import React, { Suspense, useEffect, useState, useRef, useCallback, cloneElement, forwardRef, isValidElement, useImperativeHandle } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearCookiesAuth } from '@renderer/utils/cookieService'

import { useProfileModalStore } from '@renderer/store/useProfileModalStore'

import AccountSettingsSection from './components/AccountSettingsSection'
import AppearanceTabContent from './components/AppearanceTabContent'
import AppInfoTabContent from './components/AppInfoTabContent'
import NotificationsTabContent from './components/NotificationsTabContent'
import PersonalInfoSection from './components/PersonalInfoSection'
import ProfileSidebar from './components/ProfileSidebar'
import UpdateRequestSection from './components/UpdateRequestSection'
import SyncTabContent from './components/SyncTabContent'

/**
 * Bridge that clones config.content with live formData state.
 * Solves the stale-props issue where openPanel() freezes formData in the JSX element.
 * Exposes latest formData via ref to avoid per-keystroke context updates.
 */
interface FormContentBridgeHandle { getFormData: () => Record<string, any> }

const FormContentBridge = forwardRef<FormContentBridgeHandle, {
    content: React.ReactNode
    initialFormData: Record<string, any>
}>(function FormContentBridge({ content, initialFormData }, ref) {
    const [localFormData, setLocalFormData] = useState<Record<string, any>>(initialFormData)

    // Sync when parent passes new initialFormData (e.g., user clicked edit on a different item)
    useEffect(() => {
        setLocalFormData(initialFormData)
    }, [initialFormData])

    // Expose latest formData to parent via ref — no context re-renders
    useImperativeHandle(ref, () => ({ getFormData: () => localFormData }), [localFormData])

    const handleSetFormData: React.Dispatch<React.SetStateAction<Record<string, any>>> = useCallback((action) => {
        setLocalFormData((prev) => typeof action === 'function' ? action(prev) : action)
    }, [])

    // Clone the content element, overriding formData + setFormData props
    if (isValidElement(content) && content.props) {
        return <div className="px-2">{cloneElement(content as React.ReactElement<any>, { formData: localFormData, setFormData: handleSetFormData })}</div>
    }
    return <div className="px-2">{content}</div>
})

const SECTION_TITLE_MAP: Record<string, string> = {
    'section-9': 'Thêm chứng chỉ',
    'section-10': 'Thêm bằng cấp',
}

/** Outer shell — SidePanelProvider wraps the HrDrawer so useSidePanel() works inside */
export default function ProfileModal() {
    return (
        <SidePanelProvider>
            <ProfileModalInner />
        </SidePanelProvider>
    )
}

function ProfileModalInner() {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()
    const {
        isOpen,
        selectedTab,
        isUpdateDrawerOpen,
        close: onClose,
        setSelectedTab,
        setUpdateDrawerOpen: setIsUpdateDrawerOpen
    } = useProfileModalStore()

    const handleLogout = (): void => {
        onClose()
        clearCookiesAuth()
        logout()
        navigate('/login')
    }
    const TABS = [
        'profile',
        'security',
        'update-request',
        'appearance',
        'notifications',
        'app-info',
        'sync-data'
    ]
    // const [selectedTab, setSelectedTab] = useState<string | number>('profile')
    const direction = 0 // 1: up, -1: down (handled by store logic if needed, but keeping for now)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true)
    const [selectedRequest, setSelectedRequest] = useState<YeuCauCapNhat | null>(null)
    // const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = useState(false)
    const [isSecondaryOpen, setIsSecondaryOpen] = useState(true)
    const [activeSecondarySection, setActiveSecondarySection] = useState<string>('minh-chung')
    const [cachedMinhChung, setCachedMinhChung] = useState<CachedMinhChung[]>([])
    const [isUpdatePending, setIsUpdatePending] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const queryClient = useQueryClient()

    // Bridge SidePanel → HrDrawer secondary panel (mirror HosonhansuPage)
    const { config: sidePanelConfig, closePanel, setBridgedToDrawer, bridgedToDrawer, formDataRef, fileGroupsRef } = useSidePanel()
    const formBridgeRef = useRef<FormContentBridgeHandle>(null)
    const minhChungRef = useRef<MinhChungCollectorRef>(null)

    // Auto-open secondary panel when a child component opens a side panel (bridgedToDrawer=true)
    useEffect(() => {
        if (bridgedToDrawer && sidePanelConfig) {
            setIsSecondaryOpen(true)
            setActiveSecondarySection('form-edit')
        }
    }, [bridgedToDrawer, sidePanelConfig])

    const handleOpenSecondary = useCallback((sectionId: string) => {
        setActiveSecondarySection(sectionId)
        setIsSecondaryOpen(true)
        setBridgedToDrawer(true)
        window.dispatchEvent(new CustomEvent(`trigger-add-${sectionId}`))
    }, [setBridgedToDrawer])

    const handleCloseSecondary = useCallback(() => {
        if (activeSecondarySection !== 'minh-chung') {
            // Return to minh-chung panel
            setActiveSecondarySection('minh-chung')
        } else {
            setIsSecondaryOpen(false)
        }
        closePanel()
        setBridgedToDrawer(false)
    }, [activeSecondarySection, closePanel, setBridgedToDrawer])

    const handleSecondarySubmit = useCallback(async () => {
        if (!sidePanelConfig?.onSubmit) return
        setIsSubmitting(true)
        try {
            const fd = new FormData()
            // Read latest formData from bridge ref, then fallback to context ref
            const latestFormData = formBridgeRef.current?.getFormData() ?? formDataRef.current ?? {}
            Object.entries(latestFormData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    // Duck-type check for File/Blob — instanceof File fails across Electron contexts
                    const isFileOrBlob = (typeof Blob !== 'undefined' && value instanceof Blob) ||
                        (value && typeof value === 'object' && typeof value.name === 'string' && typeof value.arrayBuffer === 'function')
                    if (isFileOrBlob) {
                        fd.append(key, value) // Append as binary — JSON.stringify(File) === '{}'
                    } else {
                        fd.append(key, Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : String(value))
                    }
                }
            })
            Object.entries(fileGroupsRef.current).forEach(([fieldName, files]) => {
                files.forEach((f) => fd.append(fieldName, f))
            })
            const onSuccess = sidePanelConfig.onSubmitSuccess
            const response = await sidePanelConfig.onSubmit(sidePanelConfig.idSubmitApi, fd)
            if (response.success) {
                handleCloseSecondary()
                // Import toast dynamically to avoid circular
                const { toast } = await import('@heroui-v3/react')
                toast('Thành công', { description: response.message || 'Dữ liệu đã được lưu thành công.', variant: 'success' })
                onSuccess?.(response)
            } else {
                const { toast } = await import('@heroui-v3/react')
                const errorMessage = typeof response.error === 'object' ? Object.values(response.error as Record<string, string[]>).flat().join(',') : response.message
                toast('Lỗi', { description: errorMessage || 'Gửi dữ liệu thất bại.', variant: 'danger', timeout: 5000 })
            }
        } catch {
            const { toast } = await import('@heroui-v3/react')
            toast('Lỗi', { description: 'Gửi dữ liệu thất bại.', variant: 'danger' })
        } finally {
            setIsSubmitting(false)
        }
    }, [sidePanelConfig, handleCloseSecondary, formDataRef, fileGroupsRef])

    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false)
    useEffect(() => {
        const checkMobile = () => {
            if (typeof window !== 'undefined') {
                setIsMobile(window.innerWidth < 768)
            }
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])



    const UpdateProfilePage = React.useMemo(
        () => React.lazy(() => import('@renderer/pages/profile/UpdateProfilePage')),
        []
    )

    const FIELD_LABELS: Record<string, string> = {
        ho_va_ten: 'Họ và tên',
        ngay_sinh: 'Ngày sinh',
        gioi_tinh: 'Giới tính',
        so_dien_thoai: 'Số điện thoại',
        email: 'Email',
        mst_ca_nhan: 'Mã số thuế cá nhân',
        cccd_so: 'Số CCCD',
        cccd_noi_cap: 'Nơi cấp CCCD',
        cccd_ngay_cap: 'Ngày cấp CCCD',
        cccd_ngay_het_han: 'Ngày hết hạn CCCD',
        ho_chieu_so: 'Số hộ chiếu',
        ho_chieu_noi_cap: 'Nơi cấp hộ chiếu',
        ho_chieu_ngay_cap: 'Ngày cấp hộ chiếu',
        ho_chieu_ngay_het_han: 'Ngày hết hạn hộ chiếu',
        id_don_vi_cong_tac: 'Đơn vị công tác',
        id_vi_tri_cong_viec: 'Chức vụ',
        id_dan_toc: 'Dân tộc',
        id_ton_giao: 'Tôn giáo',
        id_quoc_tich: 'Quốc tịch',
        que_quan: 'Quê quán',
        hktt_dia_chi: 'Địa chỉ HKTT',
        hktt_so_nha: 'Số nhà HKTT',
        cohn_dia_chi: 'Địa chỉ hiện tại',
        cohn_so_nha: 'Số nhà hiện tại',
        trinh_do_vh: 'Trình độ văn hóa',
        hoc_ham: 'Học hàm',
        trinh_do_dt: 'Học vị',
        noi_dt: 'Nơi đào tạo',
        nganh_dt: 'Chuyên ngành',
        avatar: 'Ảnh đại diện',
        lhkc_ho_ten: 'Liên hệ KC - Họ tên',
        lhkc_quan_he: 'Liên hệ KC - Quan hệ',
        lhkc_sdt_di_dong: 'Liên hệ KC - SĐT',
        lhkc_email: 'Liên hệ KC - Email',
        bang_cap: 'Bằng cấp',
        chung_chi: 'Chứng chỉ',
        minh_chung: 'Minh chứng'
    }

    const handleTabChange = (key: string | number) => {
        // const currentIndex = TABS.indexOf(selectedTab as string)
        // const nextIndex = TABS.indexOf(key as string)
        // setDirection(nextIndex > currentIndex ? 1 : -1)
        setSelectedTab(String(key))
        setIsMobileMenuOpen(false)
    }

    const [isAnimating, setIsAnimating] = useState(false)
    React.useEffect(() => {
        let timer: NodeJS.Timeout
        if (isOpen) {
            setIsAnimating(true)
            timer = setTimeout(() => setIsAnimating(false), 250)
        }
        return () => {
            if (timer) clearTimeout(timer)
        }
    }, [isOpen])

    // Fetch personnel info
    const { data: personnelData, isLoading: isLoadingPersonnel } = useQuery({
        queryKey: ['personnel-info', user?.ql_nguoi_dung_id],
        queryFn: async () => {
            // Sử dụng profileAxios.getProfile để lấy thông tin chính xác của người dùng hiện tại
            const res: any = await profileAxios.getProfile()

            if (res?.success && res?.data) {
                return res.data
            }
            return null
        },
        enabled: isOpen && !!user && !isAnimating,
        staleTime: 5 * 60 * 1000
    })

    // Fetch user's own update requests
    const { data: myRequests = [], isLoading: isLoadingRequests } = useQuery({
        queryKey: ['my-update-requests', personnelData?.ma_nhan_vien],
        queryFn: async () => {
            const res = await nhanvientucapnhatAxios.fetch({
                searchValue: personnelData?.ma_nhan_vien,
                searchKey: JSON.stringify({ searchValue: personnelData?.ma_nhan_vien }),
                start: 0,
                length: 20
            })
            return res?.data || []
        },
        enabled: isOpen && !!personnelData?.ma_nhan_vien && selectedTab === 'update-request' && !isAnimating,
        staleTime: 0
    })

    const getTitle = () => {
        switch (selectedTab) {
            case 'profile':
                return 'Hồ sơ người dùng'
            case 'security':
                return 'Bảo mật & Tài khoản'
            case 'update-request':
                return 'Yêu cầu cập nhật thông tin'
            case 'appearance':
                return 'Giao diện & Hiển thị'
            case 'notifications':
                return 'Các thông báo'
            case 'app-info':
                return 'Thông tin ứng dụng'
            case 'sync-data':
                return 'Đồng bộ dữ liệu'
            default:
                return 'Cài đặt'
        }
    }

    const renderContent = () => {
        if (isAnimating && isMobile) {
            return (
                <div className="w-full h-full flex items-center justify-center min-h-[300px]">
                    <Spinner size="lg" color="current" />
                </div>
            )
        }
        switch (selectedTab) {
            case 'profile':
                if (isLoadingPersonnel) {
                    return (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <Skeleton className="w-24 h-4 rounded-lg" />
                            </div>
                            <div className="bg-white dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-4">
                                <Skeleton className="w-full h-12 rounded-lg" />
                                <Skeleton className="w-full h-12 rounded-lg" />
                                <Skeleton className="w-full h-12 rounded-lg" />
                            </div>
                        </div>
                    )
                }
                return (
                    <PersonalInfoSection
                        user={personnelData || user}
                    />
                )
            case 'security':
                return <AccountSettingsSection user={user} />
            case 'update-request':
                return (
                    <UpdateRequestSection
                        myRequests={myRequests}
                        isLoadingRequests={isLoadingRequests}
                        onOpenRequest={(req) => {
                            setIsUpdateDrawerOpen(false)
                            setSelectedRequest(req)
                        }}
                    />
                )
            case 'appearance':
                return <AppearanceTabContent />
            case 'notifications':
                return <NotificationsTabContent />
            case 'app-info':
                return <AppInfoTabContent />
            case 'sync-data':
                return <SyncTabContent />
            default:
                return null
        }
    }

    const variants = {
        initial: (direction: number) => ({
            opacity: 0,
            y: direction > 0 ? 20 : -20
        }),
        animate: {
            opacity: 1,
            y: 0
        },
        exit: (direction: number) => ({
            opacity: 0,
            y: direction > 0 ? -20 : 20
        })
    }


    // React Aria focus-trap is naturally handled now because Modal.Backdrop hides when the Drawer is open.
    const isAnyDrawerOpen = isUpdateDrawerOpen || !!selectedRequest

    return (
        <>
            <Modal.Backdrop
                isOpen={isOpen && !isAnyDrawerOpen}
                onOpenChange={(open) => {
                    if (!open) onClose()
                }}
                isDismissable={false}
            >
                <Modal.Container
                    placement={isMobile ? "bottom" : "center"}
                    size="lg"
                    className="z-40" // Ensure it's below drawers (z-50) just in case during exit animation
                >
                    <Modal.Dialog className={`p-0 w-full max-w-[1024px]! pb-0 overflow-hidden transform-gpu will-change-transform ${isMobile ? 'absolute bottom-0 m-0! rounded-b-none! rounded-t-[32px]!' : 'rounded-2xl!'}`}>
                        <Modal.Body className="p-0 gap-0">
                            <div className="flex flex-col h-[90vh] md:h-[700px] w-full relative transition-colors">
                                {/* Mobile Drag Handle */}
                                <div className="md:hidden w-full flex justify-center pt-3 pb-1 shrink-0 bg-white dark:bg-gray-900 z-50">
                                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
                                </div>

                                <div className="flex flex-1 overflow-hidden relative bg-white dark:bg-gray-900">
                                    {/* Drawer-open overlay: blocks all interaction with modal content */}
                                    {isAnyDrawerOpen && (
                                        <div
                                            className="absolute inset-0 z-30 bg-black/10 dark:bg-black/20 backdrop-blur-[1px]"
                                            aria-hidden="true"
                                        />
                                    )}
                                    {isMobile ? (
                                        <div className="flex-1 relative overflow-hidden bg-white dark:bg-gray-900">
                                            {/* MOBILE VIEW */}
                                            <AnimatePresence initial={false} mode="wait">
                                                {isMobileMenuOpen ? (
                                                    <motion.div
                                                        key="mobile-menu"
                                                        initial={{ x: '-100%' }}
                                                        animate={{ x: 0 }}
                                                        exit={{ x: '-100%' }}
                                                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                                                        className="absolute inset-0 w-full h-full z-10 bg-white dark:bg-gray-900 flex flex-col overflow-hidden"
                                                    >
                                                        <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-gray-100 dark:border-gray-800">
                                                            <span className="font-bold text-gray-800 dark:text-white">Cài đặt</span>
                                                            <Button isIconOnly variant="ghost" onPress={onClose}>
                                                                <X />
                                                            </Button>
                                                        </div>
                                                        <ProfileSidebar
                                                            user={user}
                                                            selectedTab={selectedTab}
                                                            setSelectedTab={handleTabChange}
                                                            handleLogout={handleLogout}
                                                        />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="mobile-content"
                                                        initial={{ x: '100%' }}
                                                        animate={{ x: 0 }}
                                                        exit={{ x: '100%' }}
                                                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                                                        className="absolute inset-0 w-full h-full z-20 transform-gpu bg-white dark:bg-gray-900 flex flex-col"
                                                    >
                                                        <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-100 dark:border-gray-800 shrink-0">
                                                            <Button
                                                                isIconOnly
                                                                variant="ghost"
                                                                className="text-gray-500"
                                                                onPress={() => setIsMobileMenuOpen(true)}
                                                            >
                                                                <ChevronLeft />
                                                            </Button>
                                                            <span className="font-bold text-gray-800 dark:text-white flex-1 truncate">
                                                                {getTitle()}
                                                            </span>
                                                            {selectedTab === 'profile' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onPress={() => setSelectedTab('update-request')}
                                                                >
                                                                    Gửi yêu cầu chỉnh sửa
                                                                </Button>
                                                            )}
                                                            {selectedTab === 'update-request' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onPress={() => {
                                                                        setSelectedRequest(null)
                                                                        setIsUpdateDrawerOpen(true)
                                                                    }}
                                                                >
                                                                    Tạo yêu cầu
                                                                </Button>
                                                            )}
                                                            <Button isIconOnly variant="ghost" onPress={onClose}>
                                                                <X />
                                                            </Button>
                                                        </div>
                                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
                                                            {renderContent()}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        <div className="flex flex-row flex-1 w-full translate-z-0">
                                            {/* DESKTOP VIEW */}
                                            <div className="w-64 border-r border-gray-100 dark:border-gray-800 shrink-0">
                                                <ProfileSidebar
                                                    user={user}
                                                    selectedTab={selectedTab}
                                                    setSelectedTab={handleTabChange}
                                                    handleLogout={handleLogout}
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-white dark:bg-gray-900">
                                                {/* Local Header inside Right Panel */}
                                                <div className="flex items-center justify-between px-4 md:px-6 h-16 shrink-0 border-b border-gray-100/50 dark:border-gray-800/50">
                                                    <h2 className="text-base font-semibold text-gray-800 dark:text-white">
                                                        {getTitle()}
                                                    </h2>
                                                    <div className="flex items-center gap-2">
                                                        {selectedTab === 'profile' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onPress={() => setSelectedTab('update-request')}
                                                            >
                                                                Gửi yêu cầu chỉnh sửa
                                                            </Button>
                                                        )}
                                                        {selectedTab === 'update-request' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onPress={() => {
                                                                    setSelectedRequest(null)
                                                                    setIsUpdateDrawerOpen(true)
                                                                }}
                                                            >
                                                                Tạo yêu cầu
                                                            </Button>
                                                        )}
                                                        <Button
                                                            isIconOnly
                                                            variant="ghost"
                                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 min-w-8 w-8 h-8 transition-colors"
                                                            onPress={onClose}
                                                        >
                                                            <X />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 custom-scrollbar">
                                                    <AnimatePresence mode="wait" custom={direction}>
                                                        <motion.div
                                                            key={selectedTab}
                                                            custom={direction}
                                                            variants={variants}
                                                            initial="initial"
                                                            animate="animate"
                                                            exit="exit"
                                                            transition={{ duration: 0.2, ease: 'easeOut' }}
                                                            className="transform-gpu space-y-10"
                                                        >
                                                            {renderContent()}
                                                        </motion.div>
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Modal.Body>

                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>

            {/* Request Detail Drawer — render OUTSIDE Modal.Backdrop to avoid focus trap */}
            {selectedRequest && (
                <ModalDetailYeuCau
                    isOpen={!!selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    id_nhan_vien={selectedRequest.id_nhan_vien}
                    id_yeu_cau_cap_nhat={selectedRequest.id_yeu_cau_cap_nhat}
                    variant="drawer"
                    blockOutside
                />
            )}

            {/* Update Profile Drawer — render OUTSIDE Modal.Backdrop */}
            <HrDrawer
                isOpen={isUpdateDrawerOpen}
                placement="right"
                backdrop="blur"
                blockOutside
                isDismissable={true}
                onClose={() => {
                    setIsUpdateDrawerOpen(false)
                    // Cleanup cached data on drawer close
                    setCachedMinhChung([])
                }}
                defaultWidth={1000}
                maxWidth={2400}
                isSecondaryOpen={isSecondaryOpen}
                onSecondaryClose={handleCloseSecondary}
                secondaryTitle={
                    activeSecondarySection === 'minh-chung'
                        ? 'Hình ảnh minh chứng so sánh'
                        : sidePanelConfig?.title || (activeSecondarySection ? SECTION_TITLE_MAP[activeSecondarySection] || 'Thêm mới' : 'Thêm mới')
                }
                secondaryWidth={420}
                classNames={{ secondaryBody: 'p-0' }}
                secondaryContent={
                    isSecondaryOpen && !isUpdatePending && (personnelData?.id_nhan_vien || user?.id_nhan_vien) ? (
                        activeSecondarySection === 'minh-chung' ? (
                            // Tab panel: Hiện tại + Đính kèm mới
                            <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900 overflow-hidden">
                                <Tabs className="w-full h-full flex flex-col flex-1 gap-0! bg-white dark:bg-gray-900 overflow-hidden relative" defaultSelectedKey="existing" variant="secondary">
                                    <div className="shrink-0 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-40">
                                        <Tabs.ListContainer className="bg-transparent">
                                            <Tabs.List aria-label="Hình ảnh minh chứng" className="gap-0 pl-0 pr-0 w-full flex border-0">
                                                <Tabs.Tab id="existing" className="h-14 px-0 text-sm font-semibold max-w-fit relative data-[selected=true]:text-blue-600 text-gray-500 hover:text-gray-700 transition-colors duration-200 ease-in-out">
                                                    <div className="flex items-center gap-2 px-6 h-full whitespace-nowrap">
                                                        <span>Hiện tại</span>
                                                    </div>
                                                    <Tabs.Indicator className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-none w-full" />
                                                </Tabs.Tab>
                                                <Tabs.Tab id="upload" className="h-14 px-0 text-sm font-semibold max-w-fit relative data-[selected=true]:text-blue-600 text-gray-500 hover:text-gray-700 transition-colors duration-200 ease-in-out">
                                                    <div className="flex items-center gap-2 px-6 h-full whitespace-nowrap">
                                                        <span>Đính kèm mới {cachedMinhChung.length > 0 ? `(${cachedMinhChung.reduce((acc, g) => acc + g.files.length, 0)})` : ''}</span>
                                                    </div>
                                                    <Tabs.Indicator className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-none w-full" />
                                                </Tabs.Tab>
                                            </Tabs.List>
                                        </Tabs.ListContainer>
                                    </div>
                                    <Tabs.Panel id="existing" className="flex-1 overflow-hidden p-0 relative">
                                        <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6">
                                            <MinhChungPanel
                                                idNhanVien={personnelData?.id_nhan_vien || user?.id_nhan_vien}
                                                readOnly
                                                maNhanVien={personnelData?.ma_nhan_vien}
                                            />
                                        </div>
                                    </Tabs.Panel>
                                    <Tabs.Panel id="upload" className="flex-1 overflow-hidden p-0 relative">
                                        <div className="absolute inset-0 overflow-y-auto custom-scrollbar px-6" style={{ containerType: 'inline-size' }}>
                                            <MinhChungCollector ref={minhChungRef} value={cachedMinhChung} onChange={setCachedMinhChung} />
                                        </div>
                                    </Tabs.Panel>
                                </Tabs>
                            </div>
                        ) : sidePanelConfig?.content ? (
                            // Form content from SidePanel (Thêm chứng chỉ / Thêm bằng cấp)
                            <FormContentBridge
                                ref={formBridgeRef}
                                content={sidePanelConfig.content}
                                initialFormData={sidePanelConfig.formData ?? {}}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-32">
                                <Spinner size="sm">Đang tải form...</Spinner>
                            </div>
                        )
                    ) : undefined
                }
                secondaryFooter={
                    isSecondaryOpen && activeSecondarySection !== 'minh-chung' && sidePanelConfig?.onSubmit ? (
                        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200">
                            <Button variant="ghost" onPress={handleCloseSecondary} isDisabled={isSubmitting}>Hủy</Button>
                            <Button variant="primary" onPress={handleSecondarySubmit} isDisabled={isSubmitting}>{isSubmitting ? <Spinner size="sm" /> : 'L\u01b0u'}</Button>
                        </div>
                    ) : undefined
                }
            >
                <HrDrawerHeader>
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                        <Tooltip delay={0}>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="ghost"
                                onPress={() => setIsUpdateDrawerOpen(false)}
                            >
                                <ChevronsRight size={18} />
                            </Button>
                            <Tooltip.Content placement="left" className="capitalize bg-slate-100 text-slate-800">
                                <p>Đóng</p>
                            </Tooltip.Content>
                        </Tooltip>
                        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Cập nhật thông tin cá nhân
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        {!isSecondaryOpen && !isUpdatePending && (
                            <Tooltip delay={0}>
                                <Button
                                    isIconOnly
                                    variant="secondary"
                                    size="sm"
                                    className="rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/60"
                                    onPress={() => { setIsSecondaryOpen(true); setActiveSecondarySection('minh-chung') }}
                                >
                                    <Images size={18} />
                                </Button>
                                <Tooltip.Content placement="bottom" className="capitalize bg-slate-100 text-slate-800">
                                    <p>Hiện minh chứng</p>
                                </Tooltip.Content>
                            </Tooltip>
                        )}
                        <Button
                            isIconOnly
                            variant="ghost"
                            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                            onPress={() => setIsUpdateDrawerOpen(false)}
                        >
                            <X size={20} />
                        </Button>
                    </div>
                </HrDrawerHeader>
                <HrDrawerBody className="p-0! overflow-hidden h-full bg-gray-100">
                    {isUpdateDrawerOpen && (
                        <Suspense
                            fallback={
                                <div className="flex h-full w-full items-center justify-center">
                                    <div className="flex items-center gap-2">
                                        <Spinner color="current" />
                                        <span>Đang tải...</span>
                                    </div>
                                </div>
                            }
                        >
                            <UpdateProfilePage
                                id={user?.id_nhan_vien}
                                isDrawer
                                cachedMinhChung={cachedMinhChung}
                                setCachedMinhChung={setCachedMinhChung}
                                minhChungRef={minhChungRef}
                                onOpenSecondary={handleOpenSecondary}
                                onPendingStateChange={(isPending) => {
                                    setIsUpdatePending(isPending)
                                    if (isPending) setIsSecondaryOpen(false)
                                }}
                                onClose={() => {
                                    setIsUpdateDrawerOpen(false)
                                    setIsUpdatePending(false)
                                    queryClient.invalidateQueries({ queryKey: ['my-update-requests'] })
                                }}
                            />
                        </Suspense>
                    )}
                </HrDrawerBody>
            </HrDrawer>

        </>
    )
}
