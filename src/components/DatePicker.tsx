import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';
import { 
  format, 
  parseISO, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  startOfWeek, 
  endOfWeek 
} from 'date-fns';
import { tr } from 'date-fns/locale';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  disabled?: boolean;
}

export default function DatePicker({ value, onChange, disabled }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const today = new Date();
  const currentValue = value ? parseISO(value) : today;
  
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(currentValue));

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

  const handleDateClick = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStarts: 1 }); // Monday
  const endDate = endOfWeek(monthEnd, { weekStarts: 1 }); // Sunday

  const dateFormat = "dd.MM.yyyy";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setCurrentMonth(startOfMonth(value ? parseISO(value) : today));
            }
          }
        }}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
          disabled ? "cursor-not-allowed opacity-70" : "hover:bg-gray-200 cursor-pointer",
          isOpen ? "bg-indigo-50 text-indigo-700" : "text-gray-700"
        )}
      >
        <CalendarIcon className="w-3.5 h-3.5" />
        <span className="text-sm font-medium">
          {value ? format(parseISO(value), dateFormat) : format(today, dateFormat)}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden nodrag cursor-default p-3">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-sm font-semibold text-gray-900 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: tr })}
            </div>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-[10px] font-semibold text-gray-400 uppercase">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, dayIdx) => {
              const isSelected = isSameDay(day, currentValue);
              const isToday = isSameDay(day, today);
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={day.toString()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDateClick(day);
                  }}
                  className={cn(
                    "h-8 w-full rounded-md text-xs flex items-center justify-center transition-colors",
                    !isCurrentMonth && "text-gray-300",
                    isCurrentMonth && !isSelected && "text-gray-700 hover:bg-gray-100",
                    isSelected && "bg-indigo-500 text-white font-medium shadow-sm hover:bg-indigo-600",
                    isToday && !isSelected && "text-indigo-600 font-bold bg-indigo-50"
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
