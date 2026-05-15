import { useMemo, useEffect } from 'react'
import { Tabs, Tab } from '@heroui/react'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useDanhmucStore } from '@renderer/store/useDanhmucStore'
import DonviPage from './DonviPage'
import LoaiVanBanPage from './LoaiVanBanPage'
import ViTriCongViecPage from './ViTriCongViecPage'
import { useQueries } from '@tanstack/react-query'
import { DonviAxios } from '@renderer/api/danhmuc/DonviAxios'
import { loaivanbanAxios } from '@renderer/api/danhmuc/loaiVanbanAxios'
import { vitricongviecAxios } from '@renderer/api/danhmuc/vitricongviecAxios'
import { LoaiNghiPhepAxios } from '@renderer/api/danhmuc/loaiNghiPhepAxios'
import LoaiNghiPhepPage from './LoaiNghiPhepPage'
import CaLamViecPage from './CaLamViecPage'
import { caLamViecAxios } from '@renderer/api/danhmuc/caLamViecAxios'
import { Briefcase, Building2, CircleOff, FileText, Layers, ShieldCheck, Building, Tags, Clock, GraduationCap } from 'lucide-react'

<<<<<<< Updated upstream
import HinhThucPage from './HinhThucPage'
import { hinhthucAxios } from '@renderer/api/danhmuc/hinhthucAxios'
import TinhChatPage from './TinhChatPage'
import { tinhchatAxios } from '@renderer/api/danhmuc/tinhChatAxios'
import BaoMatPage from './BaoMatPage'
import { baomatAxios } from '@renderer/api/danhmuc/baomatAxios'
import CoQuanPage from './CoQuanPage'
import { coquanAxios } from '@renderer/api/danhmuc/coquanAxios'
import DaoTaoPage from './DaoTaoPage'
import { daotaoAxios } from '@renderer/api/danhmuc/daotaoAxios'

// ... existing imports ...

// Placeholder for Table
const PlaceholderTable = ({ title = 'Bảng' }: { title?: string }) => (
    <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
        <h1 className="text-5xl font-bold text-black">{title}</h1>
    </div>
)
=======
// Import cho các danh mục đơn vị mới
import DonViDemoPage from './DonViDemoPage'
import { PhongBanAxios, TrungTamAxios, TruongAxios, KhoaAxios } from './mockApi'
import FormPhongBan from './components/FormPhongBan'
import FormTrungTam from './components/FormTrungTam'
import FormKhoa from './components/FormKhoa'
import { useQuery } from '@tanstack/react-query'
>>>>>>> Stashed changes

