import { useMemo, useEffect, useState, useRef } from 'react'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useDanhmucStore } from '@renderer/store/useDanhmucStore'
import { useQueries } from '@tanstack/react-query'

// Import cho các danh mục đơn vị mới
import DonViDemoPage from './DonViDemoPage'
import { PhongBanAxios, TrungTamAxios, TruongAxios, KhoaAxios } from './mockApi'
import FormPhongBan from './components/FormPhongBan'
import FormTrungTam from './components/FormTrungTam'
import FormKhoa from './components/FormKhoa'
import { useQuery } from '@tanstack/react-query'

export default function DanhmucPage() {
    const { user } = useAuthStore()
    const permissions = user?.permissions || []

    const { selectedSubItem, setSelectedSubItem } = useDanhmucStore()

    const [sidebarWidth, setSidebarWidth] = useState(240)
    const isResizing = useRef(false)
    const startX = useRef(0)
    const startWidth = useRef(240)

    const handleMouseDown = (e: React.MouseEvent) => {
        isResizing.current = true
        startX.current = e.clientX
        startWidth.current = sidebarWidth
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing.current) return
            const delta = e.clientX - startX.current
            const newWidth = Math.max(180, Math.min(400, startWidth.current + delta))
            setSidebarWidth(newWidth)
        }
        const handleMouseUp = () => {
            isResizing.current = false
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }

        const handleMouseMoveWrapper = (e: MouseEvent) => {
            if (!isResizing.current) return
            document.body.style.cursor = 'col-resize'
            document.body.style.userSelect = 'none'
            handleMouseMove(e)
        }

        window.addEventListener('mousemove', handleMouseMoveWrapper)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mousemove', handleMouseMoveWrapper)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

    // Fetch counts
    const countQueries = useQueries({
        queries: [
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
            donvi: phongban + trungtam + totalKhoa, // Tổng = Phòng ban + Trung tâm + Tất cả khoa
            phongban,
            trungtam,
            khoa: khoaNoTruongCount, // Chỉ đếm khoa không có trường (standalone)
            truong: totalKhoa - khoaNoTruongCount, // Chỉ đếm khoa thuộc trường, không tính standalone
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
            {
                id: 'donvi',
                label: 'Đơn vị',
                count: counts.donvi,
                children: donviChildren
            }
        ]
        return all
    }, [counts, truongList, khoaCountByTruong])

    // State để quản lý expand/collapse cho "Trường" - mặc định expand
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['donvi_truong_group']))

    const toggleExpand = (id: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
    }

    // Reset và tự động chọn sub-item đầu tiên khi component mount
    useEffect(() => {
        // Chọn mục con đầu tiên của "Danh mục đơn vị" (Phòng ban)
        const donviItem = items[0]
        if (donviItem && donviItem.children && donviItem.children.length > 0) {
            setSelectedSubItem(donviItem.children[0].id)
        }
    }, []) // Chỉ chạy một lần khi mount

    const renderContent = () => {
        // Kiểm tra nếu là trường cụ thể (id bắt đầu bằng 'donvi_truong_')
        if (selectedSubItem?.startsWith('donvi_truong_')) {
            const truongId = selectedSubItem.replace('donvi_truong_', '')
            const truongData = truongList?.find((t: any) => String(t.id_truong) === truongId)
            if (truongData) {
                return (
                    <DonViDemoPage 
                        key={selectedSubItem}
                        title={`Khoa - ${truongData.ten_truong}`}
                        apiService={KhoaAxios}
                        formComponent={FormKhoa}
                        primaryKey="id_khoa"
                        tenField="ten_khoa"
                        idTruong={truongId}
                        tenTruong={truongData.ten_truong}
                    />
                )
            }
        }

        switch (selectedSubItem) {
            case 'donvi_phongban': return (
                <DonViDemoPage 
                    key="donvi_phongban"
                    title="Phòng ban"
                    apiService={PhongBanAxios}
                    formComponent={FormPhongBan}
                    primaryKey="id"
                    tenField="ten_phong_ban"
                />
            )
            case 'donvi_trungtam': return (
                <DonViDemoPage 
                    key="donvi_trungtam"
                    title="Trung tâm"
                    apiService={TrungTamAxios}
                    formComponent={FormTrungTam}
                    primaryKey="id"
                    tenField="ten_trung_tam"
                />
            )
            case 'donvi_khoa': return (
                <DonViDemoPage 
                    key="donvi_khoa"
                    title="Khoa"
                    apiService={KhoaAxios}
                    formComponent={FormKhoa}
                    primaryKey="id_khoa"
                    tenField="ten_khoa"
                    filterNoTruong={true}
                />
            )
            case 'donvi_truong_group':
            default: 
                return (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <div className="mb-4 text-gray-300 text-5xl">🏢</div>
                        <p className="text-lg font-medium text-gray-500">Vui lòng chọn một loại đơn vị</p>
                        <p className="text-sm mt-2">Phòng ban, Trung tâm, Khoa hoặc chọn Trường để xem Khoa theo trường</p>
                    </div>
                )
        }
    }

    return (
        <div className="flex h-full w-full bg-white overflow-hidden">
            {/* Sidebar */}
            <div
                className="flex-none bg-gray-50/50 border-r border-gray-100 flex flex-col overflow-hidden relative origin-top-left"
                style={{ width: sidebarWidth, zoom: 0.90 }}
            >
                <div className="flex-1 overflow-y-auto py-2">
                    <div className="flex flex-col">
                        {items.map((item) => {
                                const hasChild = item.children && item.children.length > 0

                                return (
                                    <div key={item.id}>
                                        {/* Header - không có mũi tên, không thể đóng lại, không highlight, thụt vào */}
                                        <div
                                            className="w-full flex items-center justify-between pl-2 pr-4 py-2 text-sm text-gray-700"
                                        >
                                            {/* LEFT */}
                                            <div className="flex items-center gap-2">
                                                <span>{item.label}</span>
                                            </div>

                                            {/* RIGHT */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400">
                                                    {item.count}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Children submenu - luôn hiển thị */}
                                        {hasChild && (
                                            <div className="flex flex-col bg-gray-50/50">
                                                {item.children?.map((child: any) => {
                                                    const isChildSelected = selectedSubItem === child.id
                                                    const hasGrandChild = child.children && child.children.length > 0
                                                    const isChildExpanded = expandedItems.has(child.id)
                                                    const isGrandChildSelected = child.children?.some((grand: any) => grand.id === selectedSubItem)
                                                    const isChildActive = isChildSelected || isGrandChildSelected

                                                    return (
                                                        <div key={child.id}>
                                                            <button
                                                                onClick={() => {
                                                                    if (hasGrandChild) {
                                                                        toggleExpand(child.id)
                                                                        // Nếu đang collapse thì expand và chọn mục con đầu tiên
                                                                        if (!isChildExpanded && child.children && child.children.length > 0) {
                                                                            setSelectedSubItem(child.children[0].id)
                                                                        }
                                                                    } else {
                                                                        setSelectedSubItem(child.id)
                                                                    }
                                                                }}
                                                                className={`w-full flex items-center justify-between px-6 pr-4 py-2 text-sm transition-colors cursor-pointer border-l-2 ${
                                                                    isChildActive
                                                                        ? 'bg-blue-100 text-blue-700 font-medium border-blue-400'
                                                                        : 'text-gray-600 hover:bg-gray-100 border-gray-200'
                                                                }`}
                                                            >
                                                                <span>{child.label}</span>
                                                                <span className={`text-xs ${isChildActive ? 'text-blue-500 font-semibold' : 'text-gray-400'}`}>
                                                                    {child.count ?? 0}
                                                                </span>
                                                            </button>

                                                            {/* Grand-children submenu (các trường) */}
                                                            {hasGrandChild && isChildExpanded && (
                                                                <div className="flex flex-col bg-gray-50/30">
                                                                    {child.children?.map((grand: any) => {
                                                                        const isGrandSelected = selectedSubItem === grand.id
                                                                        return (
                                                                            <button
                                                                                key={grand.id}
                                                                                onClick={() => setSelectedSubItem(grand.id)}
                                                                                className={`w-full flex items-center justify-between px-6 pr-4 py-2 text-sm transition-colors cursor-pointer border-l-2 ${
                                                                                    isGrandSelected
                                                                                        ? 'bg-blue-50 text-blue-600 font-medium border-blue-400'
                                                                                        : 'text-gray-500 hover:bg-gray-100 border-gray-200'
                                                                                }`}
                                                                            >
                                                                                <span className="flex items-center"><span className="text-gray-400 mr-2">•</span>{grand.label}</span>
                                                                                <span className={`text-xs ${isGrandSelected ? 'text-blue-500 font-semibold' : 'text-gray-400'}`}>
                                                                                    {grand.count ?? 0}
                                                                                </span>
                                                                            </button>
                                                                        )
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                    </div>
                </div>
                {/* Resize handle */}
                <div
                    onMouseDown={handleMouseDown}
                    className="absolute -right-2 top-0 h-full w-4 cursor-col-resize z-20 flex justify-center group"
                    title="Kéo để thay đổi kích thước"
                >
                    <div className="w-px h-full bg-gray-300 group-hover:bg-blue-400 transition-colors" />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden origin-top-left" style={{ zoom: 0.90 }}>
                {/* Page content */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    {renderContent()}
                </div>
            </div>
        </div>
    )
}
