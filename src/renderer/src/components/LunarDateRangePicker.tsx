/**
 * LunarDateRangePicker
 * Google Calendar–style date range picker with Vietnamese lunar date display.
 * - Full-width light-blue band across the selected range
 * - Dark-blue circle on start / end dates
 * - Lunar date sub-label (small red text) per cell
 */
import { getLunarDate } from '@forvn/vn-lunar-calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

/* ── helpers ─────────────────────────────────────────────────────────────── */
export function solarToLunarStr(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  try {
    const l = getLunarDate(d, m, y);
    return `${l.day}/${l.month}`;
  } catch {
    return '';
  }
}

function solarToLunarDay(d: number, m: number, y: number) {
  try {
    const l = getLunarDate(d, m, y);
    return { lunarDay: l.day, lunarMonth: l.month };
  } catch {
    return { lunarDay: 0, lunarMonth: 0 };
  }
}

const todayStr = () => {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
};

const MONTH_VN = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12',
];

/* ── types ───────────────────────────────────────────────────────────────── */
export interface LunarDateRangePickerProps {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  disabled?: boolean;
}

/* ── component ───────────────────────────────────────────────────────────── */
const LunarDateRangePicker: React.FC<LunarDateRangePickerProps> = ({
  start,
  end,
  onChange,
  disabled,
}) => {
  const today = todayStr();
  const ref = useRef<HTMLDivElement>(null);

  const [open,     setOpen]     = useState(false);
  const [selStart, setSelStart] = useState<string | null>(start || null);
  const [selEnd,   setSelEnd]   = useState<string | null>(end   || null);
  const [hover,    setHover]    = useState<string | null>(null);

  const [viewDate, setViewDate] = useState(() => {
    if (start) return new Date(start + 'T00:00:00');
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });

  /* sync from parent */
  useEffect(() => { setSelStart(start || null); }, [start]);
  useEffect(() => { setSelEnd(end   || null); }, [end]);

  /* close on outside click */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  /* build grid cells */
  const cells = useMemo(() => {
    type Cell = { ds: string; d: number; cur: boolean; lunarDay: number; lunarMonth: number };
    const arr: Cell[] = [];
    const firstDow = new Date(year, month, 1).getDay();
    const daysInM  = new Date(year, month + 1, 0).getDate();

    // Prev month padding
    for (let i = firstDow - 1; i >= 0; i--) {
      const dt = new Date(year, month, -i);
      const ds = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
      const { lunarDay, lunarMonth } = solarToLunarDay(dt.getDate(), dt.getMonth()+1, dt.getFullYear());
      arr.push({ ds, d: dt.getDate(), cur: false, lunarDay, lunarMonth });
    }
    // Current month
    for (let i = 1; i <= daysInM; i++) {
      const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
      const { lunarDay, lunarMonth } = solarToLunarDay(i, month+1, year);
      arr.push({ ds, d: i, cur: true, lunarDay, lunarMonth });
    }
    // Next month padding
    const rem = arr.length % 7 === 0 ? 0 : 7 - (arr.length % 7);
    for (let i = 1; i <= rem; i++) {
      const dt = new Date(year, month+1, i);
      const ds = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
      const { lunarDay, lunarMonth } = solarToLunarDay(dt.getDate(), dt.getMonth()+1, dt.getFullYear());
      arr.push({ ds, d: dt.getDate(), cur: false, lunarDay, lunarMonth });
    }
    return arr;
  }, [year, month]);

  /* click handler */
  const handleDay = (ds: string) => {
    if (!selStart || (selStart && selEnd)) {
      setSelStart(ds);
      setSelEnd(null);
    } else {
      const s = selStart <= ds ? selStart : ds;
      const e = selStart <= ds ? ds : selStart;
      setSelStart(s);
      setSelEnd(e);
      onChange(s, e);
      setOpen(false);
    }
  };

  /* range state per cell */
  const getState = (ds: string) => {
    const hi = selEnd || hover || '';
    const lo = selStart || '';
    const isS    = ds === selStart;
    const isE    = ds === selEnd;
    const inRng  = !!lo && !!hi && ds > lo && ds < hi && lo !== hi;
    const inHov  = !!lo && !selEnd && !!hover && ds > lo && ds < hover;
    return { isS, isE, inRng: inRng || inHov };
  };

  /* display string in trigger button */
  const displayVal = () => {
    if (!start && !end) return 'Chọn khoảng thời gian';
    const fmt = (s: string) => {
      if (!s) return '';
      const [yy, mm, dd] = s.split('-');
      const lunar = solarToLunarStr(s);
      return `${dd}/${mm}/${yy}${lunar ? ` (${lunar} ÂL)` : ''}`;
    };
    if (!end || start === end) return fmt(start);
    return `${fmt(start)} → ${fmt(end)}`;
  };

  /* ── disabled view ─── */
  if (disabled) {
    return (
      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400 font-medium select-none">
        {displayVal()}
      </div>
    );
  }

  /* ── render ─── */
  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-sm text-left hover:border-blue-400 transition-all flex items-center justify-between"
      >
        <span className={!start && !end ? 'text-gray-400' : 'text-gray-800'}>
          {displayVal()}
        </span>
        <ChevronRight
          size={16}
          className={`text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[200] mt-2 left-0 bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 w-[340px] select-none">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={17} />
            </button>
            <span className="text-sm font-bold text-gray-700">{MONTH_VN[month]} {year}</span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight size={17} />
            </button>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 mb-1">
            {['CN','T2','T3','T4','T5','T6','T7'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/*
            Google Calendar trick:
            Each cell is a relative div. We draw:
            1. A full-height background div (left/right/center) for the range band
            2. A circle div on top for start/end
            3. Number + lunar label on top of everything
          */}
          <div className="grid grid-cols-7">
            {cells.map((cell, col) => {
              const { isS, isE, inRng } = getState(cell.ds);
              const isSameDay = selStart === selEnd && isS;
              const isToday   = cell.ds === today;
              const colIdx    = col % 7; // 0=Sun, 6=Sat
              const isFirstCol = colIdx === 0;
              const isLastCol  = colIdx === 6;

              // Band logic — which "half" of cell is filled
              const bandLeft = !isFirstCol && (inRng || (isE && !isSameDay));
              const bandRight = !isLastCol && (inRng || (isS && selEnd && !isSameDay));

              return (
                <div
                  key={cell.ds}
                  className="relative h-11 flex items-center justify-center cursor-pointer"
                  onClick={() => handleDay(cell.ds)}
                  onMouseEnter={() => selStart && !selEnd && setHover(cell.ds)}
                  onMouseLeave={() => setHover(null)}
                >
                  {/* Range band — left half */}
                  {bandLeft && (
                    <div className="absolute left-0 top-[20%] h-[60%] w-1/2 bg-blue-100" />
                  )}
                  {/* Range band — right half */}
                  {bandRight && (
                    <div className="absolute right-0 top-[20%] h-[60%] w-1/2 bg-blue-100" />
                  )}
                  {/* In-range full width band */}
                  {inRng && !isS && !isE && (
                    <div className="absolute inset-x-0 top-[20%] h-[60%] bg-blue-100" />
                  )}

                  {/* Circle (start / end / today hover) */}
                  <div className={`relative z-10 w-9 h-9 flex flex-col items-center justify-center rounded-full transition-colors
                    ${isS || (isE && !isSameDay) ? 'bg-blue-600 text-white' : ''}
                    ${isSameDay ? 'bg-blue-600 text-white' : ''}
                    ${!isS && !isE && !inRng && !isSameDay ? 'hover:bg-gray-100' : ''}
                    ${!cell.cur ? 'opacity-30' : ''}
                  `}>
                    <span className={`text-[13px] font-semibold leading-none
                      ${isToday && !isS && !isE ? 'text-blue-600' : ''}
                      ${(isS || isE) ? 'text-white' : inRng ? 'text-blue-700' : 'text-gray-800'}
                    `}>
                      {cell.d}
                    </span>
                    <span className={`text-[7px] leading-none mt-0.5 font-medium
                      ${isS || isE ? 'text-blue-200' : 'text-red-400'}
                    `}>
                      {cell.lunarDay}{cell.lunarDay === 1 ? `/${cell.lunarMonth}` : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
              onClick={() => { setSelStart(null); setSelEnd(null); onChange('', ''); }}
            >
              Xóa
            </button>
            <button
              type="button"
              className="text-xs text-blue-600 font-semibold hover:underline"
              onClick={() => {
                setSelStart(today); setSelEnd(today); onChange(today, today); setOpen(false);
              }}
            >
              Hôm nay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LunarDateRangePicker;
