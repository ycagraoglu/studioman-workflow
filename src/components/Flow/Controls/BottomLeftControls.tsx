import React from 'react';
import { Panel, useReactFlow } from '@xyflow/react';
import { Map, LayoutGrid, Copy, Maximize, ZoomIn, ZoomOut, RotateCcw, Eraser } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface BottomLeftControlsProps {
  showMiniMap: boolean;
  onToggleMiniMap: () => void;
  onLayout: () => void;
  onDuplicate: () => void;
  onClear: () => void;
}

export const BottomLeftControls: React.FC<BottomLeftControlsProps> = ({
  showMiniMap,
  onToggleMiniMap,
  onLayout,
  onDuplicate,
  onClear,
}) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <Panel position="bottom-left" className="flex gap-2 mb-4 ml-4">
      <button 
        onClick={onToggleMiniMap} 
        className={cn(
          "w-10 h-10 border rounded-lg shadow-sm flex items-center justify-center transition-colors",
          showMiniMap 
            ? 'bg-primary-light dark:bg-primary/10 border-primary/20 dark:border-primary/20 text-primary hover:bg-primary-light/80' 
            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
        )}
        title={showMiniMap ? "Haritayı Gizle" : "Haritayı Göster"}
      >
        <Map className="w-5 h-5" />
      </button>
      <div className="w-px h-10 bg-gray-200 dark:bg-slate-700 mx-1" />
      <button 
        onClick={onLayout} 
        className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-primary hover:bg-primary-light dark:hover:bg-primary/10 transition-colors"
        title="Otomatik Düzenle"
      >
        <LayoutGrid className="w-5 h-5" />
      </button>
      <button 
        onClick={onDuplicate} 
        className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        title="Seçili Olanları Çoğalt"
      >
        <Copy className="w-5 h-5" />
      </button>
      <div className="w-px h-10 bg-gray-200 dark:bg-slate-700 mx-1" />
      <button 
        onClick={() => fitView({ duration: 800 })} 
        className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        title="Ekrana Sığdır"
      >
        <Maximize className="w-5 h-5" />
      </button>
      <button 
        onClick={() => zoomIn({ duration: 800 })} 
        className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        title="Yakınlaştır"
      >
        <ZoomIn className="w-5 h-5" />
      </button>
      <button 
        onClick={() => zoomOut({ duration: 800 })} 
        className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        title="Uzaklaştır"
      >
        <ZoomOut className="w-5 h-5" />
      </button>
      <button 
        onClick={() => fitView({ duration: 800, padding: 0.2, minZoom: 1, maxZoom: 1 })} 
        className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        title="Yakınlaştırmayı Sıfırla (100%)"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
      <button 
        onClick={onClear} 
        className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        title="Tümünü Temizle"
      >
        <Eraser className="w-5 h-5" />
      </button>
    </Panel>
  );
};
