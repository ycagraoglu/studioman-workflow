import React from 'react';
import { Edit2, Check } from 'lucide-react';
import DatePicker from '../DatePicker';
import TimePicker from '../TimePicker';

interface NodeHeaderProps {
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  isEditing: boolean;
  onDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onToggleEditing: () => void;
}

export const NodeHeader: React.FC<NodeHeaderProps> = ({
  date,
  startTime,
  endTime,
  isActive,
  isEditing,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onToggleEditing
}) => {
  return (
    <div className="p-3 border-b border-black/5 flex flex-col gap-2 bg-black/5 rounded-t-xl">
      <div className="flex justify-between items-center">
        <DatePicker 
          value={date} 
          onChange={onDateChange} 
          disabled={!isActive}
        />
        <button onClick={onToggleEditing} className="text-gray-400 hover:text-indigo-600 transition-colors">
          {isEditing ? <Check className="w-4 h-4 text-emerald-500" /> : <Edit2 className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex items-center gap-1 text-gray-400 text-xs">
        <TimePicker 
          value={startTime || '09:00'} 
          onChange={onStartTimeChange} 
          disabled={!isActive}
        />
        <span>-</span>
        <TimePicker 
          value={endTime || '10:00'} 
          onChange={onEndTimeChange} 
          disabled={!isActive}
        />
      </div>
    </div>
  );
};
