import { useMemo, useEffect, useState, useRef } from 'react'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useDanhmucStore } from '@renderer/store/useDanhmucStore'
import LoaiVanBanPage from './LoaiVanBanPage'
import ViTriCongViecPage from './ViTriCongViecPage'
import CaLamViecPage from './CaLamViecPage'
import { useQueries } from '@tanstack/react-query'
import { loaivanbanAxios, vitricongviecAxios, caLamViecAxios, hinhthucAxios, tinhchatAxios, baomatAxios, coquanAxios, daotaoAxios } from './mockApi'


import HinhThucPage from './HinhThucPage'
import TinhChatPage from './TinhChatPage'
import BaoMatPage from './BaoMatPage'
import CoQuanPage from './CoQuanPage'
import DaoTaoPage from './DaoTaoPage'

export default function DanhMucKhacPage() {
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
            { queryKey: ['count', 'loai'], queryFn: async () => { const res = await loaivanbanAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'vitricongviec'], queryFn: async () => { const res = await vitricongviecAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'hinhthuc'], queryFn: async () => { const res = await hinhthucAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'tinhchat'], queryFn: async () => { const res = await tinhchatAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'baomat'], queryFn: async () => { const res = await baomatAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'coquan'], queryFn: async () => { const res = await coquanAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'calamviec'], queryFn: async () => { const res = await caLamViecAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'daotao'], queryFn: async () => { const res = await daotaoAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
        ]
    })

    const counts = useMemo(() => {
        return {
            loai: countQueries[0].data ?? 0,
            vitricongviec: countQueries[1].data ?? 0,
            hinhthuc: countQueries[2].data ?? 0,
            tinhchat: countQueries[3].data ?? 0,
            baomat: countQueries[4].data ?? 0,
            coquan: countQueries[5].data ?? 0,
            calamviec: countQueries[6].data ?? 0,
            daotao: countQueries[7].data ?? 0,
        }
    }, [countQueries])

    const items = useMemo(() => {
        const otherChildren = [
            { id: 'loai', label: 'Loại văn bản', count: counts.loai },
            { id: 'hinhthuc', label: 'Hình thức', count: counts.hinhthuc },
            { id: 'tinhchat', label: 'Tính chất', count: counts.tinhchat },
            { id: 'baomat', label: 'Bảo mật', count: counts.baomat },
            { id: 'coquan', label: 'Cơ quan', count: counts.coquan },
            { id: 'vitricongviec', label: 'Chức vụ', count: counts.vitricongviec },
            { id: 'calamviec', label: 'Ca làm việc', count: counts.calamviec },
            { id: 'daotao', label: 'Đào tạo', count: counts.daotao },
        ].filter((item) => permissions.includes(item.id) || ['hinhthuc', 'tinhchat', 'baomat', 'coquan', 'calamviec', 'daotao', 'loai'].includes(item.id))

        // Item cha "Danh mục khác"
        const all = [
            {
                id: 'danhmuckhac',
                label: 'Hệ thống',
                count: otherChildren.reduce((sum, item) => sum + (item.count || 0), 0),
                children: otherChildren
            }
        ]
        return all
    }, [counts, permissions])

    // Reset và tự động chọn sub-item đầu tiên khi component mount
    useEffect(() => {
        // Chọn mục con đầu tiên của "Danh mục khác" (Loại văn bản)
        const khacItem = items[0]
        if (khacItem && khacItem.children && khacItem.children.length > 0) {
            setSelectedSubItem(khacItem.children[0].id)
        }
    }, []) // Chỉ chạy một lần khi mount

    const renderContent = () => {
        switch (selectedSubItem) {
            case 'loai': return <LoaiVanBanPage />
            case 'hinhthuc': return <HinhThucPage />
            case 'tinhchat': return <TinhChatPage />
            case 'baomat': return <BaoMatPage />
            case 'coquan': return <CoQuanPage />
            case 'vitricongviec': return <ViTriCongViecPage />
            case 'calamviec': return <CaLamViecPage />
            case 'daotao': return <DaoTaoPage />
            default: return (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                    <div className="mb-4 text-gray-300 text-5xl">📋</div>
                    <p className="text-lg font-medium text-gray-500">Vui lòng chọn một danh mục</p>
                    <p className="text-sm mt-2">Loại văn bản, Hình thức, Tính chất, Bảo mật, Cơ quan, Chức vụ, Ca làm việc, Đào tạo</p>
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
                                const isSelectedChild = item.children?.some((child: any) => child.id === selectedSubItem)
                                const isActive = isSelectedChild

                                return (
                                    <div key={item.id}>
                                        {/* Header - không có mũi tên, không thể đóng lại, thụt vào */}
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

                                                    return (
                                                        <div key={child.id}>
                                                            <button
                                                                onClick={() => setSelectedSubItem(child.id)}
                                                                className={`w-full flex items-center justify-between px-6 pr-4 py-2 text-sm transition-colors cursor-pointer border-l-2 ${
                                                                    isChildSelected
                                                                        ? 'bg-blue-100 text-blue-700 font-medium border-blue-400'
                                                                        : 'text-gray-600 hover:bg-gray-100 border-gray-200'
                                                                }`}
                                                            >
                                                                <span>{child.label}</span>
                                                                <span className={`text-xs ${isChildSelected ? 'text-blue-500 font-semibold' : 'text-gray-400'}`}>
                                                                    {child.count ?? 0}
                                                                </span>
                                                            </button>
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
                <div className="flex-1 min-h-0 overflow-hidden">
                    {renderContent()}
                </div>
            </div>
        </div>
    )
}
