import { FloatingPortal } from '@floating-ui/react';
import { SelectDropdown } from '@renderer/components/SelectDropdown';
import { Tooltip } from '@heroui/react';
import {
  AlertCircle,
  AlignLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  Loader2,
  NotebookPen,
  Plus,
  Repeat,
  RotateCcw,
  Trash2,
  Users,
  X
} from 'lucide-react';
import moment from 'moment';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleTimePicker } from './CustomCalendarView';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '../constants';
import { useQuery } from '@tanstack/react-query';
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios';
import { ngayleAxios } from '@renderer/api/admin/ngayleAxios';

/* ═══════════════════════════════
   Types
═══════════════════════════════ */
export type RepeatMode = 'none' | 'daily' | 'weekly' | 'monthly' | 'weekdays'

export interface EmployeeOption {
  value: string | number
  label: string
  ho_va_ten?: string
  ma_nhan_vien?: string
  bo_phan?: string
  ql_nguoi_dung_id?: string | number
}

export interface OvertimeExistingShift {
  id: number;
  start: string;
  end: string;
  status: string; // 'Da_duyet' | 'Tu_choi' | 'Cho_duyet' etc.
  reason: string;
  chi_tiet?: string;
  isDotXuat?: boolean;
  soLanHuy?: number;
}

export interface NewSlot {
  id: number;
  start: string;
  end: string;
}

interface RepeatDropdownProps {
  value: RepeatMode
  onChange: (val: RepeatMode) => void
  dateStr: string
}

export interface OvertimeQuickAddPopupProps {
  popupDate: string; // ISO date string or '__blank__'
  existingShifts: OvertimeExistingShift[];
  allowedDateRange?: { start: string; end: string } | null;

  employeeOptions?: EmployeeOption[];
  selectedEmployees?: string[];
  onSelectedEmployeesChange?: (ids: string[]) => void;
  isMultipleSelect: boolean;

  isSubmitting: boolean;

  onClose: () => void;
  onSubmitNewSlots: (reason: string, date: string, slots: NewSlot[], repeatMode: RepeatMode, chi_tiet?: string, is_dot_xuat?: number) => void;
  onUpdateShift: (shiftId: number, start: string, end: string, reason: string, chiTiet?: string) => Promise<boolean>;
  onReopenShift?: (shiftId: number, start: string, end: string, reason: string, chiTiet?: string) => Promise<boolean>;
  onDeleteShift: (shiftId: number, reason: string) => Promise<boolean>;

  renderRepeatDropdown: (props: RepeatDropdownProps) => React.ReactNode;

  lockedDates?: Set<string>;
  isLocked?: boolean;
  canByLeader?: boolean;
  canCreateFor?: boolean;
}

export const CancelConfirmModal = ({
  shift,
  isDeleteSaving,
  onClose,
  onConfirm
}: {
  shift: OvertimeExistingShift | null;
  isDeleteSaving: boolean;
  onClose: () => void;
  onConfirm: (shiftId: number, reason: string) => void;
}) => {
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (shift?.id) {
      setCancelReason('');
      setError(false);
    }
  }, [shift?.id]);

  if (!shift?.id) return null;

  const CANCEL_SUGGESTIONS = [
    "Thay đổi kế hoạch công việc",
    "Đã hoàn thành công việc trong giờ",
    "Có việc bận đột xuất",
    "Lý do cá nhân"
  ];

  const handleConfirm = () => {
    if (!cancelReason.trim()) {
      setError(true);
      return;
    }
    onConfirm(shift.id, cancelReason);
  };

  return (
    <div data-react-aria-top-layer="true" className="fixed inset-0 bg-[#3c4043]/60 z-[70] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-[24px] max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-[#202124] dark:text-gray-100 mb-2">Hủy đăng ký này?</h3>
        <p className="text-[13px] text-[#5f6368] dark:text-gray-400 mb-3 leading-relaxed">Vui lòng chọn hoặc nhập lý do hủy đăng ký:</p>

        {shift.soLanHuy !== undefined && (
          <div className="mb-4 text-[12px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 p-2 rounded-md border border-amber-100 dark:border-amber-800">
            Số lần hủy còn lại có thể thao tác đăng ký lại: <span className="font-bold">{Math.max(0, 3 - shift.soLanHuy)} lần</span>
          </div>
        )}

        <textarea
          autoFocus={false}
          className={`w-full bg-white dark:bg-[#2a2a2a] border rounded-lg p-3 text-sm outline-none resize-none mb-1 transition-colors ${error
            ? 'border-red-500 focus:border-red-500'
            : 'border-gray-200 dark:border-gray-700 focus:border-[#1a73e8]'
            }`}
          rows={2}
          placeholder="Nhập lý do hủy..."
          value={cancelReason}
          onChange={(e) => {
            setCancelReason(e.target.value);
            if (error) setError(false);
          }}
        />
        {error && <p className="text-red-500 text-[12px] mb-3 ml-1">Vui lòng nhập lý do hủy đăng ký!</p>}
        {!error && <div className="h-3 mb-1"></div>}

        <div className="flex flex-wrap gap-2 mb-6">
          {CANCEL_SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => {
                setCancelReason(s);
                if (error) setError(false);
              }}
              className="text-[12px] bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-gray-700 text-[#5f6368] dark:text-gray-300 px-2.5 py-1.5 rounded-md transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isDeleteSaving}
            className="px-5 py-1.5 text-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe] dark:hover:bg-[#1a73e8]/20 rounded-full transition-colors disabled:opacity-50"
          >
            Bỏ qua
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleteSaving}
            className="px-6 py-1.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-full shadow-sm disabled:opacity-70 flex items-center gap-2"
          >
            {isDeleteSaving ? <Loader2 size={14} className="animate-spin" /> : null}
            Hủy đăng ký
          </button>
        </div>
      </div>
    </div>
  );
};

