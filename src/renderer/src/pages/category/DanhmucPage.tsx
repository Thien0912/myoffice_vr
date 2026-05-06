import { useMemo, useEffect, useState, useRef } from 'react'
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
import { ChevronRight } from 'lucide-react'

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

export default function DanhmucPage() {
    const { user } = useAuthStore()
    const permissions = user?.permissions || []

    const { selectedSubItem, setSelectedSubItem } = useDanhmucStore()

    const [expanded, setExpanded] = useState(true)
    const [sidebarWidth, setSidebarWidth] = useState(240)
    const isResizing = useRef(false)
    const startX = useRef(0)
    const startWidth = useRef(240)

    const toggleExpanded = () => setExpanded((v) => !v)

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
            { queryKey: ['count', 'donvi'], queryFn: async () => { const res = await DonviAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'loai'], queryFn: async () => { const res = await loaivanbanAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'vitricongviec'], queryFn: async () => { const res = await vitricongviecAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'hinhthuc'], queryFn: async () => { const res = await hinhthucAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'tinhchat'], queryFn: async () => { const res = await tinhchatAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'baomat'], queryFn: async () => { const res = await baomatAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'coquan'], queryFn: async () => { const res = await coquanAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'loainghiphep'], queryFn: async () => { const res = await LoaiNghiPhepAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'calamviec'], queryFn: async () => { const res = await caLamViecAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
            { queryKey: ['count', 'daotao'], queryFn: async () => { const res = await daotaoAxios.fetch({ length: 1 }); return res?.recordsTotal || 0 }, staleTime: 30000 },
        ]
    })

    const counts = useMemo(() => ({
        donvi: countQueries[0].data ?? 0,
        loai: countQueries[1].data ?? 0,
        vitricongviec: countQueries[2].data ?? 0,
        hinhthuc: countQueries[3].data ?? 0,
        tinhchat: countQueries[4].data ?? 0,
        baomat: countQueries[5].data ?? 0,
        coquan: countQueries[6].data ?? 0,
        loainghiphep: countQueries[7].data ?? 0,
        calamviec: countQueries[8].data ?? 0,
        daotao: countQueries[9].data ?? 0,
    }), [countQueries])

    const items = useMemo(() => {
        const all = [
            { id: 'donvi', label: 'Đơn vị', count: counts.donvi },
            { id: 'loai', label: 'Loại văn bản', count: counts.loai },
            { id: 'hinhthuc', label: 'Hình thức', count: counts.hinhthuc },
            { id: 'tinhchat', label: 'Tính chất', count: counts.tinhchat },
            { id: 'baomat', label: 'Bảo mật', count: counts.baomat },
            { id: 'coquan', label: 'Cơ quan', count: counts.coquan },
            { id: 'vitricongviec', label: 'Chức vụ', count: counts.vitricongviec },
            { id: 'loainghiphep', label: 'Loại nghỉ phép', count: counts.loainghiphep },
            { id: 'calamviec', label: 'Ca làm việc', count: counts.calamviec },
            { id: 'daotao', label: 'Đào tạo', count: counts.daotao },
        ].filter((item) => permissions.includes(item.id) || ['hinhthuc', 'tinhchat', 'baomat', 'coquan', 'calamviec', 'daotao'].includes(item.id))
        return all
    }, [counts, permissions])

    // Tự động chọn sub-item đầu tiên nếu chưa có
    useEffect(() => {
        if (!selectedSubItem) {
            const firstItem = items[0]
            if (firstItem) {
                setSelectedSubItem(firstItem.id)
            }
        }
    }, [items, selectedSubItem, setSelectedSubItem])

    const renderContent = () => {
        switch (selectedSubItem) {
            case 'donvi': return <DonviPage />
            case 'loai': return <LoaiVanBanPage />
            case 'hinhthuc': return <HinhThucPage />
            case 'tinhchat': return <TinhChatPage />
            case 'baomat': return <BaoMatPage />
            case 'coquan': return <CoQuanPage />
            case 'vitricongviec': return <ViTriCongViecPage />
            case 'loainghiphep': return <LoaiNghiPhepPage />
            case 'calamviec': return <CaLamViecPage />
            case 'daotao': return <DaoTaoPage />
            default: return <div className="flex-1 flex items-center justify-center text-gray-400">Chọn một danh mục để xem</div>
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
                    <button
                        onClick={() => toggleExpanded()}
                        className="w-full flex items-center gap-2 px-4 py-2 text-[12px] font-medium text-black uppercase tracking-wide hover:bg-gray-100 transition-colors"
                    >
                        Danh mục dùng chung
                    </button>
                    {expanded && (
                        <div className="flex flex-col">
                            {items.map((item) => {
                                const hasChild = [
                                    'donvi',
                                    'vitricongviec',
                                    'hinhthuc',
                                    'tinhchat',
                                    'baomat',
                                    'coquan',
                                    'calamviec',
                                    'daotao'
                                ].includes(item.id)

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedSubItem(item.id)}
                                        className={`flex items-center justify-between px-4 py-2 text-sm transition-colors cursor-pointer ${
                                            selectedSubItem === item.id
                                                ? 'bg-blue-50 text-blue-600 font-medium'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {/* LEFT */}
                                        <div className="flex items-center gap-2">
                                            {/* 👇 Mũi tên ở đầu */}
                                            {hasChild && (
                                                <ChevronRight
                                                    size={14}
                                                    className="text-gray-400"
                                                />
                                            )}

                                            <span>{item.label}</span>
                                        </div>

                                        {/* RIGHT */}
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-xs ${
                                                    selectedSubItem === item.id
                                                        ? 'text-blue-500 font-semibold'
                                                        : 'text-gray-400'
                                                }`}
                                            >
                                                {item.count}
                                            </span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
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
