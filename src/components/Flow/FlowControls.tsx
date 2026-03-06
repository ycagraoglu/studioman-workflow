import React from 'react';
import { Panel, useReactFlow } from '@xyflow/react';
import { 
  ArrowLeft, FileText, Loader2, Map, LayoutGrid, Copy, 
  Maximize, ZoomIn, ZoomOut, RotateCcw, Eraser, Plus, Search, Save, PanelRight 
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface FlowControlsProps {
  onBack: () => void;
  workflowName: string;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  showMiniMap: boolean;
  onToggleMiniMap: () => void;
  onLayout: () => void;
  onDuplicate: () => void;
  onClear: () => void;
  onSave: () => void;
  onShowTemplateModal: () => void;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onAddNewNode: () => void;
}

export const FlowControls: React.FC<FlowControlsProps> = ({
  onBack,
  workflowName,
  isSaving,
  hasUnsavedChanges,
  showMiniMap,
  onToggleMiniMap,
  onLayout,
  onDuplicate,
  onClear,
  onSave,
  onShowTemplateModal,
  isDrawerOpen,
  onToggleDrawer,
  onAddNewNode
}) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <>
      {/* Top Left Controls */}
      <Panel position="top-left" className="flex items-center gap-3 mt-4 ml-4">
        <button 
          onClick={onBack} 
          className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="İş Akışlarına Dön"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm px-4 py-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-semibold text-gray-800 dark:text-slate-200 truncate max-w-[100px] sm:max-w-[200px]">{workflowName}</span>
        </div>
        { (isSaving || hasUnsavedChanges) && (
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm px-3 py-2 flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span className="hidden min-[450px]:inline">Kaydediliyor...</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="hidden min-[450px]:inline">Kaydedilmemiş</span>
              </>
            )}
          </div>
        )}
      </Panel>

      {/* Bottom Left Controls */}
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

      {/* Top Right Controls */}
      <Panel position="top-right" className="flex flex-col gap-2 mt-4 mr-4">
        <button 
          onClick={onAddNewNode}
          className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="Yeni İş Ekle"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button 
          className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="Ara"
        >
          <Search className="w-5 h-5" />
        </button>
        <button 
          onClick={onSave}
          disabled={isSaving}
          className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
          title="İş Akışını Kaydet"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Save className="w-5 h-5" />}
        </button>
        <button 
          onClick={onShowTemplateModal}
          className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="Şablon Olarak Kaydet"
        >
          <FileText className="w-5 h-5" />
        </button>
        <button 
          onClick={onToggleDrawer}
          className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
          title={isDrawerOpen ? "Paneli Kapat" : "Paneli Aç"}
        >
          <PanelRight className="w-5 h-5" />
        </button>
      </Panel>
    </>
  );
};
