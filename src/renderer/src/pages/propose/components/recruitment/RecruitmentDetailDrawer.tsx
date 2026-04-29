import {
  Button,
  Chip,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Tooltip
} from '@heroui/react'
import { HrFormField, HrFormFieldDate, HrFormFieldSelect } from '@renderer/components/hero-custom'
import {
  HrDrawer,
  HrDrawerBody,
  HrDrawerFooter,
  HrDrawerHeader
} from '@renderer/components/hero-custom/HrDrawer'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  History,
  MessageCircle,
  MessageSquareText,
  Save,
  Send,
  Trash2,
  UploadCloud,
  User,
  X
} from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import {
  Candidate,
  filterOptionsMap,
  statusOptionsByGroup
} from '../../constants/recruitmentConstants'

// ──────────────────────────────────────────────
// Types & Constants
// ──────────────────────────────────────────────

const DETAIL_TABS = [
  { id: 'general', title: 'Thông tin cơ bản', icon: User },
  { id: 'history', title: 'Lịch sử', icon: History }
] as const

type TabId = (typeof DETAIL_TABS)[number]['id'] | 'notes'

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

interface RecruitmentDetailDrawerProps {
  candidate: Candidate | null
  isOpen: boolean
  onClose: () => void
}

// ──────────────────────────────────────────────
// Gender / Ethnicity / Religion options
// ──────────────────────────────────────────────

const EDUCATION_OPTIONS = [
  { value: 'Đại học', label: 'Đại học' },
  { value: 'Thạc sĩ', label: 'Thạc sĩ' },
  { value: 'Tiến sĩ', label: 'Tiến sĩ' },
  { value: 'Cao đẳng', label: 'Cao đẳng' },
  { value: 'Trung cấp', label: 'Trung cấp' },
  { value: 'THPT', label: 'THPT' }
]

// ──────────────────────────────────────────────
// General Info Tab — Editable form
// ──────────────────────────────────────────────

