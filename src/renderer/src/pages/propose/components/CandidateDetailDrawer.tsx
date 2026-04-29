import {
    Button,
    Chip,
    cn,
    Tooltip
} from '@heroui/react'
import {
    ChevronRight,
    Clock,
    FileText,
    History,
    MessageCircle,
    Send
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { HrDrawer, HrDrawerBody, HrDrawerFooter, HrDrawerHeader } from '@renderer/components/hero-custom/HrDrawer'
import { HrFormField } from '@renderer/components/hero-custom'

const CANDIDATE_TABS = [
    { id: 'general', title: 'Thông tin chung', icon: FileText },
    { id: 'history', title: 'Lịch sử ứng tuyển', icon: Clock },
    { id: 'notes', title: 'Ghi chú', icon: MessageCircle },
] as const

type TabId = (typeof CANDIDATE_TABS)[number]['id']

const STATUS_MAP: Record<string, { label: string; color: 'warning' | 'primary' | 'success' | 'default' | 'danger' }> = {
    'Mới ứng tuyển': { label: 'Mới ứng tuyển', color: 'primary' },
    'Phỏng vấn': { label: 'Phỏng vấn', color: 'warning' },
    'Đã duyệt': { label: 'Đã duyệt', color: 'success' },
    'Từ chối': { label: 'Từ chối', color: 'danger' },
}

interface CandidateDetailDrawerProps {
    candidate: any
    isOpen: boolean
    onClose: () => void
}

export default function CandidateDetailDrawer({ candidate, isOpen, onClose }: CandidateDetailDrawerProps) {
    const [activeView, setActiveView] = useState<TabId>('general')

    const methods = useForm({
        defaultValues: candidate || {}
    })

    useEffect(() => {
        if (candidate) {
            methods.reset({
                ...candidate,
                dob: '1995-05-15',
                citizenId: '079095012345',
                issueDate: '2020-01-01',
                issuePlace: 'Cục Cảnh sát QLHC về TTXH',
                taxId: '831238123',
                gender: 'Nam',
                address: '123 Đường ABC, Quận XYZ, TP. HCM',
                education: 'Cử nhân',
                university: 'Đại học Bách Khoa',
                major: 'Công nghệ thông tin',
                graduationYear: '2017'
            })
        }
    }, [candidate, methods])

    const [notes, setNotes] = useState<any[]>(candidate?.notes || [])
    const [newNote, setNewNote] = useState('')

    useEffect(() => {
        setNotes(candidate?.notes || [])
    }, [candidate])

    const handleAddNote = () => {
        if (!newNote.trim()) return
        const newNoteObj = {
            author: 'Admin',
            avatar: '',
            time:
                new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
                ' ' +
                new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
            content: newNote
        }
        setNotes([...notes, newNoteObj])
        setNewNote('')
    }

    const handleNoteKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleAddNote()
        }
    }

    const statusTag = candidate?.status ? (STATUS_MAP[candidate.status] || { label: candidate.status, color: 'default' as const }) : null

    return (
        <HrDrawer
            isOpen={isOpen}
            onClose={onClose}
            onOpenChange={(open) => !open && onClose()}
        >
            <HrDrawerHeader>
                <div className="flex items-center gap-1 min-w-0 flex-1">
                    <Tooltip content="Đóng" className="capitalize bg-slate-100" radius="none" placement="left">
                        <Button isIconOnly startContent={<ChevronRight size={18} />} size="sm" variant="light" onPress={onClose} />
                    </Tooltip>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 uppercase truncate" title={candidate?.fullName || ''}>
                            {candidate?.fullName || 'Ứng viên'}
                        </span>
                        {candidate?.position && (
                            <Chip size="sm" variant="flat" className="bg-blue-50 text-blue-600 border border-blue-200 text-xs shrink-0" classNames={{ content: 'font-bold' }}>
                                Vị trí: {candidate.position}
                            </Chip>
                        )}
                        {statusTag && (
                            <Chip size="sm" variant="dot" color={statusTag.color} className="text-xs font-medium shrink-0">
                                {statusTag.label}
                            </Chip>
                        )}
                    </div>
                </div>
            </HrDrawerHeader>
            <HrDrawerBody className="p-0">
                {/* Avatar & Profile Summary */}
                <div className="bg-gradient-to-b from-blue-50/60 to-gray-50 dark:from-gray-900 dark:to-gray-900/50 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden shrink-0 bg-white">
                            {candidate?.avatar ? (
                                <img src={candidate.avatar} alt={candidate?.fullName || ''} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-lg">
                                        {candidate?.fullName?.charAt(0) || '?'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 truncate">
                                {candidate?.fullName || 'Ứng viên'}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                {candidate?.email && (
                                    <span className="flex items-center gap-1 truncate">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                                        {candidate.email}
                                    </span>
                                )}
                                {candidate?.phone && <span>{candidate.phone}</span>}
                            </div>
                            {candidate?.position && (
                                <span className="text-xs text-gray-500 font-medium">{candidate.position}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                    <div className="flex">
                        {CANDIDATE_TABS.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeView === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveView(tab.id)}
                                    className={cn(
                                        'flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors relative',
                                        'hover:bg-gray-50 dark:hover:bg-gray-900',
                                        isActive
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-500 dark:text-gray-400'
                                    )}
                                >
                                    <Icon size={16} />
                                    <span>{tab.title}</span>
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Tab content */}
                <FormProvider {...methods}>
                    <div className="flex flex-col flex-1 min-h-0 bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
                        {activeView === 'general' && (
                            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                                <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Thông tin chung</h4>
                                    </div>
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Controller
                                            name="fullName"
                                            control={methods.control}
                                            render={({ field }) => (
                                                <HrFormField fieldLabel="Họ và tên" {...field} />
                                            )}
                                        />
                                        <Controller
                                            name="gender"
                                            control={methods.control}
                                            render={({ field }) => (
                                                <HrFormField fieldLabel="Giới tính" {...field} />
                                            )}
                                        />
                                        <Controller
                                            name="dob"
                                            control={methods.control}
                                            render={({ field }) => (
                                                <HrFormField fieldLabel="Ngày sinh" {...field} />
                                            )}
                                        />
                                        <Controller
                                            name="phone"
                                            control={methods.control}
                                            render={({ field }) => (
                                                <HrFormField fieldLabel="Số điện thoại" {...field} />
                                            )}
                                        />
                                        <Controller
                                            name="email"
                                            control={methods.control}
                                            render={({ field }) => (
                                                <HrFormField fieldLabel="Email" {...field} />
                                            )}
                                        />
                                        <Controller
                                            name="taxId"
                                            control={methods.control}
                                            render={({ field }) => (
                                                <HrFormField fieldLabel="Mã số thuế" {...field} />
                                            )}
                                        />
                                        <div className="col-span-1 md:col-span-2">
                                            <Controller
                                                name="address"
                                                control={methods.control}
                                                render={({ field }) => (
                                                    <HrFormField fieldLabel="Địa chỉ thường trú" {...field} />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Học vấn</h4>
                                    </div>
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Controller
                                            name="education"
                                            control={methods.control}
                                            render={({ field }) => (
                                                <HrFormField fieldLabel="Trình độ học vấn" {...field} />
                                            )}
                                        />
                                        <Controller
                                            name="university"
                                            control={methods.control}
                                            render={({ field }) => (
                                                <HrFormField fieldLabel="Trường đại học" {...field} />
                                            )}
                                        />
                                        <Controller
                                            name="major"
                                            control={methods.control}
                                            render={({ field }) => (
                                                <HrFormField fieldLabel="Chuyên ngành" {...field} />
                                            )}
                                        />
                                        <Controller
                                            name="graduationYear"
                                            control={methods.control}
                                            render={({ field }) => (
                                                <HrFormField fieldLabel="Năm tốt nghiệp" {...field} />
                                            )}
                                        />
                                        <Controller
                                            name="citizenId"
                                            control={methods.control}
                                            render={({ field }) => (
                                                <HrFormField fieldLabel="CMND/CCCD" {...field} />
                                            )}
                                        />
                                        <Controller
                                            name="issuePlace"
                                            control={methods.control}
                                            render={({ field }) => (
                                                <HrFormField fieldLabel="Nơi cấp" {...field} />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeView === 'history' && (
                            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                                <div className="shrink-0 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 flex items-center gap-2">
                                    <History size={16} className="text-gray-500" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lịch sử quá trình tuyển dụng</span>
                                </div>
                                <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex items-center justify-center flex-1 min-h-[300px]">
                                    <div className="text-center flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                            <History size={24} className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Chưa có lịch sử thay đổi trạng thái tuyển dụng.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeView === 'notes' && (
                            <div className="flex-1 overflow-hidden p-4 flex flex-col gap-4">
                                <div className="shrink-0 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 flex items-center gap-2">
                                    <MessageCircle size={16} className="text-gray-500" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ghi chú ứng viên</span>
                                </div>
                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl flex-1 flex flex-col min-h-0">
                                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/30">
                                            {notes.length === 0 ? (
                                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                                    Chưa có ghi chú nào cho ứng viên này.
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    {notes.map((note, index) => (
                                                        <div key={index} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-3 shadow-sm">
                                                            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                                                            <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                                                <span className="font-medium text-gray-500 dark:text-gray-400">{note.author}</span>
                                                                <span>•</span>
                                                                <span>{note.time}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-b-xl">
                                            <div className="flex gap-3">
                                                <textarea
                                                    value={newNote}
                                                    onChange={(e) => setNewNote(e.target.value)}
                                                    onKeyDown={handleNoteKeyDown}
                                                    placeholder="Thêm ghi chú mới (Enter để gửi)..."
                                                    className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none min-h-[80px]"
                                                />
                                                <div className="flex flex-col justify-end">
                                                    <Button
                                                        color="primary"
                                                        onPress={handleAddNote}
                                                        isDisabled={!newNote.trim()}
                                                        className="bg-blue-600 font-medium"
                                                        startContent={<Send size={14} />}
                                                    >
                                                        Lưu
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </FormProvider>
            </HrDrawerBody>
            <HrDrawerFooter>
                <div className="flex w-full items-center justify-between">
                    <Button variant="light" onPress={onClose} className="font-medium text-sm">
                        Đóng
                    </Button>
                    <div className="flex gap-2">
                        <Button color="primary" variant="flat" className="font-medium text-sm rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                            Chuyển trạng thái
                        </Button>
                        {activeView === 'general' && (
                            <Button color="primary" onPress={() => console.log('Saved!')} className="font-medium text-sm rounded-lg bg-blue-600">
                                Lưu thay đổi
                            </Button>
                        )}
                    </div>
                </div>
            </HrDrawerFooter>
        </HrDrawer>
    )
}
