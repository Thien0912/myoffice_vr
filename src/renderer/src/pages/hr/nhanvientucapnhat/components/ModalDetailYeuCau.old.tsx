import {
    Button,
    Card,
    cn,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    Tooltip
} from '@heroui/react'

import { mapTinhThanhAxios } from '@renderer/api/danhmuc/dtqgtg'
import { NhansuAxios } from '@renderer/api/danhmuc/nhansuAxios'
import BackToTop from '@renderer/components/BackToTop'
import { DrawerCustom, DrawerHeaderCustom } from '@renderer/components/DrawerCustom'
import { HrInput } from '@renderer/components/hero-custom'
import { FormCollapse } from '@renderer/pages/profile/components/FormCollapse'
import { getAvatarUrl } from '@renderer/utils/urlUtils'
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    Clock,
    Phone,
    RotateCw,
    User,
    X,
    XCircle
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

interface ModalDetailYeuCauProps {
    isOpen: boolean
    onClose: () => void
    id_nhan_vien: string | number
    id_yeu_cau_cap_nhat: string | number
    onApprove?: () => void
    onReject?: () => void
    isApproving?: boolean
    isRejecting?: boolean
    variant?: 'modal' | 'drawer'
}



export default function ModalDetailYeuCau({
    isOpen,
    onClose,
    id_nhan_vien,
    id_yeu_cau_cap_nhat,
    onApprove,
    onReject,
    isApproving = false,
    isRejecting = false,
    variant = 'modal'
}: ModalDetailYeuCauProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [masterData, setMasterData] = useState<any>({
        donVi: [],
        viTri: [],
        danToc: [],
        quocGia: [],
        tonGiao: [],
        tinh: []
    })
    const [activeTab, setActiveTab] = useState(1)
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
    const [avatarError, setAvatarError] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const isScrollingRef = useRef(false)

    const drawerBodyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen && id_nhan_vien && id_yeu_cau_cap_nhat) {
            setAvatarError(false)
            loadAllData()
        }
    }, [isOpen, id_nhan_vien, id_yeu_cau_cap_nhat])

    useEffect(() => {
        if (isLoading || !scrollRef.current) return

        let debounceTimer: ReturnType<typeof setTimeout> | null = null

        const handleScroll = () => {
            if (isScrollingRef.current) return
            if (debounceTimer) clearTimeout(debounceTimer)
            debounceTimer = setTimeout(() => {
                const container = scrollRef.current
                if (!container) return
                const scrollTop = container.scrollTop
                const sections = container.querySelectorAll('[id^="section-"]')
                let closestId = 1
                let closestDist = Infinity
                sections.forEach((section) => {
                    const el = section as HTMLElement
                    const dist = Math.abs(el.offsetTop - container.offsetTop - scrollTop)
                    if (dist < closestDist) {
                        closestDist = dist
                        closestId = parseInt(el.id.replace('section-', ''))
                    }
                })
                setActiveTab(closestId)
            }, 80)
        }

        const container = scrollRef.current
        container.addEventListener('scroll', handleScroll, { passive: true })

        return () => {
            container.removeEventListener('scroll', handleScroll)
            if (debounceTimer) clearTimeout(debounceTimer)
        }
    }, [isLoading])

    const scrollToSection = (sectionId: number) => {
        setActiveTab(sectionId)
        isScrollingRef.current = true
        const element = document.getElementById(`section-${sectionId}`)
        if (element && scrollRef.current) {
            const container = scrollRef.current
            const elementTop = element.offsetTop - container.offsetTop
            container.scrollTo({
                top: elementTop - 8,
                behavior: 'smooth'
            })
            setTimeout(() => {
                isScrollingRef.current = false
            }, 600)
        }
    }

    const loadAllData = async () => {
        setIsLoading(true)
        try {
            const [
                detailRes,
                donViRes,
                viTriRes,
                danTocRes,
                quocGiaRes,
                tonGiaoRes,
                tinhRes
            ] = await Promise.all([
                NhansuAxios.getDetailRequest(id_nhan_vien, id_yeu_cau_cap_nhat),
                getDonVi(),
                getVitricongviec(),
                getDantoc(),
                getQuocgia(),
                getTongiao(),
                mapTinhThanhAxios()
            ])

            if (detailRes.success) {
                setData(detailRes.data)
            }

            setMasterData({
                donVi: donViRes.data || [],
                viTri: viTriRes.data || [],
                danToc: danTocRes.data || [],
                quocGia: quocGiaRes.data || [],
                tonGiao: tonGiaoRes.data || [],
                tinh: (tinhRes || []).map((t: any) => ({ id: String(t.value), name: t.label }))
            })
        } catch (error) {
            console.error('Error loading detail:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getDonVi = async () => {
        return NhansuAxios
            .fetch({
                action: 'get_category_data',
                table: 'e_don_vi',
                length: 9999,
            })
    }

    const getVitricongviec = async () => {
        return NhansuAxios
            .fetch({
                action: 'get_category_data',
                table: 'hrm_vi_tri_cong_viec',
                length: 9999,
            })
    }

    const getDantoc = async () => {
        return NhansuAxios
            .fetch({
                action: 'get_category_data',
                table: 'dm_dan_toc',
                length: 9999,
            })
    }

    const getQuocgia = async () => {
        return NhansuAxios
            .fetch({
                action: 'get_category_data',
                table: 'dm_quoc_gia',
                length: 9999,
            })
    }

    const getTongiao = async () => {
        return NhansuAxios
            .fetch({
                action: 'get_category_data',
                table: 'dm_ton_giao',
                length: 9999,
            })
    }

    const requestedData = useMemo(() => {
        if (!data?.yeu_cau_cap_nhat?.du_lieu) return {}
        try {
            return JSON.parse(data.yeu_cau_cap_nhat.du_lieu)
        } catch {
            return {}
        }
    }, [data])

    const getValueLabel = (field: string, value: any) => {
        if (value === null || value === undefined || value === '') return ''

        switch (field) {
            case 'id_don_vi_cong_tac':
            case 'id_don_vi':
                return masterData.donVi.find((d: any) => String(d.id_don_vi) === String(value))?.ten_don_vi || value
            case 'id_vi_tri_cong_viec':
                return masterData.viTri.find((v: any) => String(v.id_vi_tri_cong_viec) === String(value))?.ten_cong_viec || value
            case 'id_dan_toc':
                return masterData.danToc.find((d: any) => String(d.id_dan_toc) === String(value))?.ten || value
            case 'id_ton_giao':
                return masterData.tonGiao.find((t: any) => String(t.id_ton_giao) === String(value))?.ten || value
            case 'id_quoc_tich':
            case 'hktt_id_quoc_gia':
            case 'cohn_id_quoc_gia':
                return masterData.quocGia.find((q: any) => String(q.id_quoc_gia) === String(value))?.ten || value
            case 'hktt_id_tinh_tp':
            case 'cohn_id_tinh_tp':
            case 'ten_tinh_cap':
                return masterData.tinh.find((t: any) => String(t.id) === String(value))?.name || value
            case 'gioi_tinh':
                if (String(value) === '1') return 'Nam'
                if (String(value) === '2') return 'Nữ'
                return value
            case 'ngay_sinh':
            case 'cccd_ngay_cap':
            case 'cccd_ngay_het_han':
            case 'ho_chieu_ngay_cap':
            case 'ho_chieu_ngay_het_han':
                if (typeof value === 'string' && value.includes('-')) {
                    const parts = value.split('T')[0].split('-')
                    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
                }
                return value
            default:
                return value
        }
    }

    // Helper: resolve requested change value for a field (with aliases)
    const getChangeVal = (field: string) => {
        let newVal = requestedData[field]
        if (newVal === undefined) {
            if (field === 'id_don_vi_cong_tac') newVal = requestedData['id_don_vi']
            if (field === 'id_vi_tri_cong_viec') newVal = requestedData['id_chuc_vu']
        }
        return newVal
    }

    // Wrapper: shows yellow change badge below any form component
    const ChangeIndicator = ({ field, fullWidth, xlClassName, children }: {
        field: string, fullWidth?: boolean, xlClassName?: string, children: React.ReactNode
    }) => {
        const newVal = getChangeVal(field)
        const hasChange = newVal !== undefined
        return (
            <div className={cn("relative", fullWidth && "md:col-span-2", xlClassName)}>
                <div className={cn(hasChange && "[&_.group]:border-warning-400! [&_.group]:border-2! [&_.group]:rounded-xl!")}>
                    {children}
                </div>
                {hasChange && (
                    <div className="absolute left-1 -bottom-2.5 z-10 scale-90 origin-left">
                        <div className="flex items-center gap-1.5 px-3 py-0.5 bg-[#ffbe0b] rounded-full text-black font-bold text-[11px] shadow-sm">
                            <RotateCw size={11} className="animate-spin-slow shrink-0" />
                            <span>{getValueLabel(field, newVal)}</span>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const CheckboxDisplay = ({ label, field, currentVal, fullWidth, xlClassName }: { label: string, field: string, currentVal: any, fullWidth?: boolean, xlClassName?: string }) => {
        const newVal = requestedData[field]
        const hasChange = newVal !== undefined
        const isChecked = Boolean(currentVal)

        return (
            <div className={cn("flex flex-col gap-1", fullWidth && "md:col-span-2", xlClassName)}>
                <div className={cn(
                    "flex items-center gap-2 p-2 px-3.5 border border-[#c4c4c4] rounded bg-gray-50/30 min-h-14",
                    hasChange && "border-yellow-300! ring-1 ring-yellow-100"
                )}>
                    <div className={cn(
                        "w-4 h-4 border rounded flex items-center justify-center transition-colors",
                        isChecked ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                    )}>
                        {isChecked && <div className="w-2 h-2 bg-white rounded-sm" />}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                </div>
                {hasChange && (
                    <div className="flex px-1 scale-90 origin-left">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#ffbe0b] rounded-full text-black font-bold text-[11px]">
                            <RotateCw size={10} className="animate-spin-slow" />
                            <span>{Boolean(newVal) ? 'Thay đổi sang: Có' : 'Thay đổi sang: Không'}</span>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const STEPS = [
        { id: 1, title: 'Thông tin chung', icon: User },
        { id: 2, title: 'Thông tin liên hệ', icon: Phone }
    ]


    if (isLoading && variant === 'modal') return (
        <Spinner size="lg" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    )

    if (isLoading && variant === 'drawer') {
        return (
            <DrawerCustom
                open={isOpen}
                position="right"
                onClose={onClose}
                width={1200}
                zIndex={60}
                usePortal={false}
            >
                <DrawerHeaderCustom>
                    <div className="flex items-center gap-1">
                        <Tooltip
                            content="Đóng"
                            className="capitalize bg-slate-100"
                            radius="none"
                            placement="left"
                        >
                            <Button
                                isIconOnly
                                startContent={<ChevronsRight size={18} />}
                                size="sm"
                                variant="light"
                                onPress={onClose}
                            />
                        </Tooltip>
                        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Đang tải...</span>
                    </div>
                    <Button
                        isIconOnly
                        variant="light"
                        radius="full"
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        onPress={onClose}
                    >
                        <X size={20} />
                    </Button>
                </DrawerHeaderCustom>
                <div className="flex-1 flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
            </DrawerCustom>
        )
    }

    // Shared content for both modal and drawer
    const renderBody = () => (
        <div className={cn("flex h-full gap-2", variant === 'drawer' ? 'p-0' : 'p-0')}>
            {/* Sidebar - hidden in drawer variant */}
            {variant !== 'drawer' && (
                <div
                    style={{ width: isSidebarExpanded ? 280 : 80 }}
                    className="h-full p-2 shrink-0 flex flex-col gap-4 overflow-hidden sticky top-0 transition-[width] duration-300 ease-in-out"
                >
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                        <div className="flex items-center justify-center mb-6">
                            <Button
                                isIconOnly={!isSidebarExpanded}
                                variant="light"
                                size="md"
                                onPress={() => setIsSidebarExpanded(!isSidebarExpanded)}
                                className={cn(
                                    "text-gray-400 hover:text-blue-600 transition-all duration-300",
                                    isSidebarExpanded ? "w-full justify-start gap-3 px-4 h-12 rounded-xl" : "w-12 h-12 rounded-xl justify-center"
                                )}
                                startContent={isSidebarExpanded ? <ChevronLeft size={22} /> : undefined}
                            >
                                {!isSidebarExpanded ? <ChevronRight size={22} /> : (
                                    <span className="font-medium text-[13px] whitespace-nowrap">Thu nhỏ menu</span>
                                )}
                            </Button>
                        </div>

                        <div className={cn("flex flex-col gap-2", !isSidebarExpanded && "items-center")}>
                            {STEPS.map((step) => {
                                const Icon = step.icon
                                const isActive = step.id === activeTab
                                return (
                                    <Tooltip
                                        key={step.id}
                                        content={step.title}
                                        placement="right"
                                        color="primary"
                                        closeDelay={0}
                                        isDisabled={isSidebarExpanded}
                                    >
                                        <div
                                            className={cn(
                                                "flex items-center rounded-xl cursor-pointer transition-all duration-300",
                                                isSidebarExpanded ? "w-full gap-3 px-4 py-2.5" : "w-12 h-12 justify-center",
                                                isActive
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                                    : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600"
                                            )}
                                            onClick={() => scrollToSection(step.id)}
                                        >
                                            <Icon size={22} className="shrink-0" />
                                            {isSidebarExpanded && (
                                                <span className="font-medium text-[13px] whitespace-nowrap">
                                                    {step.title}
                                                </span>
                                            )}
                                        </div>
                                    </Tooltip>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {variant === 'drawer' && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    [data-drawer-form] {
                        container-type: inline-size;
                        overflow-x: hidden;
                    }
                    [data-drawer-form] .grid > * { min-width: 0; }
                    @container (max-width: 899px) {
                        [data-drawer-form] .grid.xl\\:grid-cols-4 { grid-template-columns: 1fr !important; }
                        [data-drawer-form] .xl\\:col-span-3,
                        [data-drawer-form] .xl\\:col-span-1 { grid-column: span 1 / span 1 !important; }
                        [data-drawer-form] .xl\\:order-none { order: -1 !important; }
                        [data-drawer-form] .xl\\:flex-col { flex-direction: row !important; }
                        [data-drawer-form] .xl\\:gap-2 { gap: 0.75rem !important; }
                        [data-drawer-form] .hidden.xl\\:inline { display: none !important; }
                        [data-drawer-form] .xl\\:hidden { display: inline !important; }
                    }
                    @container (max-width: 767px) {
                        [data-drawer-form] .grid.lg\\:grid-cols-2 { grid-template-columns: 1fr !important; }
                    }
                    @container (max-width: 399px) {
                        [data-drawer-form] .grid.md\\:grid-cols-2 { grid-template-columns: minmax(0, 1fr) !important; }
                        [data-drawer-form] .grid.md\\:grid-cols-3 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                        [data-drawer-form] .grid.form-col-4 { grid-template-columns: minmax(0, 1fr) !important; }
                        [data-drawer-form] .xl\\:col-span-4,
                        [data-drawer-form] .xl\\:col-span-3,
                        [data-drawer-form] .md\\:col-span-2 { grid-column: span 1 / span 1 !important; }
                        [data-drawer-form] .md\\:col-span-3 { grid-column: span 2 / span 2 !important; }
                    }
                    @container (min-width: 400px) {
                        [data-drawer-form] .grid.md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                        [data-drawer-form] .grid.md\\:grid-cols-3 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                        [data-drawer-form] .grid.form-col-4 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                        [data-drawer-form] .xl\\:col-span-4,
                        [data-drawer-form] .xl\\:col-span-3,
                        [data-drawer-form] .md\\:col-span-3,
                        [data-drawer-form] .md\\:col-span-2 { grid-column: span 2 / span 2 !important; }
                    }
                    @container (min-width: 768px) {
                        [data-drawer-form] .grid.form-col-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
                        [data-drawer-form] .xl\\:col-span-4 { grid-column: span 4 / span 4 !important; }
                        [data-drawer-form] .xl\\:col-span-3 { grid-column: span 3 / span 3 !important; }
                    }
                    @container (min-width: 900px) {
                        [data-drawer-form] .grid.md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
                    }
                    `
                }} />
            )}

            <div ref={scrollRef} data-drawer-form={variant === 'drawer' ? '' : undefined} className={cn("flex-1 overflow-y-auto overflow-x-hidden space-y-4 scroll-smooth no-scrollbar", variant === 'drawer' ? 'pl-0' : 'pl-0')}>

                {/* Section 1: Thông tin chung */}
                <div id="section-1" className="flex flex-col gap-2">
                    <Card shadow="none" className="px-8 py-6 overflow-visible rounded-none">
                        <h4 className="font-semibold text-gray-800 mb-4 pb-1 text-[17px]" style={{ fontFamily: "'Roboto', sans-serif" }}>Thông tin cơ bản</h4>

                        <div className="grid gap-4 grid-cols-1 xl:grid-cols-4">
                            {/* Info Fields */}
                            <div className="xl:col-span-3 grid md:grid-cols-3 gap-4 pt-2 min-w-0">
                                <ChangeIndicator field="ma_nhan_vien"><HrInput label="Mã nhân sự" value={data?.ma_nhan_vien || ''} isRequired readOnly /></ChangeIndicator>
                                <ChangeIndicator field="ho_va_ten"><HrInput label="Họ và tên" value={data?.ho_va_ten || ''} isRequired readOnly /></ChangeIndicator>
                                <ChangeIndicator field="email"><HrInput label="Email" value={data?.email || ''} readOnly /></ChangeIndicator>

                                <ChangeIndicator field="gioi_tinh">
                                    <HrInput label="Giới tính" value={String(data?.gioi_tinh) === '1' ? 'Nam' : String(data?.gioi_tinh) === '2' ? 'Nữ' : ''} isRequired readOnly />
                                </ChangeIndicator>

                                <ChangeIndicator field="ngay_sinh"><HrInput label="Nhập ngày sinh" value={getValueLabel('ngay_sinh', data?.ngay_sinh)} isRequired readOnly /></ChangeIndicator>
                                <ChangeIndicator field="mst_ca_nhan"><HrInput label="Mã số thuế cá nhân" value={data?.mst_ca_nhan || ''} readOnly /></ChangeIndicator>
                                <ChangeIndicator field="id_don_vi_cong_tac"><HrInput label="Đơn vị công tác" value={getValueLabel('id_don_vi_cong_tac', data?.id_don_vi_cong_tac)} isRequired readOnly /></ChangeIndicator>
                                <ChangeIndicator field="id_vi_tri_cong_viec"><HrInput label="Chức vụ" value={getValueLabel('id_vi_tri_cong_viec', data?.id_vi_tri_cong_viec)} isRequired readOnly /></ChangeIndicator>
                                <ChangeIndicator field="id_dan_toc"><HrInput label="Dân tộc" value={getValueLabel('id_dan_toc', data?.id_dan_toc)} readOnly /></ChangeIndicator>
                                <ChangeIndicator field="id_ton_giao"><HrInput label="Tôn giáo" value={getValueLabel('id_ton_giao', data?.id_ton_giao)} readOnly /></ChangeIndicator>
                                <ChangeIndicator field="id_quoc_tich"><HrInput label="Quốc tịch" value={getValueLabel('id_quoc_tich', data?.id_quoc_tich)} readOnly /></ChangeIndicator>
                            </div>

                            {/* Avatar Box */}
                            <div className="flex flex-col items-center gap-3 xl:col-span-1 order-first xl:order-none">
                                <span className="text-[14px] font-medium text-gray-600">Ảnh đại diện</span>
                                {requestedData.avatar ? (
                                    <div className="flex items-center gap-3 xl:flex-col xl:gap-2">                                    {/* Ảnh hiện tại */}
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="w-24 h-24 bg-[#f8fafc] border border-gray-300 rounded-full flex items-center justify-center relative overflow-hidden opacity-50">
                                                {data?.avatar && !avatarError ? (
                                                    <img
                                                        src={getAvatarUrl(data.avatar)}
                                                        className="w-full h-full object-cover"
                                                        onError={() => setAvatarError(true)}
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-[10px] text-center p-1">Không có</span>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-gray-400 font-medium">Trước đó</span>
                                        </div>
                                        {/* Arrow */}
                                        <div className="text-gray-300 text-lg font-bold">
                                            <span className="xl:hidden">→</span><span className="hidden xl:inline">↓</span>
                                        </div>
                                        {/* Ảnh mới */}
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="w-28 h-28 bg-[#f8fafc] border-2 border-yellow-400 rounded-full flex items-center justify-center relative overflow-hidden ring-2 ring-yellow-200">
                                                <img
                                                    src={getAvatarUrl(requestedData.avatar)}
                                                    className="w-full h-full object-cover"
                                                    onError={() => setAvatarError(true)}
                                                />
                                            </div>
                                            <span className="text-[11px] text-yellow-600 font-bold">Ảnh mới</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full max-w-[160px] aspect-square bg-[#f8fafc] border border-[#d1d5db] rounded-full flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                                        {data?.avatar && !avatarError ? (
                                            <img
                                                src={getAvatarUrl(data.avatar)}
                                                className="w-full h-full object-cover"
                                                onError={() => setAvatarError(true)}
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-xs text-center p-4">
                                                {avatarError ? 'Không thể tải ảnh' : 'Chưa có ảnh hồ sơ'}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    </Card>

                    {/* CCCD */}
                    <FormCollapse title="Căn cước công dân (CCCD)">
                        <div className="grid md:grid-cols-2 form-col-4 gap-4">
                            <ChangeIndicator field="cccd_so"><HrInput label="Số CCCD" value={data?.cccd_so || ''} isRequired readOnly /></ChangeIndicator>
                            <ChangeIndicator field="cccd_noi_cap"><HrInput label="Nơi cấp CCCD" value={data?.cccd_noi_cap || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="cccd_ngay_cap"><HrInput label="Ngày cấp" value={getValueLabel('cccd_ngay_cap', data?.cccd_ngay_cap)} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="cccd_ngay_het_han"><HrInput label="Ngày hết hạn" value={getValueLabel('cccd_ngay_het_han', data?.cccd_ngay_het_han)} readOnly /></ChangeIndicator>
                        </div>
                    </FormCollapse>

                    {/* Passport */}
                    <FormCollapse title="Hộ chiếu (Passport)">
                        <div className="grid md:grid-cols-2 form-col-4 gap-4">
                            <ChangeIndicator field="ho_chieu_so"><HrInput label="Số Passport" value={data?.ho_chieu_so || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="ho_chieu_noi_cap"><HrInput label="Nơi cấp Passport" value={data?.ho_chieu_noi_cap || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="ho_chieu_ngay_cap"><HrInput label="Ngày cấp" value={getValueLabel('ho_chieu_ngay_cap', data?.ho_chieu_ngay_cap)} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="ho_chieu_ngay_het_han"><HrInput label="Ngày hết hạn" value={getValueLabel('ho_chieu_ngay_het_han', data?.ho_chieu_ngay_het_han)} readOnly /></ChangeIndicator>
                        </div>
                    </FormCollapse>

                    {/* Đơn vị kiêm nhiệm */}
                    <FormCollapse title={
                        <div className="flex items-center gap-2.5">
                            Đơn vị kiêm nhiệm
                            {data?.don_vi_kiem_nhiem?.length > 0 && (
                                <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-blue-50 text-blue-600 h-5 flex items-center justify-center min-w-[20px]">
                                    {data.don_vi_kiem_nhiem.length}
                                </span>
                            )}
                        </div>
                    }>
                        {data?.don_vi_kiem_nhiem?.length > 0 ? (
                            <div className="space-y-3">
                                {data.don_vi_kiem_nhiem.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end p-3 bg-gray-50 rounded-lg border border-gray-100"
                                    >
                                        <HrInput label="Đơn vị công tác" value={getValueLabel('id_don_vi_cong_tac', item.id_don_vi_cong_tac)} readOnly />
                                        <HrInput label="Vị trí công việc" value={getValueLabel('id_vi_tri_cong_viec', item.id_vi_tri_cong_viec)} readOnly />
                                        <div className="flex items-center h-12">
                                            <span className={`text-sm px-2 py-0.5 rounded ${item.la_lanh_dao ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-400'}`}>
                                                {item.la_lanh_dao ? '✓ Lãnh đạo' : 'Nhân viên'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Không có đơn vị kiêm nhiệm</p>
                        )}
                    </FormCollapse>

                    {/* Trình độ/Bằng cấp */}
                    <FormCollapse title="Trình độ/Bằng cấp">
                        <div className="grid md:grid-cols-2 form-col-4 gap-4">
                            <ChangeIndicator field="trinh_do_vh"><HrInput label="Trình độ văn hóa" value={data?.trinh_do_vh || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="hoc_ham"><HrInput label="Học hàm" value={data?.hoc_ham || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="trinh_do_dt"><HrInput label="Học vị" value={data?.trinh_do_dt || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="noi_dt"><HrInput label="Nơi đào tạo" value={data?.noi_dt || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="nganh_dt"><HrInput label="Chuyên ngành" value={data?.nganh_dt || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="khoa_dt"><HrInput label="Khóa" value={data?.khoa_dt || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="nam_tn"><HrInput label="Năm tốt nghiệp" value={data?.nam_tn || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="xep_loai_tn"><HrInput label="Xếp loại tốt nghiệp" value={data?.xep_loai_tn || ''} readOnly /></ChangeIndicator>
                        </div>
                    </FormCollapse>

                    {/* Hộ khẩu thường trú */}
                    <FormCollapse title="Hộ khẩu thường trú">
                        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 form-col-4">
                            <ChangeIndicator field="hktt_id_quoc_gia"><HrInput label="Quốc gia" value={getValueLabel('hktt_id_quoc_gia', data?.hktt_id_quoc_gia)} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="hktt_id_tinh_tp"><HrInput label="Tỉnh/Thành phố" value={getValueLabel('hktt_id_tinh_tp', data?.hktt_id_tinh_tp)} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="hktt_id_xa_phuong"><HrInput label="Phường/Xã" value={getValueLabel('hktt_id_xa_phuong', data?.hktt_id_xa_phuong)} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="hktt_so_nha"><HrInput label="Số nhà/Tên đường" value={data?.hktt_so_nha || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="hktt_so_ho_khau"><HrInput label="Số hộ khẩu" value={data?.hktt_so_ho_khau || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="hktt_ma_so_ho_gd"><HrInput label="Mã số hộ gia đình" value={data?.hktt_ma_so_ho_gd || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="hktt_dia_chi" fullWidth><HrInput label="Địa chỉ đầy đủ" value={data?.hktt_dia_chi || ''} readOnly /></ChangeIndicator>
                            <CheckboxDisplay label="Là chủ hộ" field="hktt_la_chu_ho" currentVal={data?.hktt_la_chu_ho} fullWidth xlClassName="xl:col-span-4" />
                        </div>
                    </FormCollapse>
                </div>

                {/* Section 2: Thông tin liên hệ */}
                <div id="section-2" className="flex flex-col gap-2">
                    <FormCollapse title="Thông tin liên hệ">
                        <div className="grid md:grid-cols-2 form-col-4 gap-4">
                            <ChangeIndicator field="so_dien_thoai"><HrInput label="Số điện thoại" value={data?.so_dien_thoai || ''} isRequired readOnly /></ChangeIndicator>
                            <ChangeIndicator field="email_ca_nhan"><HrInput label="Email cá nhân" value={data?.email_ca_nhan || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="que_quan" fullWidth><HrInput label="Quế quán" value={data?.que_quan || ''} readOnly /></ChangeIndicator>
                        </div>
                    </FormCollapse>

                    <FormCollapse title="Liên hệ khẩn cấp">
                        <div className="grid md:grid-cols-2 form-col-4 gap-4">
                            <ChangeIndicator field="lhkc_ho_ten"><HrInput label="Họ và tên" value={data?.lhkc_ho_ten || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="lhkc_quan_he"><HrInput label="Mối quan hệ" value={data?.lhkc_quan_he || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="lhkc_sdt_di_dong"><HrInput label="Số điện thoại" value={data?.lhkc_sdt_di_dong || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="lhkc_sdt_nha_rieng"><HrInput label="SĐT nhà riêng" value={data?.lhkc_sdt_nha_rieng || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="lhkc_email"><HrInput label="Email" value={data?.lhkc_email || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="lhkc_dia_chi" fullWidth xlClassName="xl:col-span-3"><HrInput label="Địa chỉ liên hệ" value={data?.lhkc_dia_chi || ''} readOnly /></ChangeIndicator>
                        </div>
                    </FormCollapse>

                    <FormCollapse title="Chỗ ở hiện nay">
                        <div className="mb-4">
                            <CheckboxDisplay label="Giống với hộ khẩu thường trú" field="cohn_giong_hktt" currentVal={data?.cohn_giong_hktt} />
                        </div>
                        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 form-col-4">
                            <ChangeIndicator field="cohn_id_quoc_gia"><HrInput label="Quốc gia" value={getValueLabel('cohn_id_quoc_gia', data?.cohn_id_quoc_gia)} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="cohn_id_tinh_tp"><HrInput label="Tỉnh/Thành phố" value={getValueLabel('cohn_id_tinh_tp', data?.cohn_id_tinh_tp)} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="cohn_id_xa_phuong"><HrInput label="Phường/Xã" value={getValueLabel('cohn_id_xa_phuong', data?.cohn_id_xa_phuong)} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="cohn_so_nha"><HrInput label="Số nhà/Tên đường" value={data?.cohn_so_nha || ''} readOnly /></ChangeIndicator>
                            <ChangeIndicator field="cohn_dia_chi" fullWidth xlClassName="xl:col-span-4"><HrInput label="Địa chỉ đầy đủ" value={data?.cohn_dia_chi || ''} readOnly /></ChangeIndicator>
                        </div>
                    </FormCollapse>
                </div>
            </div>
        </div>
    )

    const renderFooter = () => (
        <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
            {Number(data?.yeu_cau_cap_nhat?.trang_thai) === 1 ? (
                <div className="flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 size={18} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-700">Yêu cầu đã được duyệt</span>
                </div>
            ) : Number(data?.yeu_cau_cap_nhat?.trang_thai) === 2 ? (
                <div className="flex items-center gap-2 px-6 py-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle size={18} className="text-red-600" />
                    <span className="text-sm font-semibold text-red-700">Yêu cầu đã bị từ chối</span>
                </div>
            ) : onApprove && onReject ? (
                <>
                    <Button
                        color="danger"
                        variant="flat"
                        startContent={!isRejecting && <XCircle size={18} />}
                        isLoading={isRejecting}
                        isDisabled={isApproving}
                        onPress={() => {
                            if (onReject) onReject()
                        }}
                        className="font-bold h-12 px-10 rounded-lg"
                    >
                        Từ chối yêu cầu
                    </Button>
                    <Button
                        color="primary"
                        startContent={!isApproving && <CheckCircle2 size={18} />}
                        isLoading={isApproving}
                        isDisabled={isRejecting}
                        onPress={() => {
                            if (onApprove) onApprove()
                        }}
                        className="font-bold h-12 px-12 rounded-lg shadow-lg shadow-blue-500/20 bg-blue-600"
                    >
                        Duyệt & Lưu hồ sơ
                    </Button>
                </>
            ) : (
                <div className="flex items-center gap-2 px-6 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Clock size={18} className="text-yellow-600" />
                    <span className="text-sm font-semibold text-yellow-700">Đang chờ duyệt</span>
                </div>
            )}
        </div>
    )

    // DRAWER variant
    if (variant === 'drawer') {
        return (
            <DrawerCustom
                open={isOpen}
                position="right"
                onClose={onClose}
                width={1200}
                zIndex={60}
                usePortal={false}
            >
                {/* Header */}
                <DrawerHeaderCustom>
                    <div className="flex items-center gap-1">
                        <Tooltip
                            content="Đóng"
                            className="capitalize bg-slate-100"
                            radius="none"
                            placement="left"
                        >
                            <Button
                                isIconOnly
                                startContent={<ChevronsRight size={18} />}
                                size="sm"
                                variant="light"
                                onPress={onClose}
                            />
                        </Tooltip>
                        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Yêu cầu cập nhật</span>
                    </div>
                    <Button
                        isIconOnly
                        variant="light"
                        radius="full"
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        onPress={onClose}
                    >
                        <X size={20} />
                    </Button>
                </DrawerHeaderCustom>

                {/* Body */}
                <div className="flex-1 overflow-y-auto relative p-0! overflow-hidden h-full bg-gray-100" ref={drawerBodyRef}>
                    {renderBody()}
                    <BackToTop containerRef={scrollRef} zIndex={999} threshold={200} />
                </div>

                {/* Footer */}
                {renderFooter()}
            </DrawerCustom>
        )
    }
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="full"
            scrollBehavior="inside"
            classNames={{
                wrapper: 'p-0',
                base: 'max-w-none m-0 h-screen rounded-none',
                header: 'border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 z-50 px-6 py-4',
                body: 'p-0 bg-white dark:bg-gray-950',
                footer: 'border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3'
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                    <User size={22} />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{data?.ho_va_ten} - Yêu cầu cập nhật thông tin</h2>
                                    <span className="text-xs text-gray-400 font-normal">MSSV/MSNV: {data?.ma_nhan_vien}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button isIconOnly variant="light" onPress={onClose} className="rounded-full">
                                    <X size={20} />
                                </Button>
                            </div>
                        </ModalHeader>

                        <ModalBody>
                            {renderBody()}
                            <BackToTop containerRef={scrollRef} zIndex={999} threshold={200} />
                        </ModalBody>

                        <ModalFooter className="flex items-center justify-end gap-3 p-0!">
                            {renderFooter()}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
