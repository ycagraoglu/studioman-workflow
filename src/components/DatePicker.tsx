import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  value?: string | { from: string; to: string };
  onChange: (date: any) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showClear?: boolean;
  mode?: 'single' | 'range';
}

export default function DatePicker({ 
  value, 
  onChange, 
  disabled, 
  placeholder = 'Tarih Seç',
  className,
  showClear = false,
  mode = 'single'
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const getValidDate = (dateStr: string | undefined): Date | undefined => {
    if (!dateStr) return undefined;
    try {
      const date = parseISO(dateStr);
      return isNaN(date.getTime()) ? undefined : date;
    } catch (e) {
      return undefined;
    }
  };

  const selectedDate = mode === 'single' 
    ? (value && typeof value === 'string' ? getValidDate(value) : undefined)
    : (value && typeof value === 'object' ? { 
        from: getValidDate(value.from), 
        to: getValidDate(value.to) 
      } : undefined);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (date: any) => {
    if (mode === 'single') {
      if (date instanceof Date) {
        onChange(format(date, 'yyyy-MM-dd'));
        setIsOpen(false);
      }
    } else {
      const range = date as DateRange;
      if (range) {
        onChange({
          from: range.from ? format(range.from, 'yyyy-MM-dd') : '',
          to: range.to ? format(range.to, 'yyyy-MM-dd') : ''
        });
        // Don't close immediately in range mode until both are selected or user clicks away
        if (range.from && range.to) {
          // Optional: close after a small delay or keep open
        }
      } else {
        onChange({ from: '', to: '' });
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'single') {
      onChange('');
    } else {
      onChange({ from: '', to: '' });
    }
    setIsOpen(false);
  };

  const getLabel = () => {
    if (mode === 'single') {
      if (value && typeof value === 'string') {
        try {
          const date = parseISO(value);
          if (!isNaN(date.getTime())) {
            return format(date, 'd MMM yyyy', { locale: tr });
          }
        } catch (e) {
          // Fall through to placeholder
        }
      }
      return placeholder;
    } else {
      const range = value as { from: string; to: string };
      if (range?.from && range?.to) {
        try {
          const fromDate = parseISO(range.from);
          const toDate = parseISO(range.to);
          if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
            return `${format(fromDate, 'd MMM', { locale: tr })} - ${format(toDate, 'd MMM yyyy', { locale: tr })}`;
          }
        } catch (e) {
          // Fall through
        }
      } else if (range?.from) {
        try {
          const fromDate = parseISO(range.from);
          if (!isNaN(fromDate.getTime())) {
            return `${format(fromDate, 'd MMM yyyy', { locale: tr })} - ...`;
          }
        } catch (e) {
          // Fall through
        }
      }
      return placeholder;
    }
  };

  const hasValue = mode === 'single' ? !!value : (!!(value as any)?.from);

  return (
    <div className={cn("relative", className)} ref={popoverRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={cn(
          "flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-sm font-medium w-full",
          disabled ? "cursor-not-allowed opacity-50 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700" : "hover:border-primary/50 bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-700 cursor-pointer",
          isOpen ? "border-primary ring-2 ring-primary/10 text-primary bg-white dark:bg-slate-800" : "text-gray-700 dark:text-gray-300",
          !hasValue && "text-gray-400 dark:text-gray-500"
        )}
      >
        <CalendarIcon className={cn("w-4 h-4 shrink-0", hasValue ? "text-primary" : "text-gray-400 dark:text-gray-500")} />
        <span className="flex-1 text-left truncate">
          {getLabel()}
        </span>
        {showClear && hasValue && (
          <X 
            className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors" 
            onClick={handleClear}
          />
        )}
      </button>

      {isOpen && (
        <div className={cn(
          "absolute top-full left-0 mt-2 z-[100] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 p-3 animate-in fade-in zoom-in duration-200 origin-top-left nodrag",
          mode === 'range' && "min-w-[320px]"
        )}>
          <style>{`
            .rdp {
              --rdp-cell-size: 40px;
              --rdp-accent-color: var(--primary);
              --rdp-background-color: var(--primary-light);
              margin: 0;
            }
            .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
              background-color: var(--rdp-accent-color);
              color: white;
              font-weight: 600;
              border-radius: 8px;
            }
            .rdp-day_range_middle {
              background-color: var(--rdp-background-color);
              color: var(--rdp-accent-color);
              border-radius: 0;
            }
            .rdp-day_range_start {
              border-top-right-radius: 0;
              border-bottom-right-radius: 0;
            }
            .rdp-day_range_end {
              border-top-left-radius: 0;
              border-bottom-left-radius: 0;
            }
            .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
              background-color: var(--rdp-background-color);
              border-radius: 8px;
            }
            .rdp-day_today {
              color: var(--rdp-accent-color);
              font-weight: 800;
              text-decoration: underline;
              text-underline-offset: 4px;
            }
            .rdp-head_cell {
              font-size: 0.75rem;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
            }
            .rdp-nav_button {
              color: #4b5563;
              border-radius: 6px;
            }
            .rdp-nav_button:hover {
              background-color: #f3f4f6;
            }
            .dark .rdp-nav_button:hover {
              background-color: #334155;
            }
            .rdp-caption_label {
              font-size: 0.875rem;
              font-weight: 600;
              color: #111827;
            }
            .dark .rdp-caption_label {
              color: #f1f5f9;
            }
            .dark .rdp-day {
              color: #94a3b8;
            }
            .dark .rdp-day_selected {
              color: white;
            }
          `}</style>
          <DayPicker
            mode={mode as any}
            selected={selectedDate as any}
            onSelect={handleSelect}
            locale={tr}
            showOutsideDays
            className="border-none"
          />
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700 flex justify-between">
            <button 
              onClick={(e) => { e.stopPropagation(); handleSelect(new Date()); }}
              className="text-xs font-medium text-primary hover:text-primary-hover px-2 py-1 rounded hover:bg-primary-light dark:hover:bg-primary/10 transition-colors"
            >
              Bugün
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