const GeneralInfoPanel = React.memo(({ candidate }: { candidate: Candidate }) => {
  const methods = useForm({
    defaultValues: {
      status: candidate.status || '',
      fullName: candidate.fullName || '',
      dob: candidate.dob || '',
      phone: candidate.phone || '',
      email: candidate.email || '',
      position: candidate.position || '',
      educationLevel: candidate.educationLevel || '',
      major: candidate.major || '',
      university: candidate.university || '',
      currentJob: candidate.currentJob || ''
    }
  })

  const { control } = methods

  useEffect(() => {
    if (candidate) {
      methods.reset({
        status: candidate.status || '',
        fullName: candidate.fullName || '',
        dob: candidate.dob || '',
        phone: candidate.phone || '',
        email: candidate.email || '',
        position: candidate.position || '',
        educationLevel: candidate.educationLevel || '',
        major: candidate.major || '',
        university: candidate.university || '',
        currentJob: candidate.currentJob || ''
      })
    }
  }, [candidate, methods])

  return (
    <FormProvider {...methods}>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <Controller
            name="status"
            control={control}
            render={() => (
              <HrFormField fieldLabel="Ngày ứng tuyển" value={candidate.date} isReadOnly />
            )}
          />
          <div className="flex items-end pb-[2px]">
            <Controller
              name="status"
              control={control}
              render={({ field }) => {
                const selectedOption = filterOptionsMap.status.find(
                  (s) => s.value === field.value || s.label === field.value
                )
                const Icon = selectedOption?.icon || Activity
                return (
                  <div className="flex flex-col gap-1 w-full relative">
                    <label className="text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Trạng thái
                    </label>
                    <Dropdown>
                      <DropdownTrigger>
                        <button
                          type="button"
                          className="flex items-center justify-between w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 h-[40px] px-3 rounded-lg text-sm transition-all focus:border-blue-600 focus:bg-white outline-none"
                        >
                          <div className="flex items-center gap-2">
                            <Icon
                              size={16}
                              className={selectedOption?.color || 'text-gray-400'}
                              strokeWidth={2.5}
                            />
                            <span className="font-normal text-gray-800 dark:text-gray-100 font-['Momo_Trust_Sans',sans-serif]">
                              {selectedOption?.label || 'Chọn trạng thái'}
                            </span>
                          </div>
                          <ChevronDown size={14} className="text-gray-400" />
                        </button>
                      </DropdownTrigger>
                      <DropdownMenu
                        data-react-aria-top-layer="true"
                        aria-label="Chọn trạng thái"
                        className="w-[300px]"
                        classNames={{ base: 'p-1' }}
                        onAction={(key) => {
                          const s = filterOptionsMap.status.find((opt) => opt.value === key)
                          if (s) {
                            field.onChange(s.label)
                          }
                        }}
                      >
                        {statusOptionsByGroup.map(({ group, options }) => (
                          <DropdownSection
                            key={group}
                            title={group}
                            classNames={{
                              heading: 'text-[10px] font-bold text-gray-400 tracking-wider px-2'
                            }}
                          >
                            {options.map((s) => {
                              const SIcon = s.icon || Activity
                              const isActive = s.label === field.value
                              return (
                                <DropdownItem
                                  key={s.value}
                                  className={cn(
                                    'rounded-lg',
                                    isActive && 'bg-blue-50 dark:bg-blue-900/30'
                                  )}
                                  startContent={
                                    <SIcon
                                      size={16}
                                      className={s.color || 'text-gray-400'}
                                      strokeWidth={2.5}
                                    />
                                  }
                                  endContent={
                                    isActive ? (
                                      <CheckCircle2 size={16} className="text-blue-500" />
                                    ) : null
                                  }
                                >
                                  <span
                                    className={cn(
                                      'text-sm',
                                      isActive
                                        ? 'text-blue-600 font-medium dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300'
                                    )}
                                  >
                                    {s.label}
                                  </span>
                                </DropdownItem>
                              )
                            })}
                          </DropdownSection>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                )
              }}
            />
          </div>
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <HrFormField fieldLabel="Họ và tên" value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            name="dob"
            control={control}
            render={({ field }) => (
              <HrFormFieldDate
                fieldLabel="Ngày sinh"
                value={field.value}
                onChangeValue={field.onChange}
              />
            )}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <HrFormField
                fieldLabel="Số điện thoại"
                value={field.value}
                onChange={field.onChange}
                type="tel"
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <HrFormField
                fieldLabel="Email"
                value={field.value}
                onChange={field.onChange}
                type="email"
              />
            )}
          />
          <Controller
            name="educationLevel"
            control={control}
            render={({ field }) => (
              <HrFormFieldSelect
                fieldLabel="Trình độ"
                options={EDUCATION_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="major"
            control={control}
            render={({ field }) => (
              <HrFormField
                fieldLabel="Chuyên ngành"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="university"
            control={control}
            render={({ field }) => (
              <HrFormField
                fieldLabel="Trường đào tạo"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="currentJob"
            control={control}
            render={({ field }) => (
              <HrFormField
                fieldLabel="Công việc hiện tại"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <div className="col-span-2">
            <Controller
              name="position"
              control={control}
              render={({ field }) => (
                <HrFormField
                  fieldLabel="Vị trí ứng tuyển"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      </div>
    </FormProvider>
  )
})
GeneralInfoPanel.displayName = 'GeneralInfoPanel'

// ──────────────────────────────────────────────
// History Tab - Lịch sử chỉnh sửa
// ──────────────────────────────────────────────

const MOCK_EDIT_HISTORY = [
  {
    id: '1',
    editorName: 'Nguyễn Văn A',
    time: '14/03/2026 15:30',
    changes: [
      { field: 'Trạng thái', old: 'Mới ứng tuyển', new: 'Phỏng vấn vòng 1' },
      { field: 'Vị trí', old: 'C# Developer', new: 'Backend Developer' }
    ]
  },
  {
    id: '2',
    editorName: 'Lê Thị B',
    time: '12/03/2026 09:15',
    changes: [
      { field: 'Họ và tên', old: 'Nguyễn Văn Ứng Viên', new: 'Lê Hoàng CQL' },
      { field: 'Email', old: 'nvu@gmail.com', new: 'lehoang@gmail.com' }
    ]
  }
]

const HistoryPanel = React.memo(({ candidate }: { candidate: Candidate }) => (
  <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
    <div className="ml-2.5 flex flex-col pb-2">
      {MOCK_EDIT_HISTORY.map((item) => (
        <div key={item.id} className="relative pl-6 pb-8 border-l-2 border-gray-100">
          {/* Timeline dot */}
          <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[13px] font-bold text-gray-800">{item.editorName}</span>
              <span className="text-gray-300 px-1">•</span>
              <span className="text-[12px] font-medium text-gray-400">{item.time}</span>
            </div>

            <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
              {item.changes.map((change, cIdx) => (
                <div key={cIdx} className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {change.field}
                  </span>
                  <div className="flex items-center gap-3 text-[13px]">
                    <span className="text-gray-500 line-through decoration-gray-300">
                      {change.old}
                    </span>
                    <ArrowRight size={14} className="text-gray-400 shrink-0" />
                    <span className="text-blue-600 font-semibold">{change.new}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Initial state */}
      <div className="relative pl-6 border-l-2 border-transparent">
        <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white" />
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[13px] font-bold text-gray-800">Hệ thống</span>
            <span className="text-gray-300 px-1">•</span>
            <span className="text-[12px] font-medium text-gray-400">{candidate.date}</span>
          </div>
          <span className="text-[13px] text-gray-600">Tạo hồ sơ ứng viên</span>
        </div>
      </div>
    </div>
  </div>
))
HistoryPanel.displayName = 'HistoryPanel'

// ──────────────────────────────────────────────
// Notes Tab — FB Messenger-style grouped by date
// ──────────────────────────────────────────────

/** Parse "13/03 14:45" → { dateKey: "13/03", time: "14:45" } */
function parseNoteTime(raw: string): { dateKey: string; time: string } {
  const parts = raw.trim().split(' ')
  if (parts.length >= 2) return { dateKey: parts[0], time: parts[1] }
  return { dateKey: '', time: raw }
}

/** Group notes by date, preserving insertion order */
function groupNotesByDate(
  notes: { author: string; avatar: string; time: string; content: string }[]
) {
  const groups: {
    dateKey: string
    items: { author: string; avatar: string; time: string; content: string; displayTime: string }[]
  }[] = []
  const map = new Map<string, (typeof groups)[number]>()

  for (const note of notes) {
    const { dateKey, time } = parseNoteTime(note.time)
    if (!map.has(dateKey)) {
      const group = { dateKey, items: [] as (typeof groups)[number]['items'] }
      map.set(dateKey, group)
      groups.push(group)
    }
    map.get(dateKey)!.items.push({ ...note, displayTime: time })
  }
  return groups
}

const NotesPanel = React.memo(({ candidate }: { candidate: Candidate }) => {
  const [notes, setNotes] = useState(candidate.notes || [])
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    setNotes(candidate.notes || [])
  }, [candidate])

  const grouped = useMemo(() => groupNotesByDate(notes), [notes])

  const isSubmitting = useRef(false)

  const handleAddNote = () => {
    if (!newNote.trim() || isSubmitting.current) return
    isSubmitting.current = true

    const now = new Date()
    const dd = String(now.getDate()).padStart(2, '0')
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const hh = String(now.getHours()).padStart(2, '0')
    const mi = String(now.getMinutes()).padStart(2, '0')
    const noteObj = {
      author: 'Admin',
      avatar: '',
      time: `${dd}/${mm} ${hh}:${mi}`,
      content: newNote
    }
    setNotes((prev) => [...prev, noteObj])
    setNewNote('')

    // Release lock on next tick
    setTimeout(() => {
      isSubmitting.current = false
    }, 50)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddNote()
    }
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Scrollable notes area */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {notes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
              <MessageCircle size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium">Chưa có ghi chú nào cho ứng viên này.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {grouped.map((group) => (
              <div key={group.dateKey} className="flex flex-col gap-4">
                {/* Date divider — centered like FB Messenger */}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide shrink-0">
                    {group.dateKey}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Notes within this date */}
                {group.items.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-3 group">
                    {/* Avatar */}
                    {note.avatar ? (
                      <img
                        src={note.avatar}
                        alt={note.author}
                        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <User size={14} className="text-blue-400" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Author + time */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-gray-800">
                          {note.author}
                        </span>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock size={11} />
                          <span className="text-[11px] font-medium">{note.displayTime}</span>
                        </div>
                      </div>
                      {/* Message bubble */}
                      <div className="bg-gray-50 border border-gray-200 rounded-xl rounded-tl-none px-4 py-2.5">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {note.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input area — sticky at bottom */}
      <div className="shrink-0 px-5 py-3 border-t border-gray-100 bg-white">
        <div className="flex gap-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Thêm ghi chú mới (Enter để gửi)..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none min-h-[60px] transition-all"
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
  )
})
NotesPanel.displayName = 'NotesPanel'

// ──────────────────────────────────────────────
// Main Drawer Component
// ──────────────────────────────────────────────

const FILE_CATEGORIES = [
  { key: 'resume', label: 'Hồ sơ của ứng viên' },
  { key: 'idCard', label: 'Căn cước công dân (CCCD)' },
  { key: 'degree', label: 'Bằng cấp' },
  { key: 'englishCert', label: 'Chứng chỉ tiếng Anh' }
] as const

const MOCK_FILES = {
  resume: [
    { name: 'CV_ung_vien_final.pdf', size: '2.4 MB', uploadedAt: '1 ngày trước' },
    { name: 'Portfolio_2024.pdf', size: '5.1 MB', uploadedAt: '2 ngày trước' }
  ],
  idCard: [
    { name: 'Scan_CCCD_Mat_Truoc.jpg', size: '845 KB', uploadedAt: '1 ngày trước' },
    { name: 'Scan_CCCD_Mat_Sau.jpg', size: '720 KB', uploadedAt: '1 ngày trước' }
  ],
  degree: [{ name: 'Bang_Dai_Hoc_CNTT.pdf', size: '1.2 MB', uploadedAt: '3 ngày trước' }],
  englishCert: []
}

const RecruitmentDetailDrawer = React.memo(
  ({ candidate, isOpen, onClose }: RecruitmentDetailDrawerProps) => {
    const [activeView, setActiveView] = useState<TabId>('general')
    const [isSecondaryOpen, setIsSecondaryOpen] = useState(false)

    const statusOption = useMemo(() => {
      if (!candidate?.status) return null
      return filterOptionsMap.status.find((s) => s.label === candidate.status) || null
    }, [candidate?.status])

    if (!candidate) return null

    return (
      <HrDrawer
        isOpen={isOpen}
        onClose={onClose}
        onOpenChange={(open) => !open && onClose()}
        defaultWidth={900}
        blockOutside={true}
        classNames={{ secondaryBody: '!p-0' }}
        isSecondaryOpen={isSecondaryOpen}
        onSecondaryClose={() => setIsSecondaryOpen(false)}
        secondaryWidth={400}
        secondaryTitle="Hồ sơ đính kèm"
        secondaryContent={
          <div className="flex flex-col h-full bg-slate-50/50 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
              {/* Upload Dropzone */}
              <div className="border border-dashed border-purple-300 bg-purple-50/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-purple-50/80 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-purple-600">
                  <UploadCloud size={24} />
                </div>
                <p className="text-[13px] font-semibold text-purple-700 mb-1">
                  Click to Upload{' '}
                  <span className="text-gray-500 font-normal">or drag and drop</span>
                </p>
                <p className="text-[11px] text-gray-400 font-medium">(Max. File size: 25 MB)</p>
              </div>

              {/* File Categories */}
              <div className="flex flex-col gap-6">
                {FILE_CATEGORIES.map((category) => {
                  const files = MOCK_FILES[category.key as keyof typeof MOCK_FILES] || []
                  if (files.length === 0) return null

                  return (
                    <div key={category.key} className="flex flex-col gap-3">
                      <h3 className="text-[13px] font-semibold text-gray-800 uppercase tracking-wide">
                        {category.label}{' '}
                        <span className="text-gray-400 font-medium ml-1">({files.length})</span>
                      </h3>
                      <div className="flex flex-col gap-3">
                        {files.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 border border-gray-200/80 rounded-xl bg-white hover:border-purple-300 transition-colors group"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-lg bg-purple-50/80 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                <FileText size={20} />
                              </div>
                              <div className="flex flex-col items-start gap-1">
                                <span className="text-[13px] font-semibold text-gray-800 line-clamp-1">
                                  {file.name}
                                </span>
                                <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                                  <span>Size: {file.size}</span>
                                  <span>Uploaded: {file.uploadedAt}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              isIconOnly
                              variant="light"
                              size="sm"
                              className="text-gray-400 hover:text-danger hover:bg-danger-50 shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        }
      >
        {/* Header — matches reference: icon + name (uppercase bold) + code badge + status badge */}
        <HrDrawerHeader className="!border-b-0">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <Tooltip
              content="Đóng"
              className="capitalize bg-slate-100"
              radius="none"
              placement="left"
            >
              <Button
                isIconOnly
                startContent={<ChevronRight size={18} />}
                size="sm"
                variant="light"
                onPress={onClose}
              />
            </Tooltip>

            {/* Person avatar circle (no image — use initial) */}
            <div className="w-9 h-9 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center shrink-0 mr-1">
              <User size={18} className="text-blue-500" />
            </div>

            <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
              <span
                className="text-base font-bold text-gray-800 uppercase truncate leading-tight"
                title={candidate.fullName}
              >
                {candidate.fullName}
              </span>

              {/* Code badge */}
              <Chip
                size="sm"
                variant="flat"
                className="bg-blue-50 text-blue-600 border border-blue-200 text-[11px] shrink-0 h-5"
                classNames={{ content: 'font-bold px-1' }}
              >
                Mã: {candidate.mshOnline}
              </Chip>

              {/* Status badge — synced with table icons */}
              {statusOption &&
                (() => {
                  const StatusIcon = statusOption.icon
                  return (
                    <Chip
                      size="sm"
                      variant="flat"
                      className="text-[11px] font-medium shrink-0 h-5 bg-gray-50 border border-gray-200"
                      startContent={
                        StatusIcon ? (
                          <StatusIcon size={12} className={statusOption.color || 'text-gray-500'} />
                        ) : undefined
                      }
                    >
                      {statusOption.label}
                    </Chip>
                  )
                })()}
            </div>

            {/* Action buttons — top right */}
            <div className="flex items-center gap-1 ml-2 shrink-0">
              {!isSecondaryOpen && (
                <Tooltip
                  content="Hồ sơ đính kèm"
                  className="bg-slate-100"
                  radius="none"
                  placement="bottom"
                  delay={0}
                >
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setIsSecondaryOpen(true)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FileText size={18} />
                  </Button>
                </Tooltip>
              )}
              <Tooltip
                content="Đóng"
                className="capitalize bg-slate-100"
                radius="none"
                placement="bottom"
              >
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={onClose}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </Button>
              </Tooltip>
            </div>
          </div>
        </HrDrawerHeader>

        <HrDrawerBody className="p-0!">
          {/* Tab bar */}
          <div className="border-b border-gray-100 bg-white shrink-0 px-2">
            <div className="flex items-center justify-between">
              <div className="flex">
                {DETAIL_TABS.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeView === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveView(tab.id)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative',
                        'hover:bg-gray-50 cursor-pointer',
                        isActive ? 'text-blue-600' : 'text-gray-500'
                      )}
                    >
                      <Icon size={16} />
                      <span>{tab.title}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center pr-2">
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => setActiveView('notes')}
                  className={cn(
                    'text-gray-400 hover:text-blue-600 rounded-full w-9 h-9 min-w-9 transition-colors',
                    activeView === 'notes' && 'text-blue-600 bg-blue-50'
                  )}
                >
                  <div className="relative flex items-center justify-center pt-0.5">
                    <MessageSquareText size={20} className="stroke-[1.5]" />
                    {/* Notification dot */}
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#FF3B30] rounded-full border-2 border-white" />
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Tab content */}
          <div className="flex flex-col flex-1 min-h-0 bg-white overflow-hidden">
            {activeView === 'general' && <GeneralInfoPanel candidate={candidate} />}
            {activeView === 'history' && <HistoryPanel candidate={candidate} />}
            {activeView === 'notes' && <NotesPanel candidate={candidate} />}
          </div>
        </HrDrawerBody>

        {/* Footer — "Huỷ bỏ" (left) + "Lưu chỉnh sửa" (right, primary CTA) */}
        {activeView === 'general' && (
          <HrDrawerFooter>
            <div className="flex w-full items-center justify-end gap-2">
              <Button
                variant="flat"
                onPress={onClose}
                className="font-medium text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                Huỷ bỏ
              </Button>
              <Button
                color="primary"
                className="font-medium text-sm rounded-lg bg-blue-600"
                startContent={<Save size={14} />}
              >
                Lưu chỉnh sửa
              </Button>
            </div>
          </HrDrawerFooter>
        )}
      </HrDrawer>
    )
  }
)

RecruitmentDetailDrawer.displayName = 'RecruitmentDetailDrawer'

export default RecruitmentDetailDrawer