export default function DanhmucPage() {
    const { user } = useAuthStore()
    const permissions = user?.permissions || []

    // Define Tabs based on permissions
    const tabs = useMemo(() => {
        const _tabs: { id: string; label: string }[] = []
        if (permissions.includes('donvi')) {
            _tabs.push({ id: 'chung', label: 'Chung' })
        }
        if (permissions.includes('loai') || permissions.includes('hinhthuc') || permissions.includes('tinhchat') || permissions.includes('baomat') || permissions.includes('coquan')) {
            _tabs.push({ id: 'vanban', label: 'Văn bản' })
        }
        if (permissions.includes('vitricongviec') || permissions.includes('loainghiphep') || permissions.includes('calamviec')) {
            _tabs.push({ id: 'hoso', label: 'Hồ sơ' })
        }
        return _tabs
    }, [permissions])

    const { activeTab, setActiveTab, selectedSubItem, setSelectedSubItem } = useDanhmucStore()

    // Set default active tab and ensure valid selection
    useEffect(() => {
        if (tabs.length > 0) {
            const isValid = tabs.some((t) => t.id === activeTab)
            if (!activeTab || !isValid) {
                setActiveTab(tabs[0].id)
            }
        }
    }, [tabs, activeTab, setActiveTab])

    const commonSubItems = [
        { id: 'donvi', label: 'Đơn vị', icon: <Building2 size={18} /> },
    ]

    const vanbanSubItems = [
        { id: 'loai', label: 'Loại văn bản', icon: <FileText size={18} /> },
        { id: 'hinhthuc', label: 'Hình thức', icon: <Layers size={18} /> },
        { id: 'tinhchat', label: 'Tính chất', icon: <Tags size={18} /> },
        { id: 'baomat', label: 'Bảo mật', icon: <ShieldCheck size={18} /> },
        { id: 'coquan', label: 'Cơ quan', icon: <Building size={18} /> },
    ]

    const hosoSubItems = [
        { id: 'vitricongviec', label: 'Chức vụ', icon: <Briefcase size={18} /> },
        { id: 'loainghiphep', label: 'Loại nghỉ phép', icon: <CircleOff size={18} /> },
        { id: 'calamviec', label: 'Ca làm việc', icon: <Clock size={18} /> },
        { id: 'daotao', label: 'Đào tạo', icon: <GraduationCap size={18} /> },
        // { id: 'loaihopdong', label: 'Loại hợp đồng' },
    ]

    // Fetch counts for sidebar items
    const countQueries = useQueries({
        queries: [
<<<<<<< Updated upstream
=======
            // Counts cho các danh mục đơn vị
            { queryKey: ['count', 'phongban'], queryFn: async () => { const res = await PhongBanAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'trungtam'], queryFn: async () => { const res = await TrungTamAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
        ]
    })

    // Fetch danh sách trường để hiển thị submenu
    const { data: truongListRaw, error: truongError } = useQuery({
        queryKey: ['truong', 'list'],
        queryFn: async () => {
            const res = await TruongAxios.fetch({ length: 1000 }) // Lấy tất cả trường
            console.log('Truong API response:', res)
            return res?.data || []
        },
        staleTime: 60000
    })

    // Loại bỏ duplicate trường dựa trên id_truong
    const truongList = useMemo(() => {
        if (!truongListRaw) return []
        const seen = new Set()
        return truongListRaw.filter((truong: any) => {
            const id = String(truong.id_truong)
            if (seen.has(id)) return false
            seen.add(id)
            return true
        })
    }, [truongListRaw])

    // Fetch danh sách khoa để tính số khoa cho mỗi trường
    const { data: khoaList, error: khoaError } = useQuery({
        queryKey: ['khoa', 'all'],
        queryFn: async () => {
            const res = await KhoaAxios.fetch({ length: 10000 }) // Lấy tất cả khoa
            console.log('Khoa API response:', res)
            return res?.data || []
        },
        staleTime: 60000
    })

    // Log errors nếu có
    if (truongError) console.error('Truong fetch error:', truongError)
    if (khoaError) console.error('Khoa fetch error:', khoaError)

    // Loại bỏ duplicate khoa dựa trên id_khoa
    const uniqueKhoaList = useMemo(() => {
        if (!khoaList) return []
        const seen = new Set()
        return khoaList.filter((khoa: any) => {
            const id = String(khoa.id_khoa)
            if (seen.has(id)) return false
            seen.add(id)
            return true
        })
    }, [khoaList])

    // Tính số khoa cho mỗi trường
    const khoaCountByTruong = useMemo(() => {
        const counts: Record<string, number> = {}
        uniqueKhoaList.forEach((khoa: any) => {
            // Bỏ qua khoa không có id_truong
            if (!khoa.id_truong) return
            const truongId = String(khoa.id_truong)
            counts[truongId] = (counts[truongId] || 0) + 1
        })
        return counts
    }, [uniqueKhoaList])

    // Tính số khoa không có trường
    const khoaNoTruongCount = useMemo(() => {
        return uniqueKhoaList.filter((khoa: any) => !khoa.id_truong).length
    }, [uniqueKhoaList])

    const counts = useMemo(() => {
        const phongban = countQueries[0].data ?? 0
        const trungtam = countQueries[1].data ?? 0
        const totalKhoa = uniqueKhoaList.length // Tổng số khoa của tất cả trường (đã loại bỏ duplicate)
        
        return {
            donvi: phongban + trungtam + khoaNoTruongCount + totalKhoa, // Tổng = Phòng ban + Trung tâm + Khoa (không trường) + Tổng khoa trong trường
            phongban,
            trungtam,
            khoa: khoaNoTruongCount, // Chỉ đếm khoa không có trường
            truong: totalKhoa - khoaNoTruongCount, // Tổng Trường = tổng số khoa thuộc các trường (loại trừ khoa không có trường)
        }
    }, [countQueries, uniqueKhoaList, khoaNoTruongCount])

    const items = useMemo(() => {
        // Debug
        console.log('Debug counts:', { khoaListLength: khoaList?.length, uniqueKhoaListLength: uniqueKhoaList?.length, khoaCountByTruong, truongListLength: truongList?.length })
        
        // Tạo danh sách children cho "Trường" - các trường từ API với số khoa
        // Lọc bỏ trường không có id_truong
        const validTruongList = truongList?.filter((truong: any) => truong.id_truong != null) || []
        
        const truongChildren = validTruongList.map((truong: any) => {
            const truongId = String(truong.id_truong)
            const count = khoaCountByTruong[truongId] || 0
            console.log(`Trường ${truong.ten_truong} (id: ${truongId}): count = ${count}`)
            return {
                id: `donvi_truong_${truong.id_truong}`,
                label: truong.ma_truong || truong.ten_truong,
                count: count,
                parentId: 'donvi_truong_group',
                loai: 'TRUONG_KHOA',
                truongData: truong
            }
        })

        // Tạo danh sách children cho Danh mục đơn vị: Phòng ban, Trung tâm, Trường (có sub-children), Khoa
        const donviChildren = [
            { id: 'donvi_phongban', label: 'Phòng ban', count: counts.phongban, parentId: 'donvi', loai: 'PHONG_BAN' },
            { id: 'donvi_trungtam', label: 'Trung tâm', count: counts.trungtam, parentId: 'donvi', loai: 'TRUNG_TAM' },
            { 
                id: 'donvi_truong_group', 
                label: 'Trường', 
                count: counts.truong, 
                parentId: 'donvi', 
                loai: 'TRUONG_GROUP',
                children: truongChildren
            },
            { id: 'donvi_khoa', label: 'Khoa', count: counts.khoa, parentId: 'donvi', loai: 'KHOA' },
        ]
        
        // Item cha "Danh mục đơn vị"
        const all = [
>>>>>>> Stashed changes
            {
                queryKey: ['count', 'donvi'],
                queryFn: async () => {
                    if (!permissions.includes('donvi')) return 0
                    const res = await DonviAxios.fetch({ length: 1 })
                    return res?.recordsTotal || 0
                },
                staleTime: 30000 // 30s
            },
            {
                queryKey: ['count', 'loai'],
                queryFn: async () => {
                    if (!permissions.includes('loai')) return 0
                    const res = await loaivanbanAxios.fetch({ length: 1 })
                    return res?.recordsTotal || 0
                },
                staleTime: 30000
            },
            {
                queryKey: ['count', 'vitricongviec'],
                queryFn: async () => {
                    if (!permissions.includes('vitricongviec')) return 0
                    const res = await vitricongviecAxios.fetch({ length: 1 })
                    return res?.recordsTotal || 0
                },
                staleTime: 30000
            },
            {
                queryKey: ['count', 'hinhthuc'],
                queryFn: async () => {
                    // if (!permissions.includes('hinhthuc')) return 0
                    const res = await hinhthucAxios.fetch({ length: 1 })
                    return res?.recordsTotal || 0
                },
                staleTime: 30000
            },
            {
                queryKey: ['count', 'tinhchat'],
                queryFn: async () => {
                    // if (!permissions.includes('tinhchat')) return 0
                    const res = await tinhchatAxios.fetch({ length: 1 })
                    return res?.recordsTotal || 0
                },
                staleTime: 30000
            },
            {
                queryKey: ['count', 'baomat'],
                queryFn: async () => {
                    // if (!permissions.includes('baomat')) return 0
                    const res = await baomatAxios.fetch({ length: 1 })
                    return res?.recordsTotal || 0
                },
                staleTime: 30000
            },
            {
                queryKey: ['count', 'coquan'],
                queryFn: async () => {
                    // if (!permissions.includes('coquan')) return 0
                    const res = await coquanAxios.fetch({ length: 1 })
                    return res?.recordsTotal || 0
                },
                staleTime: 30000
            },
            {
                queryKey: ['count', 'loainghiphep'],
                queryFn: async () => {
                    // if (!permissions.includes('loainghiphep')) return 0
                    const res = await LoaiNghiPhepAxios.fetch({ length: 1 })
                    return res?.recordsTotal || 0
                },
                staleTime: 30000
            },
            {
                queryKey: ['count', 'calamviec'],
                queryFn: async () => {
                    // if (!permissions.includes('calamviec')) return 0
                    const res = await caLamViecAxios.fetch({ length: 1 })
                    return res?.recordsTotal || 0
                },
                staleTime: 30000
            },
            {
                queryKey: ['count', 'daotao'],
                queryFn: async () => {
                    // if (!permissions.includes('daotao')) return 0
                    const res = await daotaoAxios.fetch({ length: 1 })
                    return res?.recordsTotal || 0
                },
                staleTime: 30000
            }
        ]
    })

    const counts = useMemo(() => ({
        donvi: countQueries[0].data,
        loai: countQueries[1].data,
        vitricongviec: countQueries[2].data,
        hinhthuc: countQueries[3].data,
        tinhchat: countQueries[4].data,
        baomat: countQueries[5].data,
        coquan: countQueries[6].data,
        loainghiphep: countQueries[7].data,
        calamviec: countQueries[8].data,
        daotao: countQueries[9].data
    }), [countQueries])


    // Define sub-menu items for each tab
    const getSubMenuItems = (tabId: string) => {
        switch (tabId) {
            case 'chung':
                return commonSubItems.filter((item) => permissions.includes(item.id))
            case 'vanban':
                return vanbanSubItems.filter((item) => permissions.includes(item.id) || ['hinhthuc', 'tinhchat', 'baomat', 'coquan'].includes(item.id))
            case 'hoso':
                return hosoSubItems.filter((item) => permissions.includes(item.id) || ['calamviec', 'daotao'].includes(item.id))
            default:
                return []
        }
    }

    // Automatically select first sub-item when tab changes only if current is invalid
    useEffect(() => {
        const subItems = getSubMenuItems(activeTab)
        if (subItems.length > 0) {
            const isValid = subItems.some((item) => item.id === selectedSubItem)
            if (!isValid) {
                setSelectedSubItem(subItems[0].id)
            }
        } else {
            if (selectedSubItem !== '') {
                setSelectedSubItem('')
            }
        }
    }, [activeTab, permissions, selectedSubItem, setSelectedSubItem])

    const renderContent = () => {
        if (activeTab === 'chung') {
            if (selectedSubItem === 'donvi') return <DonviPage />
        }

        if (activeTab === 'vanban') {
            if (selectedSubItem === 'loai') return <LoaiVanBanPage />
            if (selectedSubItem === 'hinhthuc') return <HinhThucPage />
            if (selectedSubItem === 'tinhchat') return <TinhChatPage />
            if (selectedSubItem === 'baomat') return <BaoMatPage />
            if (selectedSubItem === 'coquan') return <CoQuanPage />
        }

        if (activeTab === 'hoso') {
            if (selectedSubItem === 'vitricongviec') return <ViTriCongViecPage />
            if (selectedSubItem === 'loainghiphep') return <LoaiNghiPhepPage />
            if (selectedSubItem === 'calamviec') return <CaLamViecPage />
            if (selectedSubItem === 'daotao') return <DaoTaoPage />
        }
        // For other cases or empty sub-items, show placeholder
        return <PlaceholderTable />
    }

    const currentSubItems = getSubMenuItems(activeTab)

    return (
        <div className="flex flex-col h-full gap-4 p-4">
            {/* Header with Title and Tabs */}
            <div className="flex flex-col gap-2">
                <div className="flex w-full flex-col">
                    <div className="grid grid-cols-[220px_1fr] gap-4 border-b border-divider">
                        <div className='flex flex-col'>
                            {/* SPACE matching sidebar width */}
                        </div>
                        <Tabs
                            aria-label="Options"
                            variant="underlined"
                            color="primary"
                            selectedKey={activeTab}
                            onSelectionChange={(key) => setActiveTab(key as string)}
                            classNames={{
                                tabList: 'gap-6 w-full relative rounded-none p-0 ',
                                cursor: 'w-full bg-blue-600',
                                tab: 'max-w-fit px-0 h-10',
                                tabContent: 'group-data-[selected=true]:text-blue-600 font-medium'
                            }}
                        >
                            {tabs.map((tab) => (
                                <Tab key={tab.id} title={tab.label} />
                            ))}
                        </Tabs>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 h-full overflow-hidden">
                {/* Sidebar / Sub-menu */}
                <div className="w-[220px] flex-none bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 flex-none">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
                            {tabs.find((t) => t.id === activeTab)?.label}
                            <span className="ml-1 text-xs font-normal text-gray-500 normal-case">
                                ({currentSubItems.length})
                            </span>
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar flex flex-col gap-1">
                        {currentSubItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedSubItem(item.id)}
                                className={`text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center ${selectedSubItem === item.id
                                    ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'hover:bg-gray-50 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                                <span className={`text-xs ${selectedSubItem === item.id ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
                                    {counts[item.id] !== undefined ? counts[item.id] : '-'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 overflow-hidden relative">
                    {renderContent()}
                </div>
            </div>
        </div>
    )
}