const ENABLE_OVERTIME_REVIEW = false; // Feature flag to hide the review box until approved

export const OvertimeQuickAddPopup = ({
  popupDate,
  existingShifts,
  allowedDateRange = null,
  employeeOptions = [],
  selectedEmployees = [],
  onSelectedEmployeesChange,
  isMultipleSelect,
  isSubmitting,
  onClose,
  onSubmitNewSlots,
  onUpdateShift,
  onReopenShift,
  onDeleteShift,
  renderRepeatDropdown,
  lockedDates,
  isLocked: propIsLocked = false,
  canByLeader = false,
  canCreateFor = false
}: OvertimeQuickAddPopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null);

  const isBlank = popupDate === '__blank__';

  const [reason, setReason] = useState('');
  const [chiTiet, setChiTiet] = useState('');
  const [showChiTiet, setShowChiTiet] = useState(false);
  const normalizedAllowedRange = useMemo(() => {
    if (canByLeader) return null;
    if (!allowedDateRange?.start || !allowedDateRange?.end) return null;
    const start = allowedDateRange.start.split(' ')[0];
    const end = allowedDateRange.end.split(' ')[0];
    if (!moment(start, 'YYYY-MM-DD', true).isValid() || !moment(end, 'YYYY-MM-DD', true).isValid()) {
      return null;
    }
    return { start, end };
  }, [allowedDateRange, canByLeader]);

  const clampDateToAllowedRange = (inputDate: string) => {
    if (!normalizedAllowedRange) return inputDate;
    const m = moment(inputDate, 'YYYY-MM-DD', true);
    if (!m.isValid()) return normalizedAllowedRange.start;
    if (m.isBefore(normalizedAllowedRange.start, 'day')) return normalizedAllowedRange.start;
    if (m.isAfter(normalizedAllowedRange.end, 'day')) return normalizedAllowedRange.end;
    return inputDate;
  };

  const [date, setDate] = useState(() => {
    if (!isBlank) return popupDate;
    const today = moment().format('YYYY-MM-DD');
    return clampDateToAllowedRange(today);
  });
  const [newSlots, setNewSlots] = useState<NewSlot[]>(() =>
    existingShifts.length === 0
      ? [{ id: Date.now(), start: '17:30', end: '19:00' }]
      : []
  );
  const [isListExpanded, setIsListExpanded] = useState(true);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [dateError, setDateError] = useState(false);
  const [reasonError, setReasonError] = useState(false);

  const [showConfirmDelete, setShowConfirmDelete] = useState<OvertimeExistingShift | null>(null);
  const [editingShiftId, setEditingShiftId] = useState<number | null>(null);
  const [tempEditData, setTempEditData] = useState<OvertimeExistingShift | null>(null);
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [isDeleteSaving, setIsDeleteSaving] = useState(false);

  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    if (!isBlank) return;
    const nextDate = clampDateToAllowedRange(date || moment().format('YYYY-MM-DD'));
    if (nextDate !== date) setDate(nextDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBlank, normalizedAllowedRange?.start, normalizedAllowedRange?.end]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(moment()), 1000);
    return () => clearInterval(timer);
  }, []);

  const targetDateStr = popupDate === '__blank__' || !popupDate ? date : popupDate;
  const isLocked = lockedDates ? lockedDates.has(targetDateStr) : propIsLocked;

  // Always use today's date to build the deadline moment, so the comparison depends purely on real time!
  const deadlineMoment = moment().hour(DEADLINE_HOUR).minute(DEADLINE_MINUTE).second(0);

  const isToday = moment(targetDateStr).isSame(currentTime, 'day');

  // Đăng ký đột xuất khi:
  // 1. Ngày đã bị khóa và người dùng là lãnh đạo (ghi đè khóa)
  // 2. Hoặc là ngày hôm nay, nhưng đã quá hạn (sau deadline)
  const isDotXuat = (!!isLocked && !!canByLeader) ||
    (isToday && currentTime.isAfter(deadlineMoment));

  const showCountdown = isToday && !isDotXuat;

  const countdownDiff = moment.duration(deadlineMoment.diff(currentTime));
  const formatTime = (v: number) => String(Math.floor(Math.max(0, v))).padStart(2, '0');
  const countdownText = `${formatTime(countdownDiff.hours())}:${formatTime(countdownDiff.minutes())}:${formatTime(countdownDiff.seconds())}`;

  const getTotalHours = (slots: { start: string, end: string }[]) => {
    return slots.reduce((acc, slot) => {
      if (!slot.start || !slot.end) return acc;
      const [sH, sM] = slot.start.split(':').map(Number);
      const [eH, eM] = slot.end.split(':').map(Number);
      let mins = (eH * 60 + eM) - (sH * 60 + sM);
      if (mins < 0) mins += 1440; // over midnight
      return acc + (mins / 60);
    }, 0);
  };

  const totalExisting = getTotalHours(existingShifts.filter(s => s.status !== 'Huy' && s.status !== 'Tu_choi'));
  const totalNew = getTotalHours(newSlots);
  const totalOvertime = totalExisting + totalNew;

  // Lấy dữ liệu ngày lễ
  const targetYear = moment(targetDateStr).year();
  const { data: holidaysRes } = useQuery({
    queryKey: ['hrmNgoaiGio', 'holidays', targetYear],
    queryFn: () => ngoaiGioAxios.getNgayLe({ year: targetYear, is_active: 1 }),
    staleTime: 24 * 60 * 60 * 1000 // Cache 24h
  });

  const isHoliday = useMemo(() => {
    if (!holidaysRes?.data) return false;
    const dateFormatted = moment(targetDateStr).format('YYYY-MM-DD');
    return !!holidaysRes.data[dateFormatted];
  }, [holidaysRes?.data, targetDateStr]);

  // Lấy tên ngày lễ cụ thể (nếu có)
  const holidayName = useMemo(() => {
    if (!holidaysRes?.data) return null;
    const dateFormatted = moment(targetDateStr).format('YYYY-MM-DD');
    const entry = (holidaysRes.data as Record<string, { ten: string }>)[dateFormatted];
    return entry?.ten ?? null;
  }, [holidaysRes?.data, targetDateStr]);

  // Kiểm tra ngày chọn có nằm trong kỳ nghỉ lễ nào đã ban hành không
  const { data: ngayLeRes } = useQuery({
    queryKey: ['ngayle', 'all', targetYear],
    queryFn: () => ngayleAxios.getAll({ page: 1, length: -1 }),
    staleTime: 24 * 60 * 60 * 1000
  });

  const matchingHoliday = useMemo(() => {
    const raw = ngayLeRes?.data;
    if (!raw) return null;
    const arr: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    const tgt = moment(targetDateStr).format('YYYY-MM-DD');
    return arr.find(h => {
      const s = h.batdau || h.ngay;
      const e = h.ketthuc || h.ngay;
      return s && e && tgt >= s && tgt <= e;
    }) ?? null;
  }, [ngayLeRes, targetDateStr]);

  const dt = moment(targetDateStr);
  const isWeekend = dt.day() === 0; // 0 là Chủ nhật. Thứ 7 là ngày đi làm bình thường.
  const isOffDay = isWeekend || isHoliday || !!matchingHoliday;

  // Tên hiển thị cho loại ngày trong review box — ưu tiên tên từ ngayle system
  const offDayLabel = matchingHoliday?.ten_ngay_le
    || (isHoliday && holidayName ? holidayName : isWeekend ? 'Chủ nhật' : 'ngày nghỉ/lễ');

  // Giờ làm thêm tối đa: 4h ngày thường (50% của 8h), 12h ngày nghỉ/lễ
  const MAX_OVERTIME = isOffDay ? 12 : 4;
  const isViolating = totalOvertime > MAX_OVERTIME;

  const mainTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const editTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = (target: HTMLTextAreaElement | null) => {
    if (target) {
      target.style.height = 'auto';
      target.style.height = `${target.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResize(mainTextAreaRef.current);
  }, [reason]);

  useEffect(() => {
    if (editingShiftId) {
      autoResize(editTextAreaRef.current);
    }
  }, [tempEditData?.reason, editingShiftId]);

  const getDurationInfo = (start: string, end: string) => {
    if (!start || !end) return { text: "0h", isValid: true };
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    const startMins = sH * 60 + sM;
    const endMins = eH * 60 + eM;

    let diffInMinutes = endMins - startMins;
    const isValid = diffInMinutes > 0;

    if (diffInMinutes < 0) diffInMinutes += 24 * 60;
    const hours = diffInMinutes / 60;

    // Return explicit error message if invalid
    if (!isValid) {
      return {
        text: 'Giờ kết thúc phải sau giờ bắt đầu',
        isValid: false
      };
    }

    return {
      text: `${hours.toFixed(1).replace('.0', '')}h`,
      isValid: true
    };
  };

  const handleFinalSave = () => {
    let hasError = false;
    if (!reason.trim() && newSlots.length > 0) {
      setReasonError(true);
      hasError = true;
    }
    if (!date) {
      setDateError(true);
      hasError = true;
    }
    if (
      isBlank &&
      normalizedAllowedRange &&
      (moment(date).isBefore(normalizedAllowedRange.start, 'day') ||
        moment(date).isAfter(normalizedAllowedRange.end, 'day'))
    ) {
      setDateError(true);
      hasError = true;
    }

    // Check if valid times in newSlots
    const invalidSlot = newSlots.find(s => !getDurationInfo(s.start, s.end).isValid);
    if (invalidSlot) {
      const dur = getDurationInfo(invalidSlot.start, invalidSlot.end);
      // @ts-ignore - Assuming toast is available or using window.alert as fallback if not imported correctly
      // In this codebase we use @heroui-v3 toast or similar
      import('@heroui-v3/react').then(({ toast }) => {
        toast('Lỗi thời gian', { description: dur.text, variant: 'danger' });
      }).catch(() => {
        // Fallback if toast import fails in this context
      });
      hasError = true;
    }

    if (hasError) return;

    onSubmitNewSlots(reason, date, newSlots, repeatMode, chiTiet, isDotXuat ? 1 : 0);
  };

  const addOneHour = (time: string): string => {
    const [h, m] = time.split(':').map(Number);
    const newH = (h + 1) % 24;
    return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const addNewSlot = () => {
    const last = newSlots[newSlots.length - 1]
    let newStart = '17:30'
    let newEnd = '19:00'

    if (last?.end) {
      // Slot mới bắt đầu từ thời điểm kết thúc của slot trước, kéo dài 1.5 giờ
      const [h, m] = last.end.split(':').map(Number)
      const startMins = h * 60 + m
      const endMins = startMins + 90  // +1.5 giờ

      if (startMins < 23 * 60) {
        newStart = `${String(Math.floor(startMins / 60)).padStart(2, '0')}:${String(startMins % 60).padStart(2, '0')}`
        newEnd = `${String(Math.min(Math.floor(endMins / 60), 23)).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`
      }
    }

    setNewSlots([...newSlots, { id: Date.now(), start: newStart, end: newEnd }]);
  };

  const removeNewSlot = (id: number) => {
    setNewSlots(newSlots.filter(slot => slot.id !== id));
  };

  const updateNewSlot = (id: number, field: keyof NewSlot, value: string) => {
    setNewSlots(newSlots.map(slot => {
      if (slot.id !== id) return slot;

      const updatedSlot = { ...slot, [field]: value };

      // Auto-increment end time by 1h when start time is updated
      if (field === 'start' && value) {
        const [h, m] = value.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          const endH = Math.min(h + 1, 23);
          updatedSlot.end = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }
      }

      return updatedSlot;
    }));
  };

  const startEditing = (shift: OvertimeExistingShift) => {
    setEditingShiftId(shift.id);
    setTempEditData({ ...shift });
  };

  const handleSaveEdit = async () => {
    if (!tempEditData) return;
    const dur = getDurationInfo(tempEditData.start, tempEditData.end);
    if (!dur.isValid) return; // Prevent saving if invalid times

    setIsEditSaving(true);
    let success = false;

    if (tempEditData.status === 'Huy' && onReopenShift) {
      success = await onReopenShift(tempEditData.id, tempEditData.start, tempEditData.end, tempEditData.reason, tempEditData.chi_tiet);
    } else {
      success = await onUpdateShift(tempEditData.id, tempEditData.start, tempEditData.end, tempEditData.reason, tempEditData.chi_tiet);
    }

    setIsEditSaving(false);
    if (success) setEditingShiftId(null);
  };

  const handleConfirmDelete = async (shiftId: number, reason: string) => {
    setIsDeleteSaving(true);
    const success = await onDeleteShift(shiftId, reason);
    setIsDeleteSaving(false);
    if (success) {
      setShowConfirmDelete(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Da_duyet': return { bar: 'bg-[#137333]', bg: 'bg-[#e6f4ea] dark:bg-[#137333]/20', text: 'text-[#137333] dark:text-[#81c995]', label: 'ĐÃ DUYỆT' };
      case 'Cho_duyet': return { bar: 'bg-[#b06000]', bg: 'bg-[#fef7e0] dark:bg-[#b06000]/20', text: 'text-[#b06000] dark:text-[#fde293]', label: 'CHỜ DUYỆT' };
      case 'Tu_choi': return { bar: 'bg-[#c5221f]', bg: 'bg-[#fce8e6] dark:bg-[#c5221f]/20', text: 'text-[#c5221f] dark:text-[#f28b82]', label: 'TỪ CHỐI' };
      default: return { bar: 'bg-gray-400', bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', label: '—' };
    }
  };

  return (
    <FloatingPortal>
      <div data-react-aria-top-layer="true" className="fixed inset-0 z-50 bg-black/20" onClick={onClose} />

      <div data-react-aria-top-layer="true" ref={popupRef} className="fixed inset-0 z-[51] flex items-center justify-center pointer-events-none p-4 font-sans text-[#3c4043] dark:text-gray-200">
        <div className={`bg-white dark:bg-[#1e1e1e] w-full ${showChiTiet ? 'max-w-[680px]' : 'max-w-[480px]'} rounded-2xl shadow-[0_24px_38px_3px_rgba(0,0,0,0.14),0_9px_46px_8px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col max-h-[95vh] relative transition-all duration-300 pointer-events-auto`}>

          {/* Header */}
          <div className="px-5 py-2.5 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 shrink-0">
            <span className="text-lg font-semibold text-[#3c4043] dark:text-gray-200 tracking-tight">Đăng ký ngoài giờ</span>
            <div onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer text-gray-500 transition-colors">
              <X size={20} />
            </div>
          </div>

          {/* Body */}
          <div className="px-8 sm:px-10 pb-4 space-y-3 overflow-y-auto relative text-[14px] flex-1 min-h-0 custom-scrollbar">

            {/* Reason row */}
            <div className="flex items-start gap-4 group pt-2">
              <div className="mt-2 text-[#5f6368] group-focus-within:text-[#1a73e8] transition-colors shrink-0">
                <AlignLeft size={22} />
              </div>
              <div className="flex-1">
                <textarea
                  ref={mainTextAreaRef}
                  rows={1}
                  className={`w-full text-2xl font-normal py-1 border-b-2 outline-none transition-all placeholder-[#bdc1c6] resize-none overflow-hidden bg-transparent ${reasonError ? 'border-[#d93025]' : 'border-[#e0e0e0] dark:border-gray-700 focus:border-[#1a73e8]'}`}
                  placeholder="Thêm tiêu đề"
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); setReasonError(false); }}
                />
              </div>
            </div>

            {/* chi_tiet row — standalone Google Calendar style */}
            {showChiTiet ? (
              <div className="flex items-start gap-4 group">
                <div className="mt-[10px] text-[#5f6368] group-focus-within:text-[#1a73e8] transition-colors shrink-0">
                  <NotebookPen size={20} />
                </div>
                <div className="flex-1 relative">
                  <textarea
                    className="w-full bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#1a73e8] resize-none overflow-hidden"
                    placeholder="Thêm nội dung mô tả chi tiết..."
                    value={chiTiet}
                    onChange={(e) => {
                      setChiTiet(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    style={{ minHeight: '60px' }}
                  />
                  {!chiTiet && (
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-2 top-2 rounded-full text-gray-300 hover:p-1 hover:bg-red-500 hover:text-white transition-all hover:cursor-pointer"
                      onClick={() => setShowChiTiet(false)}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => setShowChiTiet(true)}
                onKeyDown={(e) => e.key === 'Enter' && setShowChiTiet(true)}
              >
                <div className="text-[#5f6368] group-hover:text-[#1a73e8] transition-colors shrink-0">
                  <NotebookPen size={20} />
                </div>
                <span className="text-[#bdc1c6] group-hover:text-[#5f6368] text-sm py-1 transition-colors">
                  Thêm mô tả chi tiết...
                </span>
              </div>
            )}

            <div className="relative space-y-3">

              {isMultipleSelect && employeeOptions.length > 0 && (
                <div className="flex items-center gap-4 relative z-10 animate-in fade-in">
                  <div className="text-[#5f6368] shrink-0">
                    <Users size={22} />
                  </div>
                  <div className="flex-1 w-full min-w-0">
                    <SelectDropdown
                      multiple
                      variant="flat"
                      radius="md"
                      size="sm"
                      maxVisibleChips={3}
                      hideLabel
                      label="Nhân viên"
                      options={employeeOptions.map((opt: EmployeeOption) => ({
                        value: String(opt.value),
                        label: opt.label,
                        data_display_label: (
                          <span>
                            <span className="font-semibold">{opt.ho_va_ten || opt.label}</span>
                            {opt.bo_phan && <span className="text-default-500 ml-2 text-xs">({opt.bo_phan})</span>}
                          </span>
                        )
                      }))}
                      value={selectedEmployees}
                      onChange={(val) => onSelectedEmployeesChange?.(Array.isArray(val) ? val.map(String) : [String(val)])}
                      placeholder="Nhân viên (nếu thêm cho người khác)"
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 relative z-10">
                <div className="text-[#5f6368] bg-white dark:bg-[#1e1e1e] shrink-0">
                  <Clock size={22} />
                </div>
                <div className="flex items-center gap-2">
                  {isBlank ? (
                    <input
                      type="date"
                      className={`px-3 py-1.5 bg-[#e8eaed] dark:bg-gray-700 rounded text-[13px] outline-none font-medium hover:bg-[#dadce0] focus:bg-[#d2e3fc] focus:text-[#1a73e8] transition-all cursor-pointer min-w-[140px] ${dateError ? 'border border-[#d93025]' : ''}`}
                      value={date}
                      min={normalizedAllowedRange?.start}
                      max={normalizedAllowedRange?.end}
                      onChange={(e) => {
                        const nextDate = clampDateToAllowedRange(e.target.value);
                        setDate(nextDate);
                        setDateError(false);
                      }}
                    />
                  ) : (
                    <span className="inline-flex items-center h-8 px-3 bg-[#e8eaed] dark:bg-gray-800 rounded text-[13px] font-medium text-[#3c4043] dark:text-gray-200">
                      {(() => {
                        const d = moment(date)
                        const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
                        return `${days[d.day()]}, ${d.format('D [thg] M')}`
                      })()}
                    </span>
                  )}
                </div>
              </div>

              {date && (
                <div className="flex items-center gap-4 relative z-30">
                  <div className="text-[#5f6368] bg-white dark:bg-[#1e1e1e] shrink-0">
                    <Repeat size={22} className="opacity-70" />
                  </div>
                  <div className="flex-1 w-full flex">
                    {renderRepeatDropdown({
                      value: repeatMode,
                      onChange: setRepeatMode,
                      dateStr: date
                    })}
                  </div>
                </div>
              )}

              {existingShifts.length > 0 && (
                <div className="relative z-10 pl-[39px] space-y-1 pt-1">
                  <button
                    onClick={() => setIsListExpanded(!isListExpanded)}
                    className="flex items-center gap-2 group w-full text-left focus:outline-none"
                  >
                    <span className="text-sm font-medium group-hover:text-[#1a73e8] transition-colors">
                      Khung giờ đã đăng ký {existingShifts.length > 0 ? `(${existingShifts.length})` : ''}
                    </span>
                    {isListExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isListExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 invisible'}`}>
                    <div className="space-y-2 pb-1">
                      {existingShifts.map((shift) => {
                        const cfg = getStatusConfig(shift.status);
                        const isEditing = editingShiftId === shift.id;
                        const duration = getDurationInfo(shift.start, shift.end);

                        return (
                          <div key={shift.id} className={`relative overflow-hidden transition-all duration-200 rounded-xl flex ${isEditing ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 shadow-md' : `${cfg.bg} p-3`}`}>
                            {!isEditing && <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar}`}></div>}

                            {isEditing && tempEditData ? (
                              <div className="flex-1 space-y-2 animate-in fade-in zoom-in-95">
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <GoogleTimePicker value={tempEditData.start} onChange={(v) => {
                                        const updated = { ...tempEditData, start: v };
                                        if (v) {
                                          if (updated.end && v >= updated.end) {
                                            const [h, m] = v.split(':').map(Number);
                                            if (!isNaN(h) && !isNaN(m)) {
                                              const endH = Math.min(h + 1, 23);
                                              updated.end = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                                            }
                                          }
                                        }
                                        setTempEditData(updated);
                                      }} />
                                      <span className="text-gray-400">—</span>
                                      <GoogleTimePicker value={tempEditData.end} minTime={tempEditData.start} onChange={(v) => setTempEditData({ ...tempEditData, end: v })} />
                                      <span className={`text-[12px] font-bold ${getDurationInfo(tempEditData.start, tempEditData.end).isValid ? 'text-[#1a73e8]' : 'text-red-500'}`}>
                                        ({getDurationInfo(tempEditData.start, tempEditData.end).text})
                                      </span>
                                    </div>

                                    <div className="flex gap-1 shrink-0">
                                      <button
                                        onClick={handleSaveEdit}
                                        disabled={isEditSaving || !getDurationInfo(tempEditData.start, tempEditData.end).isValid}
                                        className="p-1.5 bg-[#1a73e8] text-white rounded-full hover:bg-blue-700 shadow-sm transition-transform active:scale-90 disabled:opacity-70 disabled:cursor-not-allowed"
                                      >
                                        {isEditSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                      </button>
                                      <button
                                        onClick={() => setEditingShiftId(null)}
                                        disabled={isEditSaving}
                                        className="p-1.5 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 active:scale-90 disabled:opacity-50"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Hàng 2: Ô nhập Tiêu đề */}
                                  <textarea
                                    ref={editTextAreaRef}
                                    rows={1}
                                    className="w-full bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#1a73e8] resize-none overflow-hidden"
                                    value={tempEditData.reason}
                                    onChange={(e) => setTempEditData({ ...tempEditData, reason: e.target.value })}
                                    placeholder="Tiêu đề..."
                                  />

                                  {/* Hàng 3: Ô nhập Mô tả chi tiết */}
                                  <textarea
                                    rows={1}
                                    className="w-full bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#1a73e8] resize-y min-h-[40px]"
                                    value={tempEditData.chi_tiet || ''}
                                    onChange={(e) => setTempEditData({ ...tempEditData, chi_tiet: e.target.value })}
                                    placeholder="Thêm mô tả chi tiết..."
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1 ml-1 min-w-0 group/row relative">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 shrink-0">
                                    {shift.isDotXuat && (
                                      <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-500 shadow-[0_0_0_2px_rgba(255,255,255,0.8)]" title="Đăng ký đột xuất" />
                                    )}
                                    <span className={`text-[15px] font-bold ${cfg.text} tabular-nums leading-none`}>{shift.start} — {shift.end}</span>
                                    <span className={`text-[12px] font-medium opacity-70 ${cfg.text}`}>({duration.text})</span>
                                  </div>
                                  {(!isLocked || canByLeader) && !['Huy', 'Tu_choi'].includes(shift.status) && (
                                    <div className="flex items-center gap-1 transition-opacity shrink-0">
                                      <button onClick={() => startEditing(shift)} className="p-1 text-gray-500 hover:text-[#1a73e8] hover:bg-white/50 dark:hover:bg-black/20 rounded-md"><Edit3 size={14} /></button>
                                      <button onClick={() => setShowConfirmDelete(shift)} title="Hủy đăng ký" className="p-1 text-gray-500 hover:text-red-500 hover:bg-white/50 dark:hover:bg-black/20 rounded-md"><Trash2 size={14} /></button>
                                    </div>
                                  )}
                                  {(!isLocked || canByLeader) && shift.status === 'Huy' && (
                                    <div className="flex items-center gap-1 transition-opacity shrink-0">
                                      {shift.soLanHuy && shift.soLanHuy >= 3 ? (
                                        <span className="px-2 py-1 flex items-center gap-1 text-[11px] font-medium text-red-500 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded cursor-not-allowed" title="Đã vượt quá số lần hủy tối đa">
                                          Đã hủy 3 lần
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() => startEditing(shift)}
                                          title="Đăng ký lại"
                                          className="px-2 py-1 flex items-center gap-1 text-[11px] font-medium text-[#1a73e8] bg-[#e8f0fe] rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                                        >
                                          <RotateCcw size={12} />
                                          <span>Đăng ký lại</span>
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div
                                  className={`text-[13px] font-medium leading-tight mt-1 ${cfg.text}`}
                                >
                                  {shift.reason}
                                </div>
                                {shift.chi_tiet && (
                                  <div
                                    className={`text-[12px] opacity-80 mt-1 line-clamp-2 ${cfg.text}`}
                                    dangerouslySetInnerHTML={{ __html: shift.chi_tiet }}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="relative z-10 pl-[38px] space-y-3 pb-2">
                {newSlots.length > 0 && (
                  <div className="space-y-2">
                    {newSlots.map((slot) => {
                      const dur = getDurationInfo(slot.start, slot.end);
                      return (
                        <div key={slot.id} className="flex items-center gap-3 animate-in slide-in-from-top-1">
                          <div className="flex items-center gap-2">
                            <GoogleTimePicker value={slot.start} onChange={(v) => updateNewSlot(slot.id, 'start', v)} />
                            <span className="text-gray-400 font-light mx-0.5">—</span>
                            <GoogleTimePicker value={slot.end} minTime={slot.start} onChange={(v) => updateNewSlot(slot.id, 'end', v)} />
                            <span className={`text-[12px] font-bold min-w-[36px] transition-colors ${dur.isValid ? 'text-[#1a73e8]' : 'text-red-500'}`}>
                              ({dur.text}) {!dur.isValid && <AlertCircle size={12} className="inline ml-1 mb-0.5 animate-pulse" />}
                            </span>
                          </div>
                          <button onClick={() => removeNewSlot(slot.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"><Trash2 size={16} /></button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {(!isLocked || canByLeader) && (
                  <button
                    onClick={addNewSlot}
                    className="inline-flex items-center gap-2 text-[14px] font-medium text-[#1a73e8] hover:bg-[#e8f0fe] dark:hover:bg-[#1a73e8]/20 py-1.5 px-4 -ml-4 rounded-full transition-all active:scale-95 group"
                  >
                    <Plus size={18} />
                    <span>Thêm khung giờ</span>
                  </button>
                )}
              </div>

              {/* Bảng Review Quy Định / Overtime Summary */}
              {ENABLE_OVERTIME_REVIEW && (
                <div className="relative z-10 animate-in fade-in pt-2">
                  <div className={`p-4 rounded-xl border ${isViolating ? 'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-800' : 'bg-gray-50/50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'}`}>
                    <div className="flex items-center gap-2 mb-2 tracking-tight">
                      <span className="font-semibold text-[13px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Rà soát quy định</span>
                    </div>


                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1 leading-snug">
                          {isOffDay ? (
                            <>Làm thêm vào <span className="font-semibold text-[#1a73e8]">{offDayLabel}</span>: tổng thời gian tối đa <span className="font-semibold text-[#1a73e8]">{MAX_OVERTIME} giờ/ngày</span>.</>
                          ) : (
                            <>Làm thêm <span className="font-semibold text-[#1a73e8]">ngày thường</span>: Tối đa 50% giờ làm việc bình thường (<span className="font-semibold text-[#1a73e8]">{MAX_OVERTIME} giờ/ngày</span>).</>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center justify-center p-3 rounded-lg bg-white dark:bg-[#2a2a2a] shadow-sm border border-gray-100 dark:border-gray-800 self-center">
                        <div className="text-center">
                          <div className={`text-[10px] uppercase font-bold mb-1 tracking-wider ${isViolating ? 'text-red-500' : 'text-gray-400'}`}>
                            {isViolating ? 'VƯỢT QUY ĐỊNH' : 'Tổng giờ hiện tại'}
                          </div>
                          <div className={`text-2xl font-black leading-none ${isViolating ? 'text-red-500' : 'text-[#3c4043] dark:text-gray-200'}`}>
                            {totalOvertime.toFixed(1).replace('.0', '')}<span className="text-[16px]">h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="px-3 py-3.5 flex justify-between items-center border-t border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-900/20">
            <div className="flex-1">
              {showCountdown && (
                <div className="flex items-center gap-1.5">
                  <Tooltip
                    content={`Hạn đăng ký trong ngày: ${DEADLINE_HOUR}:${String(DEADLINE_MINUTE).padStart(2, '0')}. Sau khung giờ này sẽ chuyển sang trạng thái đăng ký đột xuất.`}
                    placement="top"
                    className="bg-gray-800 text-white text-xs px-3 py-1.5"
                    delay={300}
                  >
                    <Clock size={14} className="text-[#b06000] dark:text-[#fde293] animate-pulse cursor-help" />
                  </Tooltip>
                  <span className="text-[12px] text-[#b06000] dark:text-[#fde293] font-medium">
                    Còn {countdownText} để đăng ký trong ngày
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 shrink-0">
              <button onClick={onClose} className="px-6 py-2 cursor-pointer text-sm font-medium text-[#5f6368] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                Hủy
              </button>
              <button
                onClick={handleFinalSave}
                disabled={isSubmitting || newSlots.length === 0 || (isBlank && !date) || (isLocked && !canByLeader)}
                className={`px-6 py-2 cursor-pointer text-sm font-bold text-white rounded-full transition-all flex items-center gap-2 ${isSubmitting || newSlots.length === 0 || (isBlank && !date) || (isLocked && !canByLeader) ? 'bg-[#dadce0] text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed' : (isDotXuat ? 'bg-[#c5221f] hover:bg-[#a50e0e]' : 'bg-[#1a73e8] hover:bg-[#1b66c9]') + ' shadow-md active:scale-[0.98]'}`}
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSubmitting ? 'Đang lưu...' : (isDotXuat ? 'Đăng ký đột xuất' : 'Lưu đăng ký')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CancelConfirmModal
        shift={showConfirmDelete}
        isDeleteSaving={isDeleteSaving}
        onClose={() => setShowConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </FloatingPortal>
  );
};
