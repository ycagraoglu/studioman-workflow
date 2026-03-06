import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../utils/cn';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
}

export default function TimePicker({ value, onChange, disabled }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'hours' | 'minutes'>('hours');
  const popoverRef = useRef<HTMLDivElement>(null);

  const [currentHour, currentMinute] = (value || '09:00').split(':');

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

  const handleHourClick = (hour: string) => {
    onChange(`${hour}:${currentMinute}`);
    setView('minutes');
  };

  const handleMinuteClick = (minute: string) => {
    onChange(`${currentHour}:${minute}`);
    setIsOpen(false);
    // Reset view for next time it opens
    setTimeout(() => setView('hours'), 300);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            setIsOpen(!isOpen);
            setView('hours');
          }
        }}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
          disabled ? "cursor-not-allowed opacity-70" : "hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer",
          isOpen ? "bg-primary/10 text-primary" : "text-gray-700 dark:text-gray-300"
        )}
      >
        <Clock className="w-3.5 h-3.5" />
        <span className="text-sm font-medium">{value || '09:00'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden nodrag cursor-default">
          <div className="flex border-b border-gray-100 dark:border-slate-700">
            <button
              className={cn(
                "flex-1 py-2 text-xs font-medium transition-colors",
                view === 'hours' ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700"
              )}
              onClick={(e) => { e.stopPropagation(); setView('hours'); }}
            >
              Saat
            </button>
            <button
              className={cn(
                "flex-1 py-2 text-xs font-medium transition-colors",
                view === 'minutes' ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700"
              )}
              onClick={(e) => { e.stopPropagation(); setView('minutes'); }}
            >
              Dakika
            </button>
          </div>

          <div className="p-3">
            {view === 'hours' ? (
              <div className="grid grid-cols-6 gap-1">
                {hours.map((h) => (
                  <button
                    key={h}
                    onClick={(e) => { e.stopPropagation(); handleHourClick(h); }}
                    className={cn(
                      "p-1.5 text-xs rounded-md transition-colors flex items-center justify-center",
                      currentHour === h 
                        ? "bg-primary text-white font-medium shadow-sm" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {minutes.map((m) => (
                  <button
                    key={m}
                    onClick={(e) => { e.stopPropagation(); handleMinuteClick(m); }}
                    className={cn(
                      "py-2 text-sm rounded-md transition-colors flex items-center justify-center",
                      currentMinute === m 
                        ? "bg-primary text-white font-medium shadow-sm" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
