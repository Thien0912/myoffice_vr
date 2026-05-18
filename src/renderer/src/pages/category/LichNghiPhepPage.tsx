import { ngayleAxios } from './mockApi';
import LunarDateRangePicker, { solarToLunarStr } from '@renderer/components/LunarDateRangePicker';
import { HrPrimaryButton } from '@renderer/components/hero-custom';
import { useNgoaiGioPermissions } from '@renderer/pages/hr/overtime/hooks/useNgoaiGioPermissions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  History,
  Info,
  Loader2,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import CategoryHistoryDrawer from './components/CategoryHistoryDrawer';
import React, { useCallback, useMemo, useState } from 'react';
import { getLunarDate } from '@forvn/vn-lunar-calendar';

/* ── lunar helper for calendar grid ──────────────────────────────────────── */
function solarToLunarDay(d: number, m: number, y: number) {
  try {
    const l = getLunarDate(d, m, y);
    return { lunarDay: l.day, lunarMonth: l.month };
  } catch {
    return { lunarDay: 0, lunarMonth: 0 };
  }
}

/* ── ConfirmDeleteModal ───────────────────────────────────────────────────── */
interface ConfirmDeleteProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}
const ConfirmDeleteModal: React.FC<ConfirmDeleteProps> = ({ title, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-200 p-4 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <AlertTriangle size={28} className="text-red-500" />
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-800">Xác nhận xóa</h3>
        <p className="text-sm text-gray-500 mt-1">Bạn có chắc muốn xóa <span className="font-semibold text-gray-700">"{title}"</span>? Hành động này không thể hoàn tác.</p>
      </div>
      <div className="flex space-x-3 w-full pt-1">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
          Hủy bỏ
        </button>
        <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center space-x-1">
          {loading && <Loader2 size={14} className="animate-spin" />}
          <span>Xóa</span>
        </button>
      </div>
    </div>
  </div>
);

/* ── Main Page ────────────────────────────────────────────────────────────── */
const LichNghiPhepPage = () => {
  const { isSuperAdmin, isPhongTCHC } = useNgoaiGioPermissions();
  const role = (isSuperAdmin || isPhongTCHC) ? 'admin' : 'staff';

  const [currentDate, setCurrentDate] = useState(new Date());
  const queryClient = useQueryClient();

  /* ── queries ── */
  const { data: qData, isLoading } = useQuery({
    queryKey: ['ngayle'],
    queryFn: () => ngayleAxios.getAll({ page: 1, length: -1 })
  });

  const createMutation = useMutation({
    mutationFn: ngayleAxios.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ngayle'] })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => ngayleAxios.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ngayle'] })
  });

  const deleteMutation = useMutation({
    mutationFn: ngayleAxios.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ngayle'] }); setDeleteTarget(null); setIsModalOpen(false); }
  });

  /* ── events ── */
  const events = useMemo(() => {
    const raw = qData?.data;
    if (!raw) return [];
    const arr: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    return arr.map((item: any) => ({
      id: item.id_ngay_le || item.id,
      title: item.ten_ngay_le + (item.la_ngay_le_am == 1 && item.ngay_am ? ` (${item.ngay_am} ÂL)` : ''),
      start: item.batdau || item.ngay_le || item.ngay,
      end: item.ketthuc || item.ngay_le || item.ngay,
      type: 'public',
      description: item.mota || item.mo_ta || '',
      isLunar: item.la_ngay_le_am == 1,
      lunarDate: item.ngay_am || '',
      user: 'Quản trị viên',
      originalData: item
    }));
  }, [qData]);

  /* ── form state ── */
  const emptyForm = () => ({
    title: '', start: '', end: '', type: 'public',
    isLunar: false, lunarDate: '', duoc_nghi: 1, description: '', user: 'Quản trị viên'
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  /* auto-fill lunarDate when isLunar toggled / start changes */
  const handleDateRangeChange = useCallback((s: string, e: string) => {
    setFormData(prev => ({
      ...prev, start: s, end: e,
      lunarDate: prev.isLunar && s ? solarToLunarStr(s) : prev.lunarDate
    }));
  }, []);

  /* ── calendar grid ── */
  const sortedEvents = useMemo(() => (
    [...events].sort((a: any, b: any) => {
      if (a.start !== b.start) return a.start.localeCompare(b.start);
      return (new Date(b.end).getTime() - new Date(b.start).getTime()) -
        (new Date(a.end).getTime() - new Date(a.start).getTime());
    })
  ), [events]);

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDow = new Date(year, month, 1).getDay();
    const days: any[] = [];

    for (let i = firstDow - 1; i >= 0; i--) {
      const dt = new Date(year, month, -i);
      const ds = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      days.push({ day: dt.getDate(), dateStr: ds, currentMonth: false, ...solarToLunarDay(dt.getDate(), dt.getMonth() + 1, dt.getFullYear()) });
    }
    for (let i = 1; i <= totalDays; i++) {
      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i, dateStr: ds, currentMonth: true,
        isToday: new Date().toDateString() === new Date(year, month, i).toDateString(),
        ...solarToLunarDay(i, month + 1, year)
      });
    }
    const rem = days.length % 7 === 0 ? 0 : 7 - (days.length % 7);
    for (let i = 1; i <= rem; i++) {
      const dt = new Date(year, month + 1, i);
      const ds = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      days.push({ day: dt.getDate(), dateStr: ds, currentMonth: false, ...solarToLunarDay(dt.getDate(), dt.getMonth() + 1, dt.getFullYear()) });
    }
    return days;
  }, [currentDate]);

  /* ── navigation ── */
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setCurrentDate(d => new Date(d.getFullYear(), parseInt(e.target.value), 1));
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setCurrentDate(d => new Date(parseInt(e.target.value), d.getMonth(), 1));

  /* ── CRUD handlers ── */
  const handleAddEvent = () => {
    if (role !== 'admin') return;
    setEditingEvent(null);
    setFormData(emptyForm());
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    let titleToSave = formData.title;
    if (editingEvent && formData.title === editingEvent.title)
      titleToSave = editingEvent.originalData?.ten_ngay_le || formData.title;

    const payload = {
      ten_ngay_le: titleToSave,
      batdau: formData.start,
      ketthuc: formData.end,
      mota: formData.description,
      la_ngay_le_am: formData.isLunar ? 1 : 0,
      ngay_am: formData.isLunar ? formData.lunarDate : null,
      duoc_nghi: 1
    };

    if (editingEvent) await updateMutation.mutateAsync({ id: editingEvent.id, data: payload });
    else await createMutation.mutateAsync(payload);
    setIsModalOpen(false);
  };

  const openEditModal = (event: any) => {
    if (role !== 'admin' && event.type === 'public') return;
    setEditingEvent(event);
    setFormData({ ...emptyForm(), ...event, title: event.originalData?.ten_ngay_le || event.title, duoc_nghi: event.originalData?.duoc_nghi ?? 1 });
    setIsModalOpen(true);
  };

  const MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const YEARS = Array.from({ length: 16 }, (_, i) => 2020 + i);

  const isReadOnly = role !== 'admin' && editingEvent?.type === 'public';
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const [lichSuOpen, setLichSuOpen] = useState(false);

  /* ───────────────────────────────────────────── render ────────────────── */
  return (
    <div className="flex h-full w-full bg-white text-gray-800 font-sans shadow-sm rounded-lg overflow-hidden border border-gray-200">

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          title={deleteTarget.title}
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutateAsync(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden w-full h-full">

        {/* Header */}
        {/* Header */}
        <header className="min-h-16 py-3 sm:py-0 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 bg-white shrink-0 gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:space-x-4 w-full sm:w-auto">
            <div className="flex items-center space-x-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 shadow-sm hover:border-blue-300 transition-colors w-full sm:w-auto justify-center">
              <select value={currentDate.getMonth()} onChange={handleMonthChange}
                className="bg-transparent text-base sm:text-lg font-bold text-gray-800 outline-none cursor-pointer appearance-none px-1 text-center">
                {MONTHS.map((n, i) => <option key={i} value={i}>{n}</option>)}
              </select>
              <select value={currentDate.getFullYear()} onChange={handleYearChange}
                className="bg-transparent text-base sm:text-lg font-bold text-gray-800 outline-none cursor-pointer appearance-none px-1 text-center">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-center border border-gray-200 rounded-lg bg-white w-full sm:w-auto">
              <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-l-lg border-r border-gray-200 flex-1 sm:flex-none flex justify-center"><ChevronLeft size={20} /></button>
              <button onClick={goToToday} className="px-3 py-1.5 hover:bg-gray-100 text-sm font-medium flex-1 sm:flex-none text-center whitespace-nowrap">Hôm nay</button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-r-lg border-l border-gray-200 flex-1 sm:flex-none flex justify-center"><ChevronRight size={20} /></button>
            </div>
          </div>
          <div className="flex items-center w-full sm:w-auto justify-end gap-2">
            <button
              onClick={() => setLichSuOpen(true)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2"
            >
              <History size={16} />
              Lịch sử
            </button>
            {role === 'admin' && (
              <HrPrimaryButton
                onPress={handleAddEvent}
                className="w-full sm:w-auto"
              >
                Tạo mới
              </HrPrimaryButton>
            )}
          </div>
          </div>
        </header>

        {/* Calendar */}
        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={32} className="animate-spin text-blue-400" />
            </div>
          ) : (
            <div className="min-w-[800px] h-full grid grid-cols-7 grid-rows-[auto_1fr] border border-gray-200 rounded-xl overflow-hidden bg-gray-200 gap-px shadow-sm">
              {/* Weekday headers */}
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                <div key={d} className="bg-white py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{d}</div>
              ))}

              {/* Cells */}
              {monthData.map((item, idx) => (
                <div key={idx}
                  className={`min-h-[140px] bg-white pb-1 flex flex-col transition-colors hover:bg-blue-50/10 group ${!item.currentMonth ? 'bg-gray-50/50' : ''}`}>

                  {/* Date number + lunar sub-label — always same height */}
                  <div className="flex justify-between items-start px-2 pt-2 pb-1">
                    <div className="flex flex-col items-center w-8">
                      <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                        ${item.isToday ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700'}
                        ${!item.currentMonth ? 'text-gray-300' : ''}
                      `}>
                        {item.day}
                      </span>
                      {/* Always render to keep cell height uniform — hide for non-current or missing */}
                      <span className={`text-[9px] leading-tight mt-1 font-medium
                        ${item.currentMonth && item.lunarDay > 0 ? 'text-red-400' : 'invisible'}
                      `}>
                        {item.lunarDay > 0 ? `${item.lunarDay}${item.lunarDay === 1 ? `/${item.lunarMonth}` : ''}` : '00'}
                      </span>
                    </div>

                    {item.currentMonth && role === 'admin' && (
                      <button
                        onClick={() => { setEditingEvent(null); setFormData({ ...emptyForm(), start: item.dateStr, end: item.dateStr }); setIsModalOpen(true); }}
                        className="opacity-0 group-hover:opacity-100 z-20 text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-full transition-all">
                        <Plus size={16} />
                      </button>
                    )}
                  </div>

                  {/* Event bars */}
                  <div className="flex flex-col space-y-0.5 relative z-10 w-full px-0">
                    {sortedEvents.map(event => {
                      const isActive = item.dateStr >= event.start && item.dateStr <= event.end;
                      const isStart = item.dateStr === event.start;
                      const isEnd = item.dateStr === event.end;
                      const isSunday = idx % 7 === 0;
                      if (!isActive) return <div key={event.id} className="h-6 w-full pointer-events-none shrink-0" />;
                      return (
                        <div key={event.id}
                          onClick={e => { e.stopPropagation(); openEditModal(event); }}
                          title={event.title}
                          className={`h-6 flex items-center text-[11px] cursor-pointer transition-all font-medium
                            ${event.type === 'public' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-orange-500 text-white hover:bg-orange-600'}
                            ${isStart || isSunday ? 'rounded-l-md ml-1 pl-2' : ''}
                            ${isEnd ? 'rounded-r-md mr-1' : ''}
                          `}>
                          <span className={`truncate ${(isStart || isSunday) ? 'block' : 'hidden'}`}>
                            {event.type === 'public' ? 'Lễ: ' : 'Phép: '}{event.title || '(Không có tiêu đề)'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Stats Panel */}
      <aside className="w-80 shrink-0 border-l border-gray-200 bg-gray-50/50 p-6 hidden lg:flex flex-col space-y-8 overflow-y-auto">
        <section>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Tổng quan tháng</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-white border border-blue-100 p-4 rounded-2xl shadow-sm">
              <p className="text-blue-600 text-xs font-bold uppercase mb-1">Ngày lễ</p>
              <p className="text-2xl font-bold text-blue-900">{events.filter(e => e.type === 'public').length}</p>
            </div>
            {/* <div className="hidden bg-white border border-orange-100 p-4 rounded-2xl shadow-sm">
              <p className="text-orange-600 text-xs font-bold uppercase mb-1">Ngày phép</p>
              <p className="text-2xl font-bold text-orange-900">{events.filter(e => e.type === 'personal').length}</p>
            </div> */}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Sắp tới</h3>
            <span className="text-[10px] bg-blue-100 px-2 py-0.5 rounded text-blue-700 font-bold uppercase tracking-wider">7 ngày</span>
          </div>
          <div className="space-y-3">
            {events
              .filter(e => new Date(e.start) >= new Date())
              .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
              .slice(0, 4)
              .map(e => (
                <div key={e.id} onClick={() => openEditModal(e)}
                  className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 cursor-pointer shadow-sm">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${e.type === 'public' ? 'bg-blue-500' : 'bg-orange-400'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{e.title}</p>
                    <p className="text-xs text-gray-400 flex items-center"><Clock size={10} className="mr-1" />{e.start}</p>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section className="bg-blue-50/50 rounded-2xl p-4 border border-dashed border-blue-200 flex-1 mt-auto">
          <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center">
            <CheckCircle2 size={16} className="text-blue-500 mr-2" />Ghi chú hệ thống
          </h4>
          <p className="text-xs text-blue-600/80 leading-relaxed">
            Mọi lịch nghỉ lễ chung sẽ được đồng bộ tự động đến hòm thư và lịch cá nhân của toàn bộ nhân viên.
          </p>
        </section>
      </aside>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                  <Info className="text-blue-600" />
                  <span>{editingEvent ? 'Chi tiết ngày lễ' : 'Ban hành ngày lễ mới'}</span>
                </h2>
                {role === 'staff' && (
                  <span className="flex items-center text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full w-fit mt-1 border border-orange-100">
                    <Eye size={12} className="mr-1" />CHẾ ĐỘ: CHỈ XEM
                  </span>
                )}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="relative flex flex-col overflow-hidden">
              {isSaving && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                  <Loader2 size={32} className="animate-spin text-blue-600 mb-2" />
                  <p className="text-sm font-bold text-gray-600">Đang lưu...</p>
                </div>
              )}

              <form onSubmit={handleSaveEvent} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                {/* Title */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Tên ngày lễ</label>
                  <input type="text" required disabled={isReadOnly}
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold transition-all disabled:opacity-60"
                    placeholder="Nhập tên ngày lễ..."
                  />
                </div>

                {/* Date range */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Khoảng thời gian</label>
                  <LunarDateRangePicker
                    start={formData.start}
                    end={formData.end}
                    onChange={handleDateRangeChange}
                    disabled={isReadOnly}
                  />
                </div>

                {/* Lunar toggle + input */}
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input type="checkbox" disabled={isReadOnly}
                      checked={formData.isLunar}
                      onChange={e => {
                        const checked = e.target.checked;
                        setFormData(prev => ({
                          ...prev, isLunar: checked,
                          lunarDate: checked && prev.start ? solarToLunarStr(prev.start) : prev.lunarDate
                        }));
                      }}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-60"
                    />
                    <span className="text-sm font-semibold text-gray-700">Lễ Âm Lịch</span>
                  </label>

                  {formData.isLunar && (
                    <div className="flex-1 min-w-[180px]">
                      <input type="text" disabled={isReadOnly}
                        value={formData.lunarDate || ''}
                        onChange={e => setFormData({ ...formData, lunarDate: e.target.value })}
                        placeholder="VD: 10/3"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-sm disabled:opacity-60"
                      />
                      <p className="text-[10px] text-gray-400 mt-1 pl-1">Ngày/tháng âm (tự điền từ ngày bắt đầu)</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Mô tả</label>
                  <textarea disabled={isReadOnly}
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none font-medium disabled:opacity-60"
                    placeholder="Thông tin chi tiết..."
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                  {role === 'admin' && editingEvent
                    ? <button type="button"
                      onClick={() => setDeleteTarget({ id: editingEvent.id, title: editingEvent.originalData?.ten_ngay_le || editingEvent.title })}
                      className="text-red-500 hover:text-red-700 flex items-center space-x-1.5 text-sm font-bold transition-all">
                      <Trash2 size={17} /><span>Xóa</span>
                    </button>
                    : <div />
                  }
                  <div className="flex space-x-3">
                    <button type="button" onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-bold transition-all">
                      Hủy bỏ
                    </button>
                    {role === 'admin' && (
                      <button type="submit" disabled={isSaving}
                        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 transition-all disabled:opacity-70 flex items-center space-x-2">
                        {isSaving && <Loader2 size={16} className="animate-spin" />}
                        <span>Lưu</span>
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
      <CategoryHistoryDrawer
        open={lichSuOpen}
        onClose={() => setLichSuOpen(false)}
        entityKey="ngayle"
        title="Lịch sử chỉnh sửa - Lịch nghỉ phép"
      />
    </div>
  );
};

export default LichNghiPhepPage;
