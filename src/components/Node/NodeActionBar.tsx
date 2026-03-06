import React from 'react';
import { Power, Trash2, Palette } from 'lucide-react';
import { cn } from '../../utils/cn';

interface NodeActionBarProps {
  isActive: boolean;
  onToggleActive: (e: React.MouseEvent) => void;
  onDeleteClick: (e: React.MouseEvent) => void;
  onColorPickerToggle: (e: React.MouseEvent) => void;
  showColorPicker: boolean;
  onColorSelect: (colorClass: string) => void;
  currentColor: string;
  colors: { id: string; class: string }[];
}

export const NodeActionBar: React.FC<NodeActionBarProps> = ({
  isActive,
  onToggleActive,
  onDeleteClick,
  onColorPickerToggle,
  showColorPicker,
  onColorSelect,
  currentColor,
  colors
}) => {
  return (
    <div className="absolute -top-10 left-0 flex items-center gap-1 opacity-0 group-hover/node:opacity-100 transition-opacity z-10 bg-white border border-gray-200 rounded-md shadow-sm p-1">
      <button 
        onClick={onToggleActive}
        className={cn(
          "p-1.5 rounded transition-colors",
          isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100 hover:text-gray-900"
        )} 
        title={isActive ? "Pasif Yap" : "Aktif Yap"}
      >
        <Power className="w-4 h-4" />
      </button>
      <button 
        onClick={onDeleteClick}
        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
        title="Sil"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <div className="relative">
        <button 
          onClick={onColorPickerToggle}
          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors" 
          title="Renk Seç"
        >
          <Palette className="w-4 h-4" />
        </button>
        
        {showColorPicker && (
          <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 shadow-lg rounded-lg p-2 flex gap-1 z-50">
            {colors.map(c => (
              <button
                key={c.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onColorSelect(c.class);
                }}
                className={cn(
                  "w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform",
                  c.class,
                  currentColor === c.class ? "ring-2 ring-indigo-500 ring-offset-1" : ""
                )}
                title="Renk Seç"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
