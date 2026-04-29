import { Button } from '@heroui/react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import DateInputFloatingLabel from '@renderer/components/DateInputFloatingLabel'
import {
  Calendar, Plus, Copy, Trash, Send, AlarmClock, NotebookPen,
  AlertCircle, Trash2
} from 'lucide-react'
import { today, getLocalTimeZone } from '@internationalized/date'
import { calcHours, OvertimeFormValues, TimeSlot } from '../hooks/useCreateOvertimeRequest'
import { useState, useRef, useEffect } from 'react'
import { GoogleTimePicker } from './CustomCalendarView'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDuration = (start: string, end: string) => {
  if (!start || !end) return { text: '0h', valid: false }
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const diff = (eh * 60 + em) - (sh * 60 + sm)
  if (diff <= 0) return { text: 'Giờ kết thúc phải sau giờ bắt đầu', valid: false }
  const h = diff / 60
  return { text: `${h.toFixed(1).replace('.0', '')}h`, valid: true }
}

// ─── Auto-resize textarea hook ────────────────────────────────────────────────

const useAutoResize = (value: string) => {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return ref
}

// ─── Tiêu đề field — large, Google Calendar style ─────────────────────────────

const TieuDeField = ({
  value, onChange, onBlur, isInvalid
}: { value: string; onChange: (v: string) => void; onBlur?: () => void; isInvalid?: boolean }) => {
  const ref = useAutoResize(value)
  return (
    <textarea
      ref={ref}
      rows={1}
      onBlur={onBlur}
      className={`w-full text-[20px] font-normal py-1.5 border-b-2 outline-none transition-all placeholder-[#bdc1c6] dark:placeholder-gray-600 resize-none overflow-hidden bg-transparent text-gray-800 dark:text-gray-100 leading-snug ${isInvalid
          ? 'border-red-400'
          : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
        }`}
      placeholder="Thêm tiêu đề"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

// ─── Chi tiết expandable — Google Calendar style ───────────────────────────────

const ChiTietField = ({
  value, onChange
}: { value: string; onChange: (v: string) => void }) => {
  const [show, setShow] = useState(!!value)
  const ref = useRef<HTMLTextAreaElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  useEffect(() => {
    if (show && ref.current) {
      ref.current.focus()
      ref.current.style.height = 'auto'
      ref.current.style.height = `${ref.current.scrollHeight}px`
    }
  }, [show])

  if (!show) {
    return (
      <div
        role="button" tabIndex={0}
        className="flex items-center gap-3 cursor-pointer group py-1"
        onClick={() => setShow(true)}
        onKeyDown={(e) => e.key === 'Enter' && setShow(true)}
      >
        <NotebookPen size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-[#1a73e8] transition-colors shrink-0" />
        <span className="text-[13px] text-gray-300 dark:text-gray-600 group-hover:text-[#5f6368] dark:group-hover:text-gray-400 transition-colors">
          Thêm mô tả chi tiết...
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <NotebookPen size={18} className="mt-2.5 text-[#1a73e8] shrink-0" />
      <div className="flex-1 relative">
        <textarea
          ref={ref}
          className="w-full bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 dark:text-gray-200 outline-none focus:border-blue-400 resize-none overflow-hidden placeholder-gray-300 dark:placeholder-gray-600 leading-relaxed"
          placeholder="Mô tả chi tiết công việc ngoài giờ..."
          value={value}
          onChange={handleChange}
          style={{ minHeight: '60px' }}
          rows={2}
        />
        {!value && (
          <button
            type="button" tabIndex={-1}
            className="absolute right-2 top-2 w-5 h-5 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-500 hover:text-white transition-all"
            onClick={() => setShow(false)}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Single time slot row ──────────────────────────────────────────────────────

const SlotRow = ({
  slot, onUpdate, onRemove, canRemove
}: {
  slot: TimeSlot
  onUpdate: (field: 'startTime' | 'endTime', val: string) => void
  onRemove: () => void
  canRemove: boolean
}) => {
  const dur = getDuration(slot.startTime, slot.endTime)
  return (
    <div className="flex items-center gap-2 animate-in slide-in-from-top-1">
      <GoogleTimePicker value={slot.startTime} onChange={(v) => onUpdate('startTime', v)} />
      <span className="text-gray-300 font-light">—</span>
      <GoogleTimePicker value={slot.endTime} minTime={slot.startTime} onChange={(v) => onUpdate('endTime', v)} />
      <span className={`text-[12px] font-bold min-w-[28px] ${dur.valid ? 'text-[#1a73e8]' : 'text-red-500'}`}>
        {dur.valid ? `(${dur.text})` : <AlertCircle size={13} className="inline animate-pulse text-red-400" />}
      </span>
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface OvertimeFormContentProps {
  form: UseFormReturn<OvertimeFormValues>
  entries: any[]
  employeeOptions: any[]
  handleAddEntry: () => void
  handleRemoveEntry: (index: number) => void
  handleDuplicateEntry: (index: number) => void
  isLoadingEmployees?: boolean
  isEmployeeSelectDisabled?: boolean
  handleCreate?: () => void
  isLoading?: boolean
  isMultipleSelect?: boolean
}

export const OvertimeFormContent = ({
  form,
  entries,
  employeeOptions,
  handleAddEntry,
  handleRemoveEntry,
  handleDuplicateEntry,
  isLoadingEmployees,
  isEmployeeSelectDisabled,
  handleCreate,
  isLoading,
  isMultipleSelect
}: OvertimeFormContentProps) => {
  const { control, watch, setValue } = form
  const watchedEntries = watch('entries')
  const hasEntries = entries.length > 0

  const totalSlots = watchedEntries.reduce((s, e) => s + (e.slots?.length || 0), 0)
  const totalHours = watchedEntries.reduce((acc, e) =>
    acc + (e.slots || []).reduce((s: number, sl: TimeSlot) => s + calcHours(sl.startTime || '', sl.endTime || ''), 0), 0
  )

  // ── Slot mutation helpers ─────────────────────────────────────

  const addSlot = (entryIndex: number) => {
    const current = form.getValues(`entries.${entryIndex}.slots`) as TimeSlot[] || []
    const last = current[current.length - 1]
    // Default if no previous slot
    let newStart = '17:30'
    let newEnd = '19:00'
    if (last?.endTime) {
      // New slot starts where previous ends, lasts 1h30
      const [h, m] = last.endTime.split(':').map(Number)
      const startMins = h * 60 + m
      const endMins = startMins + 90  // +1h30
      if (startMins < 23 * 60) {
        newStart = `${String(Math.floor(startMins / 60)).padStart(2, '0')}:${String(startMins % 60).padStart(2, '0')}`
        newEnd = `${String(Math.min(Math.floor(endMins / 60), 23)).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`
      }
    }
    setValue(`entries.${entryIndex}.slots`, [
      ...current,
      { id: Date.now(), startTime: newStart, endTime: newEnd }
    ])
  }

  const removeSlot = (entryIndex: number, slotIndex: number) => {
    const current = form.getValues(`entries.${entryIndex}.slots`) as TimeSlot[] || []
    setValue(`entries.${entryIndex}.slots`, current.filter((_, i) => i !== slotIndex))
  }

  const updateSlot = (entryIndex: number, slotIndex: number, field: 'startTime' | 'endTime', val: string) => {
    const current = [...(form.getValues(`entries.${entryIndex}.slots`) as TimeSlot[] || [])]
    const updatedSlot = { ...current[slotIndex], [field]: val }
    
    // Auto-increment end time by 1h when start time is changed
    if (field === 'startTime' && val) {
      const [h, m] = val.split(':').map(Number)
      if (!isNaN(h) && !isNaN(m)) {
        const endH = Math.min(h + 1, 23)
        updatedSlot.endTime = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      }
    }
    
    current[slotIndex] = updatedSlot
    setValue(`entries.${entryIndex}.slots`, current)
  }

  return (
    <div className="flex flex-col h-full font-sans text-[#3c4043] dark:text-gray-200">

      {/* ── Employee selector ──────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 bg-white dark:bg-gray-900">
        <Controller
          name="selectedEmployeeId"
          control={control}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <SelectDropdown
              label="Nhân viên"
              multiple={isMultipleSelect}
              options={employeeOptions.map((opt: any) => ({
                ...opt,
                data_display_label: (
                  <span>
                    <span className="font-semibold">{opt.label}</span>
                    {opt.bo_phan && <span className="text-default-500 ml-2 text-xs">({opt.bo_phan})</span>}
                  </span>
                )
              }))}
              value={field.value}
              onChange={(val) => field.onChange(val)}
              isRequired
              placeholder={isLoadingEmployees ? 'Đang tải...' : 'Chọn nhân viên'}
              isDisabled={isEmployeeSelectDisabled}
              isInvalid={fieldState.invalid}
              size="md"
            />
          )}
        />
      </div>

      <div className="mx-5 h-px bg-gray-100 dark:bg-gray-800 shrink-0" />

      {/* ── Section header ─────────────────────────────────────── */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0">
        <div className="flex items-center gap-2">
          <AlarmClock size={14} className="text-[#1a73e8]" />
          <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Thời gian
          </h3>
          {hasEntries && (
            <span className="text-[11px] font-bold text-[#1a73e8] bg-[#e8f0fe] dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
              {entries.length} ngày · {totalSlots} khung giờ{totalHours > 0 ? ` · ${Math.round(totalHours * 10) / 10}h` : ''}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAddEntry}
          className="flex items-center gap-1 text-[12px] font-bold text-[#1a73e8] hover:bg-[#e8f0fe] dark:hover:bg-blue-900/20 px-2.5 py-1 rounded-full transition-colors"
        >
          <Plus size={13} />
          Thêm ngày
        </button>
      </div>

      {/* ── Entries ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {!hasEntries ? (

          /* Empty state */
          <div className="flex flex-col items-center justify-center py-14 px-6 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#e8f0fe] dark:bg-blue-900/20 flex items-center justify-center">
              <Calendar size={26} className="text-[#1a73e8]" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-gray-700 dark:text-gray-200 mb-1">Chưa có ngày đăng ký</p>
              <p className="text-[12px] text-gray-400 dark:text-gray-500">Nhấn nút + để thêm ngày làm thêm giờ</p>
            </div>
            <button
              type="button"
              onClick={handleAddEntry}
              className="flex items-center gap-2 h-10 px-5 rounded-full bg-[#1a73e8] text-white text-[13px] font-semibold hover:bg-[#1b66c9] active:scale-95 transition-all shadow-sm"
            >
              <Plus size={14} />
              Thêm ngày đăng ký
            </button>
          </div>

        ) : (
          <div className="px-4 pb-4 pt-1 space-y-3">
            {entries.map((entry, index) => {
              const watchedSlots: TimeSlot[] = watchedEntries[index]?.slots || []
              const dayHours = watchedSlots.reduce(
                (acc, sl) => acc + calcHours(sl.startTime || '', sl.endTime || ''), 0
              )

              return (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden"
                >
                  {/* ── Card header ──────────────────────────── */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#e8f0fe] dark:bg-blue-900/40 flex items-center justify-center text-[10px] font-bold text-[#1a73e8]">
                        {index + 1}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                        Ngày {index + 1}
                      </span>
                      {dayHours > 0 && (
                        <span className="text-[10px] font-bold text-[#1a73e8] bg-[#e8f0fe] dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">
                          {Math.round(dayHours * 10) / 10}h
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleDuplicateEntry(index)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-[#1a73e8] hover:bg-[#e8f0fe] dark:hover:bg-blue-900/20 transition-colors"
                        title="Nhân bản"
                      >
                        <Copy size={13} />
                      </button>
                      {entries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEntry(index)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── Card body — Google Calendar style ──────── */}
                  <div className="px-5 py-3 space-y-3">

                    {/* 1. Tiêu đề — large, prominent, FIRST */}
                    <Controller
                      name={`entries.${index}.reason`}
                      control={control}
                      rules={{ required: 'Vui lòng nhập tiêu đề' }}
                      render={({ field, fieldState }) => (
                        <div>
                          <TieuDeField
                            value={field.value || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            isInvalid={fieldState.invalid}
                          />
                          {fieldState.error?.message && (
                            <p className="mt-1 text-[12px] text-red-500 font-medium flex items-center gap-1">
                              <AlertCircle size={11} />
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />

                    {/* 2. Chi tiết — expandable below title */}
                    <Controller
                      name={`entries.${index}.chi_tiet`}
                      control={control}
                      render={({ field }) => (
                        <ChiTietField value={field.value || ''} onChange={field.onChange} />
                      )}
                    />

                    <div className="h-px bg-gray-100 dark:bg-gray-800" />

                    {/* 3. Ngày đăng ký */}
                    <div className="flex items-start gap-3">
                      <Calendar size={18} className="mt-2 text-[#5f6368] dark:text-gray-400 shrink-0" />
                      <div className="flex-1">
                        <Controller
                          name={`entries.${index}.date`}
                          control={control}
                          rules={{ required: true }}
                          render={({ field, fieldState }) => (
                            <>
                              <DateInputFloatingLabel
                                label="Ngày đăng ký"
                                value={field.value || ''}
                                onChange={(val) => {
                                  form.clearErrors(`entries.${index}.date`)
                                  const otherDates = watchedEntries
                                    .filter((_, i) => i !== index)
                                    .map((e) => e.date)
                                  if (otherDates.includes(val)) {
                                    form.setError(`entries.${index}.date`, {
                                      type: 'manual',
                                      message: 'Ngày này đã được chọn'
                                    })
                                    return
                                  }
                                  field.onChange(val)
                                }}
                                size="md"
                                isRequired
                                isInvalid={fieldState.invalid}
                                isFloatingLabel={false}
                                labelPlacement="outside"
                                minValue={today(getLocalTimeZone())}
                              />
                              {fieldState.error?.message && (
                                <p className="text-xs text-red-500 mt-1">⚠️ {fieldState.error.message}</p>
                              )}
                            </>
                          )}
                        />
                      </div>
                    </div>

                    {/* 4. Khung giờ list — multiple slots */}
                    <div className="flex items-start gap-3">
                      <AlarmClock size={18} className="mt-1 text-[#5f6368] dark:text-gray-400 shrink-0" />
                      <div className="flex-1 space-y-2">
                        {watchedSlots.map((slot, slotIdx) => (
                          <SlotRow
                            key={slot.id}
                            slot={slot}
                            onUpdate={(field, val) => updateSlot(index, slotIdx, field, val)}
                            onRemove={() => removeSlot(index, slotIdx)}
                            canRemove={watchedSlots.length > 1}
                          />
                        ))}

                        {/* Add slot button */}
                        <button
                          type="button"
                          onClick={() => addSlot(index)}
                          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1a73e8] hover:bg-[#e8f0fe] dark:hover:bg-blue-900/20 py-1 px-2 -ml-2 rounded-full transition-all active:scale-95"
                        >
                          <Plus size={14} />
                          Thêm khung giờ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Add day button */}
            <button
              type="button"
              onClick={handleAddEntry}
              className="w-full h-11 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 text-[13px] font-medium text-gray-400 hover:border-[#1a73e8] hover:text-[#1a73e8] hover:bg-[#e8f0fe]/30 dark:hover:bg-blue-900/10 transition-all"
            >
              <Plus size={14} />
              Thêm ngày khác
            </button>
          </div>
        )}
      </div>

      {/* ── Sticky submit ───────────────────────────────────────── */}
      {handleCreate && hasEntries && (
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <button
            type="button"
            onClick={handleCreate}
            disabled={isLoading}
            className="w-full h-12 rounded-full bg-[#1a73e8] hover:bg-[#1b66c9] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send size={15} />
                Lưu đăng ký{entries.length > 1 ? ` (${entries.length} ngày)` : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
