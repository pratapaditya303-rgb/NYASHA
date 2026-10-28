import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerInputProps {
  value: string; // "DD/MM/YYYY"
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  minYear?: number;
  maxYear?: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  label,
  placeholder = 'DD/MM/YYYY',
  required = false,
  minYear = 1940,
  maxYear = 2035
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse initial date or default to current date
  const parseValue = () => {
    if (value && value.includes('/')) {
      const parts = value.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
          return { day: d, month: m, year: y };
        }
      }
    }
    const now = new Date();
    return { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() };
  };

  const initial = parseValue();
  const [currentMonth, setCurrentMonth] = useState(initial.month);
  const [currentYear, setCurrentYear] = useState(initial.year);

  // Calculate days in month
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const dStr = day.toString().padStart(2, '0');
    const mStr = (currentMonth + 1).toString().padStart(2, '0');
    const val = `${dStr}/${mStr}/${currentYear}`;
    onChange(val);
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDay }, (_, i) => i);

  // Year options for fast navigation
  const years = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-slate-800/80 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 pr-10 focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2.5 p-1.5 text-slate-400 hover:text-amber-400 rounded-lg"
          title="Open Calendar"
        >
          <CalendarIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 text-slate-100 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
            {/* Month selector */}
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="bg-slate-800 text-xs font-bold text-amber-300 rounded-lg px-2 py-1 border border-slate-700 focus:outline-none"
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>

            {/* Year selector */}
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="bg-slate-800 text-xs font-bold text-slate-200 rounded-lg px-2 py-1 border border-slate-700 focus:outline-none"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Month arrows */}
          <div className="flex items-center justify-between px-1 mb-2 text-xs text-slate-400">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-slate-800 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-200">{MONTHS[currentMonth]} {currentYear}</span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-slate-800 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400 mb-1">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {paddingArray.map((_, i) => (
              <span key={`pad-${i}`} />
            ))}
            {daysArray.map((d) => {
              const dStr = d.toString().padStart(2, '0');
              const mStr = (currentMonth + 1).toString().padStart(2, '0');
              const isSelected = value === `${dStr}/${mStr}/${currentYear}`;
              return (
                <button
                  type="button"
                  key={d}
                  onClick={() => handleSelectDay(d)}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center font-medium transition-colors ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const dStr = now.getDate().toString().padStart(2, '0');
                const mStr = (now.getMonth() + 1).toString().padStart(2, '0');
                onChange(`${dStr}/${mStr}/${now.getFullYear()}`);
                setIsOpen(false);
              }}
              className="text-[11px] text-amber-400 hover:underline"
            >
              Today (आज)
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
